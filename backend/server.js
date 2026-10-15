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
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser clients (no Origin header) and exact allowlist matches.
      // Also allow Vercel preview deployments of the same project.
      if (!origin) return callback(null, true);
      const clean = origin.replace(/\/+$/, "");
      const isAllowed =
        allowedOrigins.includes(clean) ||
        allowedOrigins.includes("*") ||
        /^https:\/\/examiq.*\.vercel\.app$/.test(clean) ||
        /^https:\/\/.*-examiq.*\.vercel\.app$/.test(clean);
      if (isAllowed) return callback(null, true);
      return callback(new Error("CORS: Origin not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Ensure DB is connected in serverless environments
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Database connection error in request:", err.message);
  }
  next();
});

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
  if (err.message === "CORS: Origin not allowed") {
    return res.status(403).json({ message: "Origin not allowed ❌" });
  }
  const status = err.status || 500;
  // Don't leak internal error details in production for 5xx errors
  const message =
    status >= 500 && process.env.NODE_ENV === "production"
      ? "Internal server error ❌"
      : err.message || "Internal server error ❌";
  res.status(status).json({ message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
