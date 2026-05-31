import * as automationService from "../services/automation.service.js";
import Submission from "../models/Submission.js";
import ChannelMember from "../models/ChannelMember.js";
import { STATUSES } from "../constants/statuses.js";
import { ROLES } from "../constants/roles.js";
import { sendSuccess } from "../utils/responseHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendScheduleNotification } from "../services/email.service.js";

/**
 * Create a new automation for a given submission.
 * POST /api/v1/automation
 */
export const createAutomation = asyncHandler(async (req, res) => {
  const { submissionId, scheduledAt, scheduleSource } = req.body;
  const userId = req.user._id;

  if (!submissionId || !scheduledAt || !scheduleSource) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields.",
    });
  }

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    return res.status(404).json({ success: false, message: "Submission not found." });
  }

  // Ensure user is the owner
  const membership = await ChannelMember.findOne({
    user: userId,
    channel: submission.channel,
  });

  if (!membership || membership.role !== ROLES.OWNER) {
    return res.status(403).json({ success: false, message: "Only owners can create automations." });
  }

  // Ensure scheduledAt is in the future
  if (new Date(scheduledAt) <= new Date()) {
    return res.status(400).json({ success: false, message: "Scheduled time must be in the future." });
  }

  // Create automation
  const automation = await automationService.createAutomation({
    submissionId: submission._id,
    channelId: submission.channel,
    platform: submission.platform,
    scheduledAt,
    scheduleSource,
    userId,
  });

  // Update submission status to SCHEDULED
  submission.status = STATUSES.SCHEDULED;
  submission.scheduledTime = new Date(scheduledAt);
  await submission.save();

  // Fetch owners to send email
  try {
    const owners = await ChannelMember.find({
      channel: submission.channel,
      role: ROLES.OWNER,
    }).populate("user", "email name");
    
    const ownerEmails = owners.map(o => o.user?.email).filter(Boolean);
    if (ownerEmails.length > 0) {
      sendScheduleNotification(automation, submission.title, submission.platform, ownerEmails).catch(console.error);
    }
  } catch (err) {
    console.error("Failed to send schedule email:", err);
  }

  sendSuccess(res, 201, "Automation scheduled successfully.", { automation });
});

/**
 * Get all automations for a channel.
 * GET /api/v1/automation/channel/:channelId
 */
export const getChannelAutomations = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const automations = await automationService.getChannelAutomations(channelId);
  sendSuccess(res, 200, "Automations fetched successfully.", { automations });
});

/**
 * Cancel an automation.
 * DELETE /api/v1/automation/:id
 */
export const cancelAutomation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const automation = await automationService.cancelAutomation(id);
  sendSuccess(res, 200, "Automation cancelled successfully.", { automation });
});

/**
 * Delete a cancelled automation permanently.
 * DELETE /api/v1/automation/:id/delete
 */
export const deleteAutomation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await automationService.deleteAutomation(id);
  sendSuccess(res, 200, "Automation deleted successfully.");
});
