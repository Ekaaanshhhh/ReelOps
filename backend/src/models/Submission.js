import mongoose from "mongoose";
import { ALL_STATUSES, STATUSES } from "../constants/statuses.js";
import { ALL_PLATFORMS } from "../constants/platforms.js";

/**
 * Submission Model
 *
 * Represents a video submission in the ReelOps workflow.
 * Submissions are channel-scoped and follow the lifecycle:
 * DRAFT → PENDING_APPROVAL → APPROVED/REJECTED → POSTED
 */
const submissionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },

    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },

    videoPublicId: {
      type: String,
      required: true,
    },

    thumbnailUrl: {
      type: String,
      default: "",
    },

    platform: {
      type: String,
      enum: {
        values: ALL_PLATFORMS,
        message: `Platform must be one of: ${ALL_PLATFORMS.join(", ")}`,
      },
      required: [true, "Platform is required"],
    },

    status: {
      type: String,
      enum: {
        values: ALL_STATUSES,
        message: `Status must be one of: ${ALL_STATUSES.join(", ")}`,
      },
      default: STATUSES.PENDING_APPROVAL,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader is required"],
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel is required"],
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    aiSuggestedPostTime: {
      type: Date,
      default: null,
    },

    aiTimeConfidence: {
      type: Number,
      default: null,
    },

    aiTimeReason: {
      type: String,
      default: "",
    },

    scheduledTime: {
      type: Date,
      default: null,
    },

    postedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes for efficient queries ───────────────────────────────────
submissionSchema.index({ channel: 1, status: 1 });
submissionSchema.index({ channel: 1, createdAt: -1 });
submissionSchema.index({ uploadedBy: 1 });

// ── Clean JSON output ───────────────────────────────────────────────
submissionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
