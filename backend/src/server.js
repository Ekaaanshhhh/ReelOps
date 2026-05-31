import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import configureCloudinary from "./config/cloudinary.js";
import { createServer } from "http";
import { initSocketServer } from "./socket/socket.js";
import { startScheduler } from "./jobs/scheduler.job.js";

// ── Load environment variables ──────────────────────────────────────
dotenv.config();

// ── Server Configuration ────────────────────────────────────────────
const PORT = process.env.PORT || 5005;

/**
 * Server Entry Point
 *
 * 1. Connects to MongoDB
 * 2. Configures Cloudinary
 * 3. Starts Express server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Configure Cloudinary
    configureCloudinary();

    // Create raw HTTP server
    const httpServer = createServer(app);
    
    // Attach Socket.IO to HTTP server
    initSocketServer(httpServer);

    // Start HTTP server instead of Express app directly
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 ReelOps Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL}\n`);

      // Initialize the automation execution scheduler
      startScheduler();
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// ── Handle unhandled promise rejections ─────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  process.exit(1);
});

// ── Handle uncaught exceptions ──────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

// Start the server
startServer();
