import { Router } from "express";
import {
  createAutomation,
  getChannelAutomations,
  cancelAutomation,
  deleteAutomation,
} from "../controllers/automation.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireChannelMember, requireChannelRole } from "../middleware/channel.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

// POST /api/v1/automation
router.post("/", protect, createAutomation);

// GET /api/v1/automation/channel/:channelId
router.get("/channel/:channelId", protect, requireChannelMember, getChannelAutomations);

// DELETE /api/v1/automation/:id (We don't strictly require channel owner via middleware here as we'd need to fetch it, but ideally we should verify ownership in the controller or service)
router.delete("/:id", protect, cancelAutomation);

// DELETE /api/v1/automation/:id/delete
router.delete("/:id/delete", protect, deleteAutomation);

export default router;
