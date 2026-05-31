import express from "express";
import {
  getGoogleConnectUrl,
  handleGoogleCallback,
  disconnectYouTube,
} from "../controllers/oauth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/v1/oauth/google/connect/:channelId
router.get("/google/connect/:channelId", protect, getGoogleConnectUrl);

// GET /api/v1/oauth/google/callback
// (No protect middleware here since it's called by Google via browser redirect)
router.get("/google/callback", handleGoogleCallback);

// DELETE /api/v1/oauth/youtube/:channelId
router.delete("/youtube/:channelId", protect, disconnectYouTube);

export default router;
