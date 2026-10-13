const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const Note = require("../models/Note");
const upload = require("../middleware/upload");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { generateFallbackQuizQuestions } = require("../config/aiFallback");

// ─── GET /api/user/profile ────────────────────────────────────────────────────
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── PUT /api/user/profile ────────────────────────────────────────────────────
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, studyGoalHours } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (studyGoalHours) updates.studyGoalHours = parseInt(studyGoalHours);

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "Profile updated ✅", user });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌", error: error.message });
  }
});

// ─── PUT /api/user/change-password ───────────────────────────────────────────
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords required ❌" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters ❌" });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is wrong ❌" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully ✅" });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── POST /api/user/upload-note ───────────────────────────────────────────────
// Upload a PDF/note
router.post("/upload-note", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded ❌" });
    }

    const { title, subject } = req.body;
    let extractedText = "";

    // Extract text from PDF or text file
    if (
      req.file.mimetype === "application/pdf" ||
      req.file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = (pdfData.text || "").substring(0, 50000);
      } catch (err) {
        console.warn("PDF text parse warning:", err.message);
      }
    } else if (req.file.mimetype.startsWith("text/")) {
      try {
        extractedText = fs.readFileSync(req.file.path, "utf-8").substring(0, 50000);
      } catch (err) {}
    }

    const note = await Note.create({
      user: req.user._id,
      title: title || req.file.originalname,
      subject: subject || "General",
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      extractedText,
    });

    res.status(201).json({
      message: "Note uploaded successfully ✅",
      note: {
        _id: note._id,
        title: note.title,
        subject: note.subject,
        originalName: note.originalName,
        fileSize: note.fileSize,
        createdAt: note.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed ❌", error: error.message });
  }
});

// ─── GET /api/user/notes ──────────────────────────────────────────────────────
router.get("/notes", protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-extractedText");

    res.json({ notes });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── DELETE /api/user/notes/:id ───────────────────────────────────────────────
router.delete("/notes/:id", protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found ❌" });
    }

    // Delete physical file
    const filePath = path.join(__dirname, "../uploads", note.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await note.deleteOne();
    res.json({ message: "Note deleted ✅" });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── POST /api/user/notes/:id/generate-quiz ───────────────────────────────────
// Generate quiz from uploaded note using AI
router.post("/notes/:id/generate-quiz", protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found ❌" });
    }

    const { count = 5 } = req.body;
    const num = Math.max(1, Math.min(parseInt(count) || 5, 20));

    // Try Groq if configured
    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("your_groq_api_key")) {
      try {
        const textSample = (note.extractedText || note.title).substring(0, 8000);
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              max_tokens: 2500,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a CS exam question generator. Respond with valid JSON only.",
                },
                {
                  role: "user",
                  content: `Generate ${num} multiple choice questions about "${note.title}" in the subject "${note.subject}".
Reference Text from Note:
${textSample}

Return ONLY a JSON array:
[{"question":"...","options":["A)...","B)...","C)...","D)..."],"correctAnswer":"A)...","explanation":"..."}]`,
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          let content = data.choices[0].message.content.trim();
          content = content.replace(/```json|```/g, "").trim();
          const questions = JSON.parse(content);
          if (Array.isArray(questions) && questions.length > 0) {
            return res.json({
              message: "Questions generated from note ✅",
              questions,
              note: { title: note.title, subject: note.subject },
            });
          }
        }
      } catch (groqErr) {
        console.warn("Groq note quiz error, using fallback:", groqErr.message);
      }
    }

    // High quality offline fallback
    const questions = generateFallbackQuizQuestions(note.subject, note.title, num);
    res.json({
      message: "Questions generated from note ✅",
      questions,
      note: { title: note.title, subject: note.subject },
    });
  } catch (error) {
    console.error("Note quiz gen error:", error);
    const questions = generateFallbackQuizQuestions("General", "Note", 5);
    res.json({
      message: "Questions generated from note ✅",
      questions,
      note: { title: "Note", subject: "General" },
    });
  }
});

module.exports = router;
