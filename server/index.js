const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const env = require("./config/env");
const logger = require("./config/logger");
const { initDb } = require("./config/db");
const { cleanExpiredTokens } = require("./services/token.service");
const { uploadsDir, bikePhotosDir } = require("./services/upload.service");

const authRoutes = require("./routes/auth.routes");
const videosRoutes = require("./routes/videos.routes");
const bikesRoutes = require("./routes/bikes.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https://images.unsplash.com",
          "https://img.youtube.com",
          "https://*.ytimg.com",
        ],
        frameSrc: [
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
        ],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS
app.use(
  cors({
    origin: env.ALLOWED_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);

// Parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb", extended: false }));
app.use(cookieParser());

// Logging
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }),
);

// Serve thumbnails with cache headers
app.use(
  "/uploads/thumbnails",
  express.static(uploadsDir, {
    maxAge: "365d",
    immutable: true,
  }),
);

// Serve bike photos with cache headers
app.use(
  "/uploads/bike-photos",
  express.static(bikePhotosDir, {
    maxAge: "365d",
    immutable: true,
  }),
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/bikes", bikesRoutes);

// Serve client build in production
const clientDist = path.resolve(__dirname, "../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

// Error handler (last)
app.use(errorHandler);

// Clean expired tokens periodically (every hour)
setInterval(cleanExpiredTokens, 60 * 60 * 1000);

// Initialize DB then start server
initDb()
  .then(() => {
    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  })
  .catch((err) => {
    logger.error("Failed to initialize database", err);
    process.exit(1);
  });

module.exports = app;
