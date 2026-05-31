import * as platformService from "../services/platform.service.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import ChannelPlatform from "../models/channelPlatform.model.js";
import { verifyChannelOwner } from "../utils/channelValidation.js";
import * as oauthService from "../services/googleOAuth.service.js";
import { publishSubmission } from "../services/youtubePublisher.service.js";
import AutomationExecution from "../models/automationExecution.model.js";

/**
 * Get all connected platforms for the current user
 */
export const getConnectedPlatforms = asyncHandler(async (req, res) => {
  const platforms = await platformService.getUserPlatforms(req.user._id);
  sendSuccess(res, 200, "Connected platforms retrieved successfully", { connectedPlatforms: platforms });
});

/**
 * Create a placeholder connection for a platform
 */
export const connectPlatform = asyncHandler(async (req, res) => {
  const { platform } = req.body;
  const connection = await platformService.connectPlatformPlaceholder(req.user._id, platform);
  sendSuccess(res, 201, `Initiated connection sequence for ${platform}`, { connection });
});

/**
 * Disconnect a platform
 */
export const disconnectPlatform = asyncHandler(async (req, res) => {
  await platformService.disconnectPlatform(req.user._id, req.params.id);
  sendSuccess(res, 200, "Platform disconnected successfully");
});

// ── NEW: Channel-Centric Endpoints ──────────────────────────────

/**
 * Get platforms connected to a specific channel
 * GET /api/v1/platforms/channel/:channelId
 */
export const getChannelPlatforms = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const platforms = await ChannelPlatform.find({ channel: channelId });

  const formattedPlatforms = {};
  
  // Format the output specifically for YouTube to match the spec
  const ytConnection = platforms.find(p => p.platform === "YOUTUBE");
  
  if (ytConnection && ytConnection.oauthStatus === "CONNECTED") {
    formattedPlatforms.youtube = {
      connected: true,
      channelName: ytConnection.youtubeChannelName,
      channelId: ytConnection.youtubeChannelId,
      thumbnail: ytConnection.channelThumbnail,
      connectedAt: ytConnection.connectedAt,
      googleAccountEmail: ytConnection.googleAccountEmail,
      googleAccountName: ytConnection.googleAccountName,
      defaultPrivacyStatus: ytConnection.defaultPrivacyStatus,
    };
  } else {
    formattedPlatforms.youtube = { connected: false };
  }

  // Future platforms (Instagram) can be formatted here

  sendSuccess(res, 200, "Channel platforms retrieved", formattedPlatforms);
});

/**
 * Test YouTube connection
 * POST /api/v1/platforms/youtube/test/:channelId
 */
export const testYouTubeConnection = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  const isOwner = await verifyChannelOwner(userId, channelId);
  if (!isOwner) {
    return sendError(res, 403, "Only the channel owner can test connections.");
  }

  const ytConnection = await ChannelPlatform.findOne({ channel: channelId, platform: "YOUTUBE" });
  
  if (!ytConnection || ytConnection.oauthStatus !== "CONNECTED") {
    return sendError(res, 400, "YouTube is not connected to this channel.");
  }

  try {
    // Attempt to generate a fresh token to verify refresh token works
    const accessToken = await oauthService.getFreshAccessToken(ytConnection.encryptedRefreshToken);
    
    // We could use this accessToken to hit YouTube API again, but getFreshAccessToken success means it's working
    // Let's do a quick API call to fetch profile to be sure
    const profileData = await oauthService.fetchYouTubeAndGoogleProfile({ access_token: accessToken });

    sendSuccess(res, 200, "YouTube connection is valid", {
      success: true,
      channelName: profileData.youtubeChannelName
    });

  } catch (err) {
    console.error("Test connection failed:", err);
    // Optionally update status to EXPIRED/ERROR
    ytConnection.oauthStatus = "EXPIRED";
    await ytConnection.save();
    
    sendError(res, 400, "Failed to connect to YouTube. Please reconnect.");
  }
});

/**
 * Test YouTube Upload
 * POST /api/v1/platforms/youtube/test-upload/:channelId
 */
export const testUploadYouTube = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  const isOwner = await verifyChannelOwner(userId, channelId);
  if (!isOwner) {
    return sendError(res, 403, "Only the channel owner can test connections.");
  }

  // Create a mock submission for the test upload
  // We'll use a public small sample video URL
  const mockSubmission = {
    _id: "test-upload-mock-id",
    title: `ReelOps Test Upload - ${new Date().toLocaleString()}`,
    description: "This is a test upload from the ReelOps platform.",
    tags: ["ReelOps", "Test"],
    privacyStatus: "private",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4", // Small sample video
  };

  try {
    const result = await publishSubmission(channelId, mockSubmission);
    sendSuccess(res, 200, "Test upload successful", {
      success: true,
      videoId: result.videoId,
      youtubeUrl: result.youtubeUrl,
    });
  } catch (err) {
    console.error("Test upload failed:", err);
    sendError(res, 400, `Test upload failed: ${err.message}`);
  }
});

/**
 * Get YouTube connection health
 * GET /api/v1/platforms/youtube/health/:channelId
 */
export const getYouTubeHealth = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const ytConnection = await ChannelPlatform.findOne({ channel: channelId, platform: "YOUTUBE" });
  
  if (!ytConnection) {
    return sendSuccess(res, 200, "YouTube health check", {
      connected: false,
      tokenValid: false,
      channelName: null
    });
  }

  const response = {
    connected: ytConnection.oauthStatus === "CONNECTED",
    tokenValid: ytConnection.oauthStatus === "CONNECTED", // For a robust check, could verify expiry or do a test
    channelName: ytConnection.youtubeChannelName,
    oauthStatus: ytConnection.oauthStatus,
    actionRequired: ytConnection.oauthStatus === "REVOKED" || ytConnection.oauthStatus === "EXPIRED"
  };

  // Fetch last execution data for this channel and platform
  const lastExecution = await AutomationExecution.findOne({ 
    channel: channelId 
  })
  .populate({
    path: 'automation',
    match: { platform: 'YOUTUBE' }
  })
  .sort({ executedAt: -1 });

  if (lastExecution && lastExecution.automation) {
    if (lastExecution.status === "PUBLISHED" || lastExecution.status === "SUCCESS") {
      response.lastSuccessfulUpload = lastExecution.executedAt;
    } else if (lastExecution.status === "FAILED") {
      response.lastUploadError = {
        message: lastExecution.resultMessage,
        date: lastExecution.executedAt
      };
    }
  }

  sendSuccess(res, 200, "YouTube health check", response);
});

