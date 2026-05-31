import mongoose from "mongoose";

const automationSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    platform: {
      type: String,
      enum: ["INSTAGRAM", "YOUTUBE"],
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    scheduleSource: {
      type: String,
      enum: ["AI", "OWNER"],
      required: true,
    },
    status: {
      type: String,
      // Note: RUNNING effectively means "CLAIMED AND BEING PROCESSED"
      enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    lockedAt: {
      type: Date,
    },
    lockedBy: {
      type: String,
    },
    executionStartedAt: {
      type: Date,
    },
    executionFinishedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
automationSchema.index({ status: 1, scheduledAt: 1 }); // Compound index for scheduler
automationSchema.index({ status: 1, lockedAt: 1 }); // Index for stale lock recovery
automationSchema.index({ scheduledAt: 1 });
automationSchema.index({ status: 1 });
automationSchema.index({ channel: 1 });
automationSchema.index({ submission: 1 });

const Automation = mongoose.model("Automation", automationSchema);

export default Automation;
