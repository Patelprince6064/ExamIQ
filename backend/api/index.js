let app;
let initError = null;

try {
  app = require("../server");
} catch (err) {
  initError = err;
  console.error("Server init error:", err);
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      error: "Backend Initialization Error",
      message: initError.message,
      stack: initError.stack,
    });
  }
  try {
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      error: "Runtime Execution Error",
      message: err.message,
      stack: err.stack,
    });
  }
};
