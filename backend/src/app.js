import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// ── Route imports ───────────────────────────────────────────────────
import authRoutes from "./routes/auth.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import { channelRouter, submissionRouter } from "./routes/submission.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import platformRoutes from "./routes/platform.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import automationRoutes from "./routes/automation.routes.js";
import executionRoutes from "./routes/execution.routes.js";
import oauthRoutes from "./routes/oauth.routes.js";

// ── Middleware imports ──────────────────────────────────────────────
import errorHandler from "./middleware/error.middleware.js";

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

/**
 * Express Application
 *
 * Configures middleware, API v1 routes, and error handling.
 */
const app = express();

// Trust proxy for secure cookies and rate-limiting behind load balancers (Railway/Render)
app.set("trust proxy", 1);

// ── Security Middleware ─────────────────────────────────────────────
app.use(helmet());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use("/api", globalLimiter);

// ── Global Middleware ───────────────────────────────────────────────

// Define allowed origins from environment or default to local dev
const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map((url) => url.trim())
  : ["https://reel-ops.vercel.app"];

// CORS — allow configured frontend origins
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      // and requests from allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Parse cookies
app.use(cookieParser());

// Sanitize inputs against NoSQL Injection (Express 5 compatibility)
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  if (req.params) req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  next();
});

// ── Health Check ────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ReelOps API is running 🚀",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "reelops-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API v1 Routes ───────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/channel", channelRoutes);
app.use("/api/v1/channel/:channelId/submission", channelRouter);
app.use("/api/v1/channel/:channelId/chat", chatRoutes);
app.use("/api/v1/submission", submissionRouter);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/platforms", platformRoutes);
app.use("/api/v1/oauth", oauthRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/automation", automationRoutes);
app.use("/api/v1/automation", executionRoutes);

// ── 404 Handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Centralized Error Handler ───────────────────────────────────────
app.use(errorHandler);

export default app;
