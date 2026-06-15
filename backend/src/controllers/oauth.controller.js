import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { verifyChannelOwner } from "../utils/channelValidation.js";
import * as oauthService from "../services/googleOAuth.service.js";
import ChannelPlatform from "../models/channelPlatform.model.js";
import ChannelMember from "../models/ChannelMember.js";
import { encrypt } from "../utils/encryption.js";

/**
 * Get Google OAuth connect URL
 * GET /api/v1/oauth/google/connect/:channelId
 */
export const getGoogleConnectUrl = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  // Verify ownership
  const isOwner = await verifyChannelOwner(userId, channelId);
  if (!isOwner) {
    return sendError(res, 403, "Only the channel owner can connect platforms.");
  }

  const url = oauthService.generateAuthUrl(channelId);
  sendSuccess(res, 200, "OAuth URL generated", { url });
});

/**
 * Handle Google OAuth callback
 * GET /api/v1/oauth/google/callback
 */
export const handleGoogleCallback = asyncHandler(async (req, res) => {
  const { code, state: channelId, error } = req.query;

  const clientUrls = process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(",").map(u => u.trim())
    : [];
  // Use the first configured URL as the primary redirect destination, fallback to production URL if entirely missing
  const CLIENT_URL = clientUrls.length > 0 ? clientUrls[0] : "https://reel-ops.vercel.app";

  if (error) {
    console.error("Google OAuth error:", error);
    return res.redirect(`${CLIENT_URL}/channels/${channelId}/settings/platforms?youtube=error`);
  }

  if (!code || !channelId) {
    return res.redirect(`${CLIENT_URL}/channels?youtube=invalid`);
  }

  try {
    const tokens = await oauthService.exchangeCodeForTokens(code);
    
    // We strictly need a refresh token to persist the connection
    if (!tokens.refresh_token) {
      console.warn("No refresh token received. The user may need to revoke access and try again.");
      // In production, we might force prompt=consent to ensure refresh token is returned.
      // oauthService.generateAuthUrl handles this.
    }

    const profileData = await oauthService.fetchYouTubeAndGoogleProfile(tokens);

    // Upsert the ChannelPlatform record
    // We assume the user who initiated the request is the owner, but since it's a callback,
    // we don't have req.user from JWT (callbacks from Google browser redirect don't have Authorization headers usually).
    // We will just update or create based on channel and platform. If it's a new one, connectedBy is required.
    // To handle connectedBy safely, we might temporarily store the userId in state or session, but for now
    // if the record already exists we update it. If it doesn't, we might need a workaround or rely on state.
    // Let's pass userId in state as well: state=channelId_userId
    
    // Since state is just channelId currently (as per generateAuthUrl), 
    // let's fetch the channel owner from DB if we need connectedBy.
    const owner = await ChannelMember.findOne({ channel: channelId, role: "OWNER" });
    const ownerId = owner ? owner.user : null;

    const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined;

    const updateData = {
      ...profileData,
      oauthStatus: "CONNECTED",
      expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
      lastRefreshedAt: new Date(),
    };

    if (encryptedRefreshToken) {
      updateData.encryptedRefreshToken = encryptedRefreshToken;
    }

    await ChannelPlatform.findOneAndUpdate(
      { channel: channelId, platform: "YOUTUBE" },
      {
        $set: updateData,
        $setOnInsert: {
          connectedBy: ownerId,
          connectedAt: new Date(),
        }
      },
      { upsert: true, new: true }
    );

    console.log(`[OAuth] YouTube account connected for channel ${channelId}`);
    return res.redirect(`${CLIENT_URL}/channels/${channelId}/settings/platforms?youtube=connected`);

  } catch (err) {
    console.error("Google Callback Error:", err);
    return res.redirect(`${CLIENT_URL}/channels/${channelId}/settings/platforms?youtube=error`);
  }
});

/**
 * Disconnect YouTube account from a channel
 * DELETE /api/v1/oauth/youtube/:channelId
 */
export const disconnectYouTube = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  const isOwner = await verifyChannelOwner(userId, channelId);
  if (!isOwner) {
    return sendError(res, 403, "Only the channel owner can disconnect platforms.");
  }

  await ChannelPlatform.findOneAndUpdate(
    { channel: channelId, platform: "YOUTUBE" },
    {
      $set: {
        oauthStatus: "DISCONNECTED",
        encryptedRefreshToken: "",
      },
      $unset: {
        youtubeChannelId: 1,
        youtubeChannelName: 1,
        channelThumbnail: 1,
        googleAccountEmail: 1,
        googleAccountName: 1,
        expiresAt: 1,
        lastRefreshedAt: 1,
      }
    }
  );

  console.log(`[OAuth] YouTube account disconnected for channel ${channelId}`);
  sendSuccess(res, 200, "YouTube disconnected successfully");
});
