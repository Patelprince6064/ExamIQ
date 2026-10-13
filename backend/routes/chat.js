const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  generateFallbackChatResponse,
  generateFallbackExplainResponse,
  generateFallbackStudyPlan,
  generateFallbackRoadmap,
} = require("../config/aiFallback");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

/**
 * Clean AI responses:
 * 1. Remove raw markdown hashes (###, ##, #) from headers and text.
 * 2. Ensure clear bold formatting and clean presentation.
 */
const cleanAIResponse = (text) => {
  if (!text) return "";
  return text
    // Replace leading markdown hashes like ### Header or ## Header with clean text
    .replace(/^#{1,6}\s*(.*)$/gm, "$1")
    // Remove any remaining stray hashes
    .replace(/###+/g, "")
    .trim();
};

// ─── POST /chat ───────────────────────────────────────────────────────────────
// Main AI tutor chat (used by AIPractice.js)
router.post("/", protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "Please provide a message ❌" });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_groq_api_key")) {
      const reply = generateFallbackChatResponse(message);
      return res.json({ reply: cleanAIResponse(reply) });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 3000,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are an expert Computer Science professor and tutor helping students prepare for college semester exams and technical interviews.
You specialize in: Data Structures & Algorithms (DSA), Operating Systems (OS), Database Management Systems (DBMS), Computer Networks (CN), and Artificial Intelligence (AI).

CRITICAL FORMATTING INSTRUCTIONS:
1. NEVER output markdown hash symbols (#, ##, ###, ####) for headings. Use clean bold headings (e.g. **Core Principles:** or 📌 Overview:) or numbered lists instead.
2. ALWAYS provide comprehensive, detailed, long-form answers suitable for university exams. Explain definitions, theoretical architecture, step-by-step algorithms, trade-offs, code or examples, and exam tips in full detail. Avoid brief, truncated, or superficial summaries.`,
          },
          {
            role: "user",
            content: message.trim(),
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      const reply = generateFallbackChatResponse(message);
      return res.json({ reply: cleanAIResponse(reply) });
    }

    const data = await response.json();
    const reply = cleanAIResponse(data.choices[0].message.content);

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    const reply = generateFallbackChatResponse(req.body.message || "");
    res.json({ reply: cleanAIResponse(reply) });
  }
});

// ─── POST /chat/explain ───────────────────────────────────────────────────────
// Explain a specific concept in detail
router.post("/explain", protect, async (req, res) => {
  try {
    const { topic, subject } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required ❌" });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_groq_api_key")) {
      const explanation = generateFallbackExplainResponse(topic, subject);
      return res.json({ explanation: cleanAIResponse(explanation) });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 3000,
        messages: [
          {
            role: "system",
            content:
              "You are an expert CS professor. Provide deep, long-form, comprehensive explanations for college exams. Do NOT use markdown hash symbols like ###, ##, # for headings; use bold text and clear sections instead.",
          },
          {
            role: "user",
            content: `Explain the topic: "${topic}" ${subject ? `from the subject ${subject}` : ""}. 
Include: comprehensive formal definition, core architectural principles, step-by-step working, code or mathematical example, key trade-offs/complexities, and common university exam questions with model answers.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const explanation = generateFallbackExplainResponse(topic, subject);
      return res.json({ explanation: cleanAIResponse(explanation) });
    }

    const data = await response.json();
    res.json({ explanation: cleanAIResponse(data.choices[0].message.content) });
  } catch (error) {
    const explanation = generateFallbackExplainResponse(req.body.topic || "", req.body.subject);
    res.json({ explanation: cleanAIResponse(explanation) });
  }
});

// ─── POST /chat/study-plan ────────────────────────────────────────────────────
// Generate a personalized study plan
router.post("/study-plan", protect, async (req, res) => {
  try {
    const user = req.user;
    const { startDate, examDate, weakTopics } = req.body;

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_groq_api_key")) {
      const studyPlan = generateFallbackStudyPlan(user, startDate, examDate);
      return res.json({ studyPlan: cleanAIResponse(studyPlan) });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 2500,
        messages: [
          {
            role: "system",
            content:
              "You are an expert academic advisor. Create comprehensive, detailed, day-by-day exam preparation study plans for computer science students. Do NOT use markdown hash symbols like ###, ##, # for headings.",
          },
          {
            role: "user",
            content: `Create a comprehensive study plan for a student with these details:
- Subjects: ${user.subjects?.join(", ") || "DSA, OS, DBMS, CN, AI"}
- Daily study goal: ${user.studyGoalHours || 5} hours
- Start date: ${startDate || "today"}
- Exam date: ${examDate || "in 2 weeks"}
- Weak topics: ${weakTopics?.join(", ") || "not specified"}
- Current accuracy: ${user.stats?.totalQuestions > 0 ? Math.round((user.stats.totalCorrect / user.stats.totalQuestions) * 100) : 0}%

Provide a day-by-day study plan from start date to exam date with specific subtopics, milestones, practice tests, and daily hour allocations.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const studyPlan = generateFallbackStudyPlan(user, startDate, examDate);
      return res.json({ studyPlan: cleanAIResponse(studyPlan) });
    }

    const data = await response.json();
    res.json({ studyPlan: cleanAIResponse(data.choices[0].message.content) });
  } catch (error) {
    const studyPlan = generateFallbackStudyPlan(req.user, req.body.startDate, req.body.examDate);
    res.json({ studyPlan: cleanAIResponse(studyPlan) });
  }
});

// ─── POST /chat/roadmap ────────────────────────────────────────────────────────
// Generate a step-by-step learning roadmap for a skill
router.post("/roadmap", protect, async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) {
      return res.status(400).json({ message: "Skill is required ❌" });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_groq_api_key")) {
      const roadmapData = generateFallbackRoadmap(skill);
      return res.json({ roadmap: roadmapData });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 2500,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You are an expert learning path advisor. You create highly structured, end-to-end roadmaps for learning new skills. You MUST respond ONLY with valid JSON. Do not include markdown tags like ```json or any other explanatory text.",
          },
          {
            role: "user",
            content: `Generate a comprehensive, end-to-end learning roadmap for the skill: "${skill}".`,
          },
        ],
      }),
    });

    if (!response.ok) {
       const roadmapData = generateFallbackRoadmap(skill);
       return res.json({ roadmap: roadmapData });
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    if (content.startsWith("```json")) {
       content = content.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (content.startsWith("```")) {
       content = content.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const roadmapData = JSON.parse(content);
    res.json({ roadmap: roadmapData });
  } catch (error) {
    const roadmapData = generateFallbackRoadmap(req.body.skill || "General CS");
    res.json({ roadmap: roadmapData });
  }
});

module.exports = router;
