import mongoose from "mongoose";

const channelPlatformSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    platform: {
      type: String,
      enum: ["YOUTUBE", "INSTAGRAM"],
      required: true,
    },
    connectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    encryptedRefreshToken: {
      type: String,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: false,
    },
    lastSuccessfulRefreshAt: {
      type: Date,
      required: false,
    },
    lastRefreshedAt: {
      type: Date,
      required: false,
    },
    youtubeChannelId: {
      type: String,
      required: false,
    },
    youtubeChannelName: {
      type: String,
      required: false,
    },
    channelThumbnail: {
      type: String,
      required: false,
    },
    googleAccountEmail: {
      type: String,
      required: false,
    },
    googleAccountName: {
      type: String,
      required: false,
    },
    oauthStatus: {
      type: String,
      enum: ["CONNECTED", "DISCONNECTED", "EXPIRED", "ERROR", "REVOKED"],
      default: "CONNECTED",
    },
    defaultPrivacyStatus: {
      type: String,
      enum: ["public", "unlisted", "private"],
      default: "public"
    },
    isConnected: {
      type: Boolean,
      default: true,
    },
    lastOAuthError: {
      type: String,
      required: false,
    },
    revokedAt: {
      type: Date,
      required: false,
    },
    lastRevokedNotificationSentAt: {
      type: Date,
      required: false,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Guarantee one platform connection per channel
channelPlatformSchema.index({ channel: 1, platform: 1 }, { unique: true });

const ChannelPlatform = mongoose.model("ChannelPlatform", channelPlatformSchema);

export default ChannelPlatform;
