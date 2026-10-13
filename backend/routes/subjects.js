const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const QuizResult = require("../models/QuizResult");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

// In-memory cache so repeated note requests don't re-hit Groq
const notesCache = new Map();

// YouTube search link for a topic — always relevant, opens instantly
const videoUrlFor = (subjectName, topic) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic} ${subjectName} lecture in depth`)}`;

// Predefined CS subjects and topics
const SUBJECTS = {
  DSA: {
    name: "Data Structures & Algorithms",
    icon: "🧩",
    topics: [
      "Arrays", "Linked Lists", "Stacks", "Queues",
      "Trees", "Binary Search Tree", "Graphs", "Hashing",
      "Sorting Algorithms", "Searching Algorithms", "Dynamic Programming",
      "Greedy Algorithms", "Recursion", "Heaps", "Tries",
    ],
  },
  OS: {
    name: "Operating Systems",
    icon: "💻",
    topics: [
      "Process Management", "Threads", "CPU Scheduling", "Deadlock",
      "Memory Management", "Virtual Memory", "Paging", "Segmentation",
      "File Systems", "I/O Management", "Semaphores", "Mutex",
      "Inter-process Communication", "Disk Scheduling",
    ],
  },
  DBMS: {
    name: "Database Management Systems",
    icon: "🗄️",
    topics: [
      "ER Model", "Relational Model", "SQL", "Joins",
      "Normalization", "Transactions", "ACID Properties", "Concurrency Control",
      "Indexing", "B-Trees", "Query Optimization", "NoSQL",
      "Stored Procedures", "Triggers",
    ],
  },
  CN: {
    name: "Computer Networks",
    icon: "🌐",
    topics: [
      "OSI Model", "TCP/IP", "HTTP/HTTPS", "DNS",
      "IP Addressing", "Subnetting", "Routing Protocols", "Switching",
      "TCP vs UDP", "Network Security", "Firewalls", "VPN",
      "Wireless Networks", "Socket Programming",
    ],
  },
  AI: {
    name: "Artificial Intelligence",
    icon: "🤖",
    topics: [
      "Search Algorithms", "BFS & DFS", "A* Algorithm", "Heuristics",
      "Machine Learning Basics", "Neural Networks", "Decision Trees",
      "Naive Bayes", "Clustering", "Regression", "NLP Basics",
      "Reinforcement Learning", "Expert Systems", "Knowledge Representation",
    ],
  },
  OOP: {
    name: "Object-Oriented Programming",
    icon: "👨‍💻",
    topics: [
      "Classes & Objects", "Inheritance", "Polymorphism", "Abstraction",
      "Encapsulation", "Constructors", "Interfaces", "Abstract Classes",
      "Method Overloading", "Method Overriding", "Exception Handling",
      "File Handling", "Collections", "OOP Design Principles",
    ],
  },
  SE: {
    name: "Software Engineering",
    icon: "📐",
    topics: [
      "SDLC Models", "Agile Methodology", "Requirements Engineering",
      "Software Design", "UML Diagrams", "Design Patterns", "Software Testing",
      "Maintenance", "Project Management", "Quality Assurance",
      "Version Control", "CI/CD Basics", "Software Metrics", "Risk Management",
    ],
  },
  TOC: {
    name: "Theory of Computation",
    icon: "🔤",
    topics: [
      "Finite Automata", "DFA & NFA", "Regular Expressions", "Context-Free Grammars",
      "Pushdown Automata", "Turing Machines", "Pumping Lemma",
      "Decidability", "Undecidability", "Complexity Classes",
      "Chomsky Hierarchy", "Recursive Languages", "NP-Completeness", "Halting Problem",
    ],
  },
  CD: {
    name: "Compiler Design",
    icon: "⚙️",
    topics: [
      "Lexical Analysis", "Parsing", "Top-Down Parsing", "Bottom-Up Parsing",
      "Syntax Trees", "Intermediate Code Generation", "Symbol Tables",
      "Code Optimization", "Code Generation", "Error Handling",
      "Semantic Analysis", "Type Checking", "LL Parsing", "LR Parsing",
    ],
  },
  ML: {
    name: "Machine Learning",
    icon: "📈",
    topics: [
      "Supervised Learning", "Unsupervised Learning", "Linear Regression",
      "Logistic Regression", "Support Vector Machines", "K-Nearest Neighbors",
      "K-Means Clustering", "Feature Engineering", "Model Evaluation",
      "Overfitting & Regularization", "Ensemble Methods", "Gradient Descent",
      "Cross Validation", "Classification Metrics",
    ],
  },
  CC: {
    name: "Cloud Computing",
    icon: "☁️",
    topics: [
      "Cloud Architecture", "IaaS PaaS SaaS", "Virtualization", "Containerization",
      "Docker Basics", "Kubernetes Basics", "Load Balancing", "Auto Scaling",
      "Serverless Computing", "Cloud Storage", "Cloud Security",
      "Service Models", "Deployment Models", "DevOps & Cloud",
    ],
  },
};

// ─── GET /api/subjects ────────────────────────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get quiz counts per subject for this user
    const quizCounts = await QuizResult.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: "$subject", count: { $sum: 1 }, avgScore: { $avg: "$score" } } },
    ]);

    const countMap = {};
    quizCounts.forEach((q) => {
      countMap[q._id] = {
        quizzesTaken: q.count,
        avgScore: Math.round(q.avgScore),
      };
    });

    const subjects = Object.entries(SUBJECTS).map(([key, val]) => ({
      code: key,
      name: val.name,
      icon: val.icon,
      topics: val.topics.map((t) => ({ name: t, videoUrl: videoUrlFor(val.name, t) })),
      isEnrolled: user.subjects.includes(key),
      ...(countMap[key] || { quizzesTaken: 0, avgScore: 0 }),
    }));

    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── GET /api/subjects/:code/topics ──────────────────────────────────────────
router.get("/:code/topics", protect, (req, res) => {
  const subject = SUBJECTS[req.params.code.toUpperCase()];
  if (!subject) {
    return res.status(404).json({ message: "Subject not found ❌" });
  }
  res.json({
    subject: req.params.code.toUpperCase(),
    topics: subject.topics.map((t) => ({ name: t, videoUrl: videoUrlFor(subject.name, t) })),
  });
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateFallbackNotes = (topic, subjectName) => `
## 1. Introduction — ${topic}
**${topic}** is a core concept in **${subjectName}**. Understanding ${topic} is essential for mastering university-level exams, theoretical foundations, and practical problem-solving.

## 2. Key Concepts & Definitions
- **Primary Objective**: Provide standard methods and structures for handling ${topic}.
- **Core Mechanism**: Utilizes standard algorithmic steps and architectural rules to process data efficiently.
- **Key Terms**:
  - **Component A**: Core processing unit for ${topic}.
  - **Optimization**: Strategy to minimize time and space complexity.

## 3. Detailed Explanation & Working
1. **Initialization**: Set up required structures and state parameters.
2. **Execution**: Apply transformation and computation logic for ${topic}.
3. **Verification**: Check constraints, edge cases, and output validity.

## 4. Common Exam Questions & Answers
**Q1: Explain the purpose of ${topic} in ${subjectName}.**
*Answer*: ${topic} handles core computations and operations required for structural efficiency and predictable execution.

**Q2: What are the main advantages and trade-offs of ${topic}?**
*Answer*: It offers high modularity and clarity, though performance depends on input size and environmental constraints.

## 5. Quick Revision Summary
- Always check base conditions and edge cases for ${topic}.
- Remember standard time and space complexities during exam calculations.
- Practice drawing system diagrams for university exams.
`.trim();

// ─── POST /api/subjects/:code/notes ───────────────────────────────────────────
// Generate detailed study notes for a topic using Groq AI
router.post("/:code/notes", protect, async (req, res) => {
  try {
    const subjectCode = req.params.code.toUpperCase();
    const { topic, subjectName } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: "Topic is required ❌" });
    }

    const fullSubjectName = subjectName || (SUBJECTS[subjectCode] ? SUBJECTS[subjectCode].name : subjectCode);
    const cacheKey = `${subjectCode}||${topic.trim().toLowerCase()}`;

    if (notesCache.has(cacheKey)) {
      return res.json({ notes: notesCache.get(cacheKey), topic: topic.trim(), subject: subjectCode });
    }

    let notes = null;

    // Retry loop for Groq AI
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            max_tokens: 3000,
            temperature: 0.5,
            messages: [
              {
                role: "system",
                content:
                  "You are an expert CS tutor writing detailed exam-preparation notes. Respond ONLY with the notes content using clean markdown formatting (## headings, bullet points, **bold** key terms). No preamble, no closing remarks.",
              },
              {
                role: "user",
                content: `Write COMPLETE, detailed and well-structured exam notes for the topic: "${topic.trim()}" from the subject: ${fullSubjectName}.

The notes MUST include these sections (use markdown):
## 1. Introduction — what the topic is and why it matters
## 2. Key Concepts — every important term, definition and idea, explained clearly
## 3. Detailed Explanation — step-by-step working with examples (use numbered steps where useful)
## 4. Common Exam Questions — 4 to 6 likely exam questions with short model answers
## 5. Quick Revision Summary — bullet point recap

Be thorough and exam-oriented. Students will use ONLY these notes to prepare for university exams.`,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          notes = data.choices[0]?.message?.content?.trim();
          if (notes) break;
        }

        if (response.status === 429) {
          const err = await response.json().catch(() => ({}));
          const match = err?.error?.message?.match(/in (\d+(?:\.\d+)?)s/);
          const retryAfter = match ? parseFloat(match[1]) : 15;
          console.log(`Groq notes rate limited — retrying in ${Math.round(retryAfter)}s`);
          await sleep(retryAfter * 1000);
          continue;
        }
      } catch (err) {
        console.error("Groq fetch attempt failed:", err.message);
      }
    }

    if (!notes) {
      console.log("Using fallback exam notes generator for topic:", topic);
      notes = generateFallbackNotes(topic.trim(), fullSubjectName);
    }

    notesCache.set(cacheKey, notes);
    res.json({ notes, topic: topic.trim(), subject: subjectCode });
  } catch (error) {
    console.error("Notes generation error:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── PUT /api/subjects/enroll ─────────────────────────────────────────────────
// Update user's enrolled subjects
router.put("/enroll", protect, async (req, res) => {
  try {
    const { subjects } = req.body;

    if (!Array.isArray(subjects)) {
      return res.status(400).json({ message: "Subjects must be an array ❌" });
    }

    const validSubjects = subjects.filter((s) => SUBJECTS[s.toUpperCase()]);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { subjects: validSubjects.map((s) => s.toUpperCase()) },
      { new: true }
    );

    res.json({
      message: "Subjects updated ✅",
      subjects: user.subjects,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;
