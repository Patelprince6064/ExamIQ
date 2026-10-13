const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const QuizResult = require("../models/QuizResult");
const User = require("../models/User");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

// ─── POST /api/quiz/generate ──────────────────────────────────────────────────
// Generate AI quiz questions for a given subject/topic
// Generates in token-aware batches so requests always fit the Groq free-tier
// TPM limit (6000/min) and single responses never truncate mid-JSON.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function groqQuestions(prompt, maxTokens) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: maxTokens,
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content:
              "You are a CS exam question generator. Always respond with valid JSON only, no extra text.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (response.ok) {
      return await response.json();
    }

    if (response.status === 429) {
      const err = await response.json().catch(() => ({}));
      const match = err?.error?.message?.match(/in (\d+(?:\.\d+)?)s/);
      const retryAfter = match ? parseFloat(match[1]) : 20;
      console.log(`Groq rate limited — retrying in ${Math.round(retryAfter)}s`);
      await sleep(retryAfter * 1000);
      continue;
    }

    console.error("Groq quiz error:", await response.text());
    throw new Error("AI service error");
  }
  throw new Error("AI service rate limited, please retry in a minute");
}

const {
  generateFallbackQuizQuestions,
  generateFallbackDescriptiveQuestions,
  generateWeakTopicIntelligence,
} = require("../config/aiFallback");

router.post("/generate", protect, async (req, res) => {
  const { subject, topic, count = 5, difficulty = "medium" } = req.body;

  if (!subject) {
    return res.status(400).json({ message: "Subject is required ❌" });
  }

  const num = Math.max(1, Math.min(parseInt(count) || 5, 30));

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_groq_api_key")) {
    const questions = generateFallbackQuizQuestions(subject, topic, num, difficulty);
    return res.json({
      questions,
      subject,
      topic: topic || subject,
      count: questions.length,
    });
  }

  try {
    // Token-aware batching: keep each call well under the 6000 TPM budget.
    const batchSize = num > 10 ? Math.ceil(num / 2) : num;
    const maxTokens = Math.min(3000, 300 + batchSize * 220);
    const batches = Math.ceil(num / batchSize);
    const allQuestions = [];

    for (let b = 0; b < batches; b++) {
      const remaining = num - allQuestions.length;
      const batchCount = Math.min(batchSize, remaining);

      const prompt = `Generate exactly ${batchCount} multiple choice questions about "${topic || subject}" 
for a ${difficulty} difficulty CS exam.`;

      const data = await groqQuestions(prompt, batchCount > 10 ? 3000 : maxTokens);
      let content = data.choices[0].message.content.trim();
      content = content.replace(/```json|```/g, "").trim();

      let batchQuestions;
      try {
        batchQuestions = JSON.parse(content);
      } catch (parseErr) {
        console.error("JSON parse error (batch):", content.slice(0, 300));
        break;
      }

      if (Array.isArray(batchQuestions)) {
        allQuestions.push(...batchQuestions);
      }
    }

    if (allQuestions.length === 0) {
      const questions = generateFallbackQuizQuestions(subject, topic, num, difficulty);
      return res.json({
        questions,
        subject,
        topic: topic || subject,
        count: questions.length,
      });
    }

    res.json({
      questions: allQuestions.slice(0, num),
      subject,
      topic: topic || subject,
      count: allQuestions.length,
    });
  } catch (error) {
    console.error("Quiz generate error:", error.message);
    const questions = generateFallbackQuizQuestions(subject, topic, num, difficulty);
    res.json({
      questions,
      subject,
      topic: topic || subject,
      count: questions.length,
    });
  }
});

// ─── POST /api/quiz/descriptive ───────────────────────────────────────────────
// Generate descriptive (theory) exam questions for a topic
router.post("/descriptive", protect, async (req, res) => {
  try {
    const { subject, topic, count = 5 } = req.body;

    if (!subject) {
      return res.status(400).json({ message: "Subject is required ❌" });
    }

    const num = Math.max(1, Math.min(parseInt(count) || 5, 20));

    // If Groq is not configured, immediately use offline descriptive questions
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_groq_api_key")) {
      const questions = generateFallbackDescriptiveQuestions(subject, topic, num);
      return res.json({ questions, subject, topic: topic || subject });
    }

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: num > 10 ? 6000 : 3000,
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content:
                "You are a CS university exam question setter. Always respond with valid JSON only, no extra text.",
            },
            {
              role: "user",
              content: `Generate exactly ${num} descriptive / theory exam questions about "${topic || subject}" for a ${subject} university paper.

Return ONLY a valid JSON array (no extra text, no markdown) in this exact format:
[
  {
    "question": "Full descriptive question text?",
    "marks": 5,
    "answer": "Concise model answer with the key points a student must write.",
    "topic": "${topic || subject}"
  }
]`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let content = data.choices[0].message.content.trim();
        content = content.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ questions: parsed, subject, topic: topic || subject });
        }
      }
    } catch (groqErr) {
      console.error("Groq descriptive error, falling back to local pool:", groqErr.message);
    }

    // Fallback if Groq call failed or returned empty
    const questions = generateFallbackDescriptiveQuestions(subject, topic, num);
    return res.json({ questions, subject, topic: topic || subject });
  } catch (error) {
    console.error("Descriptive generate error:", error);
    const questions = generateFallbackDescriptiveQuestions(req.body.subject, req.body.topic, 5);
    res.json({ questions, subject: req.body.subject, topic: req.body.topic });
  }
});

// ─── POST /api/quiz/submit ────────────────────────────────────────────────────
// Submit quiz answers and save results
router.post("/submit", protect, async (req, res) => {
  try {
    const { subject, topic, questions, timeTaken, mode } = req.body;

    if (!subject || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid quiz data ❌" });
    }

    const correctAnswers = questions.filter((q) => q.isCorrect).length;
    const score = Math.round((correctAnswers / questions.length) * 100);

    // Save quiz result
    const quizResult = await QuizResult.create({
      user: req.user._id,
      subject,
      topic: topic || subject,
      questions,
      score,
      totalQuestions: questions.length,
      correctAnswers,
      timeTaken: timeTaken || 0,
      mode: mode || "ai-generated",
    });

    // Update user stats
    const user = await User.findById(req.user._id);
    user.stats.testsTaken += 1;
    user.stats.totalCorrect += correctAnswers;
    user.stats.totalQuestions += questions.length;
    await user.save();

    // Fetch all past quiz results to calculate subject-wise performance
    const allResults = await QuizResult.find({ user: req.user._id });
    const subjectStats = {};
    allResults.forEach((r) => {
      if (!subjectStats[r.subject]) subjectStats[r.subject] = { correct: 0, total: 0 };
      subjectStats[r.subject].correct += r.correctAnswers;
      subjectStats[r.subject].total += r.totalQuestions;
    });

    let subjectScoresStr = "";
    const subjectScores = [];
    for (const [sub, stats] of Object.entries(subjectStats)) {
      const pct = Math.round((stats.correct / stats.total) * 100);
      subjectScoresStr += `${sub}: ${pct}%\n`;
      subjectScores.push({ subject: sub, score: pct });
    }

    // Compute wrong questions and weak topics first
    const wrongQuestions = questions.filter((q) => !q.isCorrect);
    const weakTopics = Array.from(new Set(wrongQuestions.map((q) => q.topic || topic || subject)));

    // AI feedback on performance (Weak Topic Intelligence)
    let feedback = "";
    let parsed = null;

    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("your_groq_api_key")) {
      try {
        const feedbackRes = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            max_tokens: 600,
            messages: [
              {
                role: "system",
                content: `You are an AI Exam Prep Tutor providing 'Weak Topic Intelligence'.
You MUST respond ONLY with a valid JSON object. Do not include any markdown formatting, backticks, or conversational text. Use this exact schema:
{
  "subject": "The main subject or topic they are struggling with",
  "analysis": "2-3 sentences explaining exactly what concepts they missed from the wrong topics provided.",
  "recommended": ["Sub-topic 1", "Sub-topic 2", "Sub-topic 3"],
  "actionable_advice": "1-2 specific sentences on how to practice this",
  "study_time_hours": 3
}`,
              },
              {
                role: "user",
                content: `Student's overall performance:
${subjectScoresStr || "No past data."}

The student just scored ${score}% on a ${subject} quiz (Topic: ${topic || subject}).
Their wrong answers were related to these topics: ${weakTopics.join(", ") || "none"}.
Missed questions sample: ${wrongQuestions.map((q) => q.question).slice(0, 3).join(" | ")}.

Provide the JSON feedback.`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          const rawFeedback = feedbackData.choices[0].message.content;
          parsed = JSON.parse(rawFeedback);

          feedback = `🎯 Performance Summary: Score ${score}%
Identified Weak Area: ${parsed.subject || weakTopics[0] || topic || subject}

🔍 Detailed Analysis:
${parsed.analysis}

📚 Recommended Topics to Master:
${(parsed.recommended || []).map((t) => `• ${t}`).join("\n")}

💡 Actionable Practice Advice:
${parsed.actionable_advice}

⏱️ Recommended Study Time:
${parsed.study_time_hours || 3} hours this week dedicated to ${weakTopics.join(", ") || topic || subject}`;
        }
      } catch (e) {
        console.error("Groq feedback error:", e);
      }
    }

    // Fallback to domain-specific Weak Topic Intelligence if Groq is not configured or failed
    if (!feedback) {
      feedback = generateWeakTopicIntelligence(subject, topic, score, weakTopics, wrongQuestions);
    }

    res.json({
      message: "Quiz submitted ✅",
      result: {
        _id: quizResult._id,
        score,
        correctAnswers,
        totalQuestions: questions.length,
        timeTaken,
        subject,
        topic,
      },
      weakTopics,
      parsedFeedback: typeof parsed !== "undefined" ? parsed : null,
      subjectScores,
      feedback,
      updatedStats: user.stats,
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── GET /api/quiz/history ────────────────────────────────────────────────────
// Get user's quiz history
router.get("/history", protect, async (req, res) => {
  try {
    const { limit = 20, subject } = req.query;
    const filter = { user: req.user._id };
    if (subject) filter.subject = subject;

    const results = await QuizResult.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select("-questions");

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── GET /api/quiz/history/:id ────────────────────────────────────────────────
// Get detailed single quiz result
router.get("/history/:id", protect, async (req, res) => {
  try {
    const result = await QuizResult.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!result) {
      return res.status(404).json({ message: "Quiz result not found ❌" });
    }

    res.json({ result });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── GET /api/quiz/weak-topics ────────────────────────────────────────────────
// Identify weak topics based on quiz history
router.get("/weak-topics", protect, async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id });

    if (results.length === 0) {
      return res.json({ weakTopics: [] });
    }

    // Aggregate topic-level accuracy
    const topicMap = {};
    results.forEach((result) => {
      result.questions.forEach((q) => {
        const key = `${q.topic || result.topic}||${result.subject}`;
        if (!topicMap[key]) {
          topicMap[key] = { correct: 0, total: 0, subject: result.subject };
        }
        topicMap[key].total += 1;
        if (q.isCorrect) topicMap[key].correct += 1;
      });
    });

    const weakTopics = Object.entries(topicMap)
      .map(([key, val]) => ({
        topic: key.split("||")[0],
        subject: val.subject,
        accuracy: Math.round((val.correct / val.total) * 100),
        attempted: val.total,
      }))
      .filter((t) => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);

    res.json({ weakTopics });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;
