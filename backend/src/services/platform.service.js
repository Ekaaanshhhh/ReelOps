import ConnectedPlatform from "../models/ConnectedPlatform.js";
import ChannelPlatform from "../models/channelPlatform.model.js";
import ChannelMember from "../models/ChannelMember.js";
import { ALL_PLATFORMS } from "../constants/platforms.js";
import { ROLES } from "../constants/roles.js";
import { sendOAuthRevokedEmail } from "./email.service.js";
import { getFreshAccessToken, OAuthRevokedError } from "./googleOAuth.service.js";

/**
 * Get all connected platforms for a user.
 * 
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getUserPlatforms = async (userId) => {
  const platforms = await ConnectedPlatform.find({ user: userId })
    .select("-accessToken -refreshToken -tokenExpiry -__v");
  
  return platforms;
};

/**
 * Create a placeholder connection for a platform.
 * 
 * @param {string} userId 
 * @param {string} platform 
 * @returns {Promise<object>}
 */
export const connectPlatformPlaceholder = async (userId, platform) => {
  if (!platform || !ALL_PLATFORMS.includes(platform.toUpperCase())) {
    const error = new Error(`Invalid platform. Supported platforms: ${ALL_PLATFORMS.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  const platformName = platform.toUpperCase();

  // Check if already connected/pending
  const existingConnection = await ConnectedPlatform.findOne({
    user: userId,
    platform: platformName,
  });

  if (existingConnection) {
    const error = new Error(`Platform ${platformName} is already added to your account.`);
    error.statusCode = 400;
    throw error;
  }

  const newConnection = await ConnectedPlatform.create({
    user: userId,
    platform: platformName,
    username: "", 
    isConnected: false, // Placeholder status
  });

  const connObj = newConnection.toObject();
  delete connObj.accessToken;
  delete connObj.refreshToken;
  delete connObj.tokenExpiry;
  delete connObj.__v;

  return connObj;
};

/**
 * Disconnect a platform.
 * 
 * @param {string} userId 
 * @param {string} platformId 
 * @returns {Promise<void>}
 */
export const disconnectPlatform = async (userId, platformId) => {
  const connection = await ConnectedPlatform.findOne({
    _id: platformId,
    user: userId,
  });

  if (!connection) {
    const error = new Error("Platform connection not found or you do not have permission to delete it.");
    error.statusCode = 404;
    throw error;
  }

  await ConnectedPlatform.findByIdAndDelete(platformId);
};

/**
 * Handle a revoked OAuth connection.
 * Sets the status to REVOKED and stores error metadata.
 * 
 * @param {import("mongoose").Document} channelPlatform - The ChannelPlatform document
 * @param {Error} error - The error that caused the revocation
 */
export const handleRevokedConnection = async (channelPlatform, error) => {
  channelPlatform.oauthStatus = "REVOKED";
  channelPlatform.isConnected = false;
  channelPlatform.revokedAt = new Date();
  channelPlatform.lastOAuthError = error.message || "Unknown OAuth error";
  
  await channelPlatform.save();
  console.log(`❌ OAuth connection revoked for ChannelPlatform ${channelPlatform._id}`);
};

/**
 * Validate a channel's OAuth connection for a specific platform.
 * Ensures the connection exists, is not already revoked, and can refresh its token.
 * Triggers revocation handling and emails if the token is invalid.
 * 
 * @param {string} channelId 
 * @param {string} platform - e.g., "YOUTUBE"
 * @returns {Promise<boolean>} - True if valid, throws error if invalid or revoked
 */
export const validateChannelOAuth = async (channelId, platform) => {
  const channelPlatform = await ChannelPlatform.findOne({
    channel: channelId,
    platform: platform.toUpperCase(),
  });

  if (!channelPlatform) {
    throw new Error(`No ${platform} connection found for this channel.`);
  }

  if (channelPlatform.oauthStatus === "REVOKED" || channelPlatform.oauthStatus === "EXPIRED") {
    throw new Error(`OAuth connection is ${channelPlatform.oauthStatus}. Action required by owner.`);
  }

  try {
    // Attempt to refresh token to validate it's still alive
    if (platform.toUpperCase() === "YOUTUBE") {
      await getFreshAccessToken(channelPlatform.encryptedRefreshToken);
    }
    
    // Update successful refresh time
    channelPlatform.lastSuccessfulRefreshAt = new Date();
    await channelPlatform.save();
    
    return true;
  } catch (error) {
    if (error instanceof OAuthRevokedError) {
      await handleRevokedConnection(channelPlatform, error);
      
      // Fetch owners to send email
      const owners = await ChannelMember.find({
        channel: channelId,
        role: ROLES.OWNER,
      }).populate("user", "email");

      const ownerEmails = owners
        .map((o) => o.user?.email)
        .filter(Boolean);

      // Notify owners, spam protection is handled inside sendOAuthRevokedEmail
      await sendOAuthRevokedEmail(channelPlatform, ownerEmails);
      
      throw new Error(`OAuth connection revoked. Notification sent to owners.`);
    }
    
    // For network errors or other transient issues, just re-throw
    throw error;
  }
};
