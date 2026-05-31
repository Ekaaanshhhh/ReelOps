import { google } from "googleapis";
import { decrypt } from "../utils/encryption.js";

/**
 * Custom error for revoked OAuth connections
 */
export class OAuthRevokedError extends Error {
  constructor(message) {
    super(message);
    this.name = "OAuthRevokedError";
  }
}

/**
 * Detect if a Google API error indicates the token is revoked/invalid.
 */
export const isOAuthRevokedError = (error) => {
  const msg = (error?.message || "").toLowerCase();
  return (
    msg.includes("invalid_grant") ||
    msg.includes("invalid_token") ||
    msg.includes("unauthorized_client") ||
    msg.includes("token has been expired or revoked")
  );
};

/**
 * Create a configured OAuth2 client using environment variables.
 */
export const createOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

/**
 * Generate Google OAuth authorization URL.
 * Passes channelId in the `state` parameter to persist context across redirect.
 */
export const generateAuthUrl = (channelId) => {
  const oauth2Client = createOAuthClient();

  const scopes = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state: channelId, // Used to know which channel we are connecting
  });

  return url;
};

/**
 * Exchange the authorization code for tokens.
 */
export const exchangeCodeForTokens = async (code) => {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

/**
 * Fetch YouTube Channel details and Google Account Profile using access token.
 */
export const fetchYouTubeAndGoogleProfile = async (tokens) => {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(tokens);

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });

  // Fetch Google Profile
  const profileRes = await oauth2.userinfo.get();
  const googleAccountEmail = profileRes.data.email;
  const googleAccountName = profileRes.data.name;

  // Fetch YouTube Channel
  const ytRes = await youtube.channels.list({
    mine: true,
    part: ["snippet"],
  });

  if (!ytRes.data.items || ytRes.data.items.length === 0) {
    throw new Error("No YouTube channel found for this Google account.");
  }

  const channel = ytRes.data.items[0];

  return {
    youtubeChannelId: channel.id,
    youtubeChannelName: channel.snippet.title,
    channelThumbnail: channel.snippet.thumbnails?.default?.url || "",
    googleAccountEmail,
    googleAccountName,
  };
};

/**
 * Generate fresh access token using encrypted refresh token.
 */
export const getFreshAccessToken = async (encryptedRefreshToken) => {
  if (!encryptedRefreshToken) {
    throw new Error("No refresh token provided.");
  }

  const refreshToken = decrypt(encryptedRefreshToken);
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    // Getting access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token;
  } catch (error) {
    if (isOAuthRevokedError(error)) {
      throw new OAuthRevokedError(error.message || "Google OAuth token is revoked or invalid.");
    }
    throw error;
  }
};
