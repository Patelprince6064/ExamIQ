const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token ❌" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === "production") {
        console.error("FATAL: JWT_SECRET is not set in production");
        return res.status(500).json({ message: "Server configuration error ❌" });
      }
      console.warn("WARNING: JWT_SECRET not set — using insecure dev fallback");
    }
    const decoded = jwt.verify(token, secret || "ai_exam_prep_secret_key_2026");
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found ❌" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired ❌" });
  }
};

module.exports = { protect };
