import os from "os";
import Automation from "../models/automation.model.js";
import { createExecutionLog } from "./execution.service.js";

const INSTANCE_ID = process.env.INSTANCE_ID || `${os.hostname()}-${process.pid}`;
const LOCK_TIMEOUT_MINUTES = parseInt(process.env.LOCK_TIMEOUT_MINUTES || "15", 10);

/**
 * Atomically claim the next due automation.
 * Transitions status from PENDING to RUNNING and sets lock metadata.
 * 
 * @returns {Promise<import("mongoose").Document | null>} The claimed automation or null
 */
export const claimNextAutomation = async () => {
  const now = new Date();

  const automation = await Automation.findOneAndUpdate(
    {
      status: "PENDING",
      scheduledAt: { $lte: now },
    },
    {
      $set: {
        status: "RUNNING",
        lockedAt: now,
        lockedBy: INSTANCE_ID,
        executionStartedAt: now,
      },
    },
    {
      new: true, // return the updated document
      sort: { scheduledAt: 1 }, // ensure we pick the oldest due automation first
    }
  ).populate("submission", "title thumbnailUrl platform");

  if (automation) {
    console.log(`🔒 Worker [${INSTANCE_ID}] claimed automation ${automation._id}`);
  }

  return automation;
};

/**
 * Recover automations that have been stuck in RUNNING for too long (stale locks).
 * This typically happens if the worker executing them crashed.
 * 
 * Transitions status from RUNNING back to PENDING.
 */
export const recoverStaleLocks = async () => {
  const timeoutThreshold = new Date(Date.now() - LOCK_TIMEOUT_MINUTES * 60 * 1000);

  // Find all stale locks
  const staleAutomations = await Automation.find({
    status: "RUNNING",
    lockedAt: { $lt: timeoutThreshold },
  });

  if (staleAutomations.length === 0) return 0;

  console.warn(`⚠️  Found ${staleAutomations.length} stale automation locks. Recovering...`);

  for (const automation of staleAutomations) {
    try {
      // 1. Audit trail: log the recovery event
      await createExecutionLog({
        automationId: automation._id,
        submissionId: automation.submission,
        channelId: automation.channel,
        status: "FAILED",
        resultMessage: `Worker [${automation.lockedBy}] timed out after ${LOCK_TIMEOUT_MINUTES}m. Lock recovered.`,
      });

      // 2. Reset the automation back to PENDING
      automation.status = "PENDING";
      automation.lockedAt = undefined;
      automation.lockedBy = undefined;
      automation.executionStartedAt = undefined;
      
      await automation.save();
      console.log(`♻️  Recovered automation ${automation._id} back to PENDING`);
    } catch (err) {
      console.error(`❌ Failed to recover automation ${automation._id}:`, err.message);
    }
  }

  return staleAutomations.length;
};
