import AutomationExecution from "../models/automationExecution.model.js";
import ChannelMember from "../models/ChannelMember.js";
import { ROLES } from "../constants/roles.js";
import { sendAutomationSuccessEmail, sendAutomationFailureEmail } from "./email.service.js";
import { validateChannelOAuth } from "./platform.service.js";
import { publishSubmission } from "./youtubePublisher.service.js";
import Submission from "../models/Submission.js";

/**
 * Execution Service
 *
 * Core engine functions for running automations, logging results,
 * and querying execution history.
 */

/**
 * Execute a single automation.
 *
 * Flow:
 *   PENDING → RUNNING → Upload to YouTube → COMPLETED | FAILED
 *   + create execution log (QUEUED/DOWNLOADING/UPLOADING/PUBLISHED/FAILED)
 *   + send email notification
 *
 * Never throws — failures are caught, logged, and the automation
 * is marked FAILED so the scheduler can continue processing others.
 *
 * @param {import("mongoose").Document} automation - Populated automation document
 */
export const executeAutomation = async (automation) => {
  const executionStartTime = Date.now();
  const executedAt = new Date();

  // Create an initial execution log
  let executionLog = await createExecutionLog({
    automationId: automation._id,
    submissionId: automation.submission?._id || automation.submission,
    channelId: automation.channel?._id || automation.channel,
    status: "QUEUED",
    resultMessage: "Execution started",
  });

  try {
    // ── Step 1: Validate OAuth Connection ────────────────────────────
    const channelId = automation.channel?._id || automation.channel;
    const platform = automation.platform || "YOUTUBE";
    await validateChannelOAuth(channelId, platform);

    // ── Step 2: Mark as RUNNING ──────────────────────────────────────
    automation.status = "RUNNING";
    await automation.save();
    console.log(`▶️  Running automation ${automation._id}`);
    
    // Fetch submission
    const submissionId = automation.submission?._id || automation.submission;
    const submission = await Submission.findById(submissionId);
    
    if (!submission) {
      throw new Error("Submission not found for this automation.");
    }
    
    // Update log status
    executionLog.status = "DOWNLOADING";
    await executionLog.save();

    // ── Step 3: Publish to Platform ──────────────────────────────────
    let publishResult;
    if (platform === "YOUTUBE") {
      executionLog.status = "UPLOADING";
      await executionLog.save();
      
      publishResult = await publishSubmission(channelId, submission);
    } else {
      throw new Error(`Platform ${platform} is not currently supported for automated publishing.`);
    }

    // ── Step 4: Mark as COMPLETED ────────────────────────────────────
    automation.status = "COMPLETED";
    automation.executionFinishedAt = new Date();
    await automation.save();
    
    // Update Submission status
    submission.status = "POSTED";
    submission.postedAt = new Date();
    await submission.save();
    
    console.log(`✅ Automation ${automation._id} completed and Submission ${submission._id} marked as POSTED`);

    // ── Step 5: Update execution log ─────────────────────────────────
    executionLog.status = "PUBLISHED";
    executionLog.resultMessage = "Successfully published video";
    executionLog.platformVideoId = publishResult.videoId;
    executionLog.platformVideoUrl = publishResult.youtubeUrl;
    executionLog.publishedAt = new Date();
    executionLog.executionDurationMs = Date.now() - executionStartTime;
    executionLog.youtubeChannelId = publishResult.youtubeChannelId;
    executionLog.privacyStatus = publishResult.privacyStatus;
    executionLog.uploadResponse = publishResult.uploadResponse;
    await executionLog.save();

    // ── Step 6: Send success notification ──────────────────────────────
    await sendExecutionSuccessNotification(automation, submission.title, publishResult.youtubeUrl, executionLog.publishedAt);
  } catch (error) {
    console.error(
      `❌ Automation ${automation._id} failed:`,
      error.message
    );

    // Mark as FAILED (best-effort — don't let this throw either)
    try {
      automation.status = "FAILED";
      automation.executionFinishedAt = new Date();
      await automation.save();
    } catch (saveError) {
      console.error(
        `❌ Could not save FAILED status for ${automation._id}:`,
        saveError.message
      );
    }

    // Log the failure
    try {
      executionLog.status = "FAILED";
      executionLog.resultMessage = error.message;
      executionLog.executionDurationMs = Date.now() - executionStartTime;
      await executionLog.save();
    } catch (logError) {
      console.error(
        `❌ Could not update execution log for ${automation._id}:`,
        logError.message
      );
    }

    // Send failure notification (best-effort)
    try {
      const submissionTitle = automation.submission?.title || "Unknown Submission";
      await sendExecutionFailureNotification(automation, submissionTitle, error.message);
    } catch (emailError) {
      console.error(
        `❌ Could not send failure email for ${automation._id}:`,
        emailError.message
      );
    }
  }
};

/**
 * Create an AutomationExecution log record.
 */
export const createExecutionLog = async ({
  automationId,
  submissionId,
  channelId,
  status,
  resultMessage,
}) => {
  const log = await AutomationExecution.create({
    automation: automationId,
    submission: submissionId,
    channel: channelId,
    status,
    resultMessage,
  });

  console.log(
    `📋 Execution log created: ${log._id} [${status}]`
  );

  return log;
};

/**
 * Get execution history for a given automation.
 */
export const getExecutionHistory = async (automationId) => {
  const executions = await AutomationExecution.find({
    automation: automationId,
  })
    .populate("automation", "platform scheduledAt status")
    .populate("submission", "title thumbnailUrl")
    .sort({ executedAt: -1 });

  return executions;
};

// ── Internal helpers ──────────────────────────────────────────────────

const sendExecutionSuccessNotification = async (automation, submissionTitle, youtubeUrl, publishedAt) => {
  try {
    const platform = automation.platform || "N/A";
    const channelId = automation.channel?._id || automation.channel;
    
    const owners = await ChannelMember.find({
      channel: channelId,
      role: ROLES.OWNER,
    }).populate("user", "email");

    const ownerEmails = owners.map((o) => o.user?.email).filter(Boolean);

    if (ownerEmails.length > 0) {
      await sendAutomationSuccessEmail({
        submissionTitle,
        platform,
        publishedAt,
        youtubeUrl,
        ownerEmails,
      });
    }
  } catch (error) {
    console.error("❌ Error sending success notification:", error.message);
  }
};

const sendExecutionFailureNotification = async (automation, submissionTitle, failureReason) => {
  try {
    const channelId = automation.channel?._id || automation.channel;
    
    const owners = await ChannelMember.find({
      channel: channelId,
      role: ROLES.OWNER,
    }).populate("user", "email");

    const ownerEmails = owners.map((o) => o.user?.email).filter(Boolean);

    if (ownerEmails.length > 0) {
      await sendAutomationFailureEmail({
        submissionTitle,
        automationId: automation._id.toString(),
        failureReason,
        ownerEmails,
      });
    }
  } catch (error) {
    console.error("❌ Error sending failure notification:", error.message);
  }
};
