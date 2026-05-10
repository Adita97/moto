const logger = require("../config/logger");
const env = require("../config/env");

function errorHandler(err, req, res, _next) {
  logger.error({
    message: err.message,
    stack: env.NODE_ENV === "production" ? undefined : err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload too large" });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large" });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ error: "Unexpected file field" });
  }

  const status = err.status || 500;
  const message =
    env.NODE_ENV === "production" && status === 500
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
