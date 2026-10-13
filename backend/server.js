require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const quizRoutes = require("./routes/quiz");
const progressRoutes = require("./routes/progress");
const subjectRoutes = require("./routes/subjects");
const analyticsRoutes = require("./routes/analytics");
const userRoutes = require("./routes/user");
const paperRoutes = require("./routes/paper");

const app = express();
app.set("trust proxy", 1);

// ─── Connect Database ───────────────────────────────────────────────────────
connectDB();

// ─── Security & Middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(morgan("dev"));

app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { message: "Too many AI requests, slow down." },
});
app.use("/chat", aiLimiter);
app.use("/api/quiz", aiLimiter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "✅ AI Exam Prep Backend Running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/paper", paperRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found ❌" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File is too large. Maximum supported file size is 50 MB.",
    });
  }
  res.status(err.status || 500).json({
    message: err.message || "Internal server error ❌",
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
