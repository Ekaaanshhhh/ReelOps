import mongoose from "mongoose";
import { ALL_PLATFORMS } from "../constants/platforms.js";

/**
 * ConnectedPlatform Model
 *
 * Represents a user's connected social media account.
 * Currently serves as a placeholder for the future OAuth integration and automation engine.
 */
const connectedPlatformSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    platform: {
      type: String,
      enum: ALL_PLATFORMS,
      required: true,
    },

    username: {
      type: String,
      trim: true,
      default: "",
    },

    platformUserId: {
      type: String,
      default: "",
    },

    accessToken: {
      type: String,
      default: "",
    },

    refreshToken: {
      type: String,
      default: "",
    },

    tokenExpiry: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isConnected: {
      type: Boolean,
      default: false, // Set to true once real OAuth completes
    },
  },
  {
    timestamps: true,
  }
);

// A user can only have one connection per platform
connectedPlatformSchema.index({ user: 1, platform: 1 }, { unique: true });

const ConnectedPlatform = mongoose.model("ConnectedPlatform", connectedPlatformSchema);

export default ConnectedPlatform;
