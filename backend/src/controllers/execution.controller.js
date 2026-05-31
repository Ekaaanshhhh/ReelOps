import Automation from "../models/automation.model.js";
import ChannelMember from "../models/ChannelMember.js";
import * as executionService from "../services/execution.service.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Get execution history for a specific automation.
 * GET /api/v1/automation/:id/executions
 *
 * Only channel members can view execution history.
 */
export const getExecutionHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Look up the automation to determine its channel
  const automation = await Automation.findById(id);
  if (!automation) {
    return sendError(res, 404, "Automation not found.");
  }

  // Verify the user is a member of the automation's channel
  const membership = await ChannelMember.findOne({
    user: userId,
    channel: automation.channel,
  });

  if (!membership) {
    return sendError(
      res,
      403,
      "You are not a member of this channel."
    );
  }

  // Fetch execution history
  const executions = await executionService.getExecutionHistory(id);

  sendSuccess(res, 200, "Execution history fetched successfully.", {
    executions,
  });
});
