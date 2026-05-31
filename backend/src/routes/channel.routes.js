import { Router } from "express";
import {
  createChannel,
  joinChannel,
  getUserChannels,
  getChannelDetails,
} from "../controllers/channel.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * Channel Routes
 *
 * All routes are protected — require valid JWT token.
 *
 * POST   /api/v1/channel/create  — Create a new channel (creator becomes OWNER)
 * POST   /api/v1/channel/join    — Join a channel via invite code + password
 * GET    /api/v1/channel/all     — Get all channels the user belongs to
 * GET    /api/v1/channel/:id     — Get channel details (members + submissions)
 */

router.post("/create", protect, createChannel);
router.post("/join", protect, joinChannel);
router.get("/all", protect, getUserChannels);
router.get("/:id", protect, getChannelDetails);

export default router;
