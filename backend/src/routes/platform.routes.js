import { Router } from "express";
import {
  getConnectedPlatforms,
  connectPlatform,
  disconnectPlatform,
  getChannelPlatforms,
  testYouTubeConnection,
  testUploadYouTube,
  getYouTubeHealth,
} from "../controllers/platform.controller.js";
import { handleGoogleCallback } from "../controllers/oauth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireChannelMember } from "../middleware/channel.middleware.js";

const router = Router();

/**
 * Platform Routes
 * 
 * All routes are protected.
 * 
 * GET    /api/v1/platforms         - Get all connected platforms
 * POST   /api/v1/platforms/connect - Connect a new platform placeholder
 * DELETE /api/v1/platforms/:id     - Disconnect a platform
 */

router.get("/", protect, getConnectedPlatforms);
router.post("/connect", protect, connectPlatform);
router.delete("/:id", protect, disconnectPlatform);

// ── NEW: Channel-Centric Routes ────────────────────────────────

// GET /api/v1/platforms/channel/:channelId
router.get("/channel/:channelId", protect, requireChannelMember, getChannelPlatforms);

// POST /api/v1/platforms/youtube/test/:channelId
router.post("/youtube/test/:channelId", protect, testYouTubeConnection);

// POST /api/v1/platforms/youtube/test-upload/:channelId
router.post("/youtube/test-upload/:channelId", protect, testUploadYouTube);

// GET /api/v1/platforms/youtube/callback (Google OAuth redirect)
router.get("/youtube/callback", handleGoogleCallback);

// GET /api/v1/platforms/youtube/health/:channelId
router.get("/youtube/health/:channelId", protect, requireChannelMember, getYouTubeHealth);

export default router;
