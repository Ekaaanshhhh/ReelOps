import Automation from "../models/automation.model.js";
import AutomationExecution from "../models/automationExecution.model.js";

/**
 * Automation Service
 * Handles scheduling workflows and viewing automations.
 */

/**
 * Create a new automation record.
 */
export const createAutomation = async ({
  submissionId,
  channelId,
  platform,
  scheduledAt,
  scheduleSource,
  userId,
}) => {
  const automation = await Automation.create({
    submission: submissionId,
    channel: channelId,
    platform: platform.toUpperCase(),
    scheduledAt,
    scheduleSource,
    createdBy: userId,
  });

  await automation.populate("submission", "title thumbnailUrl videoUrl");
  await automation.populate("createdBy", "name email");

  return automation;
};

/**
 * Get all automations for a channel.
 */
export const getChannelAutomations = async (channelId) => {
  const automations = await Automation.find({ channel: channelId })
    .populate("submission", "title thumbnailUrl videoUrl status")
    .populate("createdBy", "name email")
    .sort({ scheduledAt: 1 })
    .lean();
  
  // Attach latest execution for COMPLETED / FAILED automations
  for (let auto of automations) {
    if (auto.status === 'COMPLETED' || auto.status === 'FAILED') {
      const latestExec = await AutomationExecution.findOne({ automation: auto._id })
        .sort({ executedAt: -1 })
        .lean();
      
      if (latestExec) {
        auto.latestExecution = latestExec;
      }
    }
  }

  return automations;
};

/**
 * Cancel an automation (sets status to CANCELLED).
 */
export const cancelAutomation = async (automationId) => {
  const automation = await Automation.findById(automationId);
  if (!automation) {
    const error = new Error("Automation not found.");
    error.statusCode = 404;
    throw error;
  }

  automation.status = "CANCELLED";
  await automation.save();
  return automation;
};

/**
 * Delete an automation permanently.
 * Only allows deleting CANCELLED, COMPLETED, or FAILED automations.
 */
export const deleteAutomation = async (automationId) => {
  const automation = await Automation.findById(automationId);
  if (!automation) {
    const error = new Error("Automation not found.");
    error.statusCode = 404;
    throw error;
  }

  const deletableStatuses = ["CANCELLED", "COMPLETED", "FAILED"];
  if (!deletableStatuses.includes(automation.status)) {
    const error = new Error("Only cancelled, completed, or failed automations can be deleted.");
    error.statusCode = 400;
    throw error;
  }

  // Also delete associated execution logs
  await AutomationExecution.deleteMany({ automation: automationId });
  
  await Automation.findByIdAndDelete(automationId);
  return { success: true };
};
