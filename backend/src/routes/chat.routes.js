import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { requireChannelMember } from "../middleware/channel.middleware.js";
import {
  getChannelChat,
  getChannelMessages,
  sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router({ mergeParams: true }); // Need mergeParams to access :channelId from parent router

// All chat routes are protected and require the user to be a member of the channel
router.use(protect);
router.use(requireChannelMember);

// GET /api/v1/channel/:channelId/chat
router.get("/", getChannelChat);

// GET /api/v1/channel/:channelId/chat/messages
router.get("/messages", getChannelMessages);

// POST /api/v1/channel/:channelId/chat/message (Fallback for sockets)
router.post("/message", sendMessage);

export default router;
