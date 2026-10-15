let app;
let initError = null;

try {
  app = require("../server");
} catch (err) {
  initError = err;
  console.error("Server init error:", err);
}

module.exports = (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  if (initError) {
    return res.status(500).json({
      error: "Backend Initialization Error",
      message: isProd ? "Internal server error" : initError.message,
      ...(isProd ? {} : { stack: initError.stack }),
    });
  }
  try {
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      error: "Runtime Execution Error",
      message: isProd ? "Internal server error" : err.message,
      ...(isProd ? {} : { stack: err.stack }),
    });
  }
};
