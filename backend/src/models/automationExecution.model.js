import mongoose from "mongoose";

/**
 * AutomationExecution Model
 *
 * Persists the result of each automation execution attempt.
 * One Automation can have multiple execution records (e.g. retry after failure).
 */
const automationExecutionSchema = new mongoose.Schema(
  {
    automation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Automation",
      required: true,
    },

    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
    },

    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },

    status: {
      type: String,
      enum: [
        "SUCCESS", 
        "FAILED", 
        "QUEUED", 
        "DOWNLOADING", 
        "UPLOADING", 
        "PUBLISHED"
      ],
    },

    resultMessage: {
      type: String,
    },

    platformVideoId: {
      type: String,
    },

    platformVideoUrl: {
      type: String,
    },

    publishedAt: {
      type: Date,
    },

    executionDurationMs: {
      type: Number,
    },

    youtubeChannelId: {
      type: String,
    },

    privacyStatus: {
      type: String,
    },

    uploadResponse: {
      type: mongoose.Schema.Types.Mixed,
    },

    executedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ─────────────────────────────────────────────────────────
automationExecutionSchema.index({ automation: 1 });
automationExecutionSchema.index({ channel: 1 });
automationExecutionSchema.index({ executedAt: -1 });

const AutomationExecution = mongoose.model(
  "AutomationExecution",
  automationExecutionSchema
);

export default AutomationExecution;
