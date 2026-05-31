import { Router } from "express";
import {
  uploadSubmission,
  getAllSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  approveSubmission,
  rejectSubmission,
  changeSubmissionStatus,
} from "../controllers/submission.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireChannelMember, requireChannelRole } from "../middleware/channel.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { ROLES } from "../constants/roles.js";

/**
 * Submission Routes
 *
 * Channel-scoped routes (require channelId):
 *   POST   /api/v1/channel/:channelId/submission/upload  — Upload (EDITOR/OWNER)
 *   GET    /api/v1/channel/:channelId/submission/all      — List all submissions
 *
 * Standalone routes:
 *   GET    /api/v1/submission/:id          — Get submission by ID
 *   PUT    /api/v1/submission/:id          — Update submission
 *   DELETE /api/v1/submission/:id          — Delete submission
 *   PUT    /api/v1/submission/:id/approve  — Approve (OWNER only)
 *   PUT    /api/v1/submission/:id/reject   — Reject (OWNER only)
 */

// ── Channel-scoped submission routes ────────────────────────────────
const channelRouter = Router({ mergeParams: true });

channelRouter.post(
  "/upload",
  protect,
  requireChannelMember,
  requireChannelRole(ROLES.EDITOR, ROLES.OWNER),
  upload.single("video"),
  uploadSubmission
);

channelRouter.get(
  "/all",
  protect,
  requireChannelMember,
  getAllSubmissions
);

channelRouter.post(
  "/:id/status",
  protect,
  requireChannelMember,
  requireChannelRole(ROLES.OWNER),
  changeSubmissionStatus
);

channelRouter.delete(
  "/:id",
  protect,
  requireChannelMember,
  requireChannelRole(ROLES.OWNER),
  deleteSubmission
);

// ── Standalone submission routes ────────────────────────────────────
const submissionRouter = Router();

submissionRouter.get("/:id", protect, getSubmissionById);
submissionRouter.put("/:id", protect, updateSubmission);
submissionRouter.delete("/:id", protect, deleteSubmission);
submissionRouter.put("/:id/approve", protect, approveSubmission);
submissionRouter.put("/:id/reject", protect, rejectSubmission);

export { channelRouter, submissionRouter };
