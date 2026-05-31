import { google } from "googleapis";
import axios from "axios";
import ChannelPlatform from "../models/channelPlatform.model.js";
import { getFreshAccessToken, OAuthRevokedError } from "./googleOAuth.service.js";
import { handleRevokedConnection } from "./platform.service.js";
import { sendOAuthRevokedEmail } from "./email.service.js";
import ChannelMember from "../models/ChannelMember.js";
import { ROLES } from "../constants/roles.js";

const MAX_YOUTUBE_UPLOAD_SIZE_MB = parseInt(process.env.MAX_YOUTUBE_UPLOAD_SIZE_MB || "1024", 10);
const MAX_UPLOAD_SIZE_BYTES = MAX_YOUTUBE_UPLOAD_SIZE_MB * 1024 * 1024;

/**
 * Validates OAuth state and returns an authenticated YouTube client.
 */
export const getAuthenticatedYouTubeClient = async (channelId) => {
  const channelPlatform = await ChannelPlatform.findOne({
    channel: channelId,
    platform: "YOUTUBE",
  });

  if (!channelPlatform) {
    throw new Error("YouTube connection not found for this channel.");
  }

  if (channelPlatform.oauthStatus === "REVOKED" || channelPlatform.oauthStatus === "EXPIRED") {
    throw new Error(`OAuth connection is ${channelPlatform.oauthStatus}.`);
  }

  try {
    const accessToken = await getFreshAccessToken(channelPlatform.encryptedRefreshToken);
    
    // Update successful refresh time
    channelPlatform.lastSuccessfulRefreshAt = new Date();
    await channelPlatform.save();

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    return {
      youtube: google.youtube({ version: "v3", auth: oauth2Client }),
      channelPlatform,
    };
  } catch (error) {
    if (error instanceof OAuthRevokedError) {
      await handleRevokedConnection(channelPlatform, error);
      
      const owners = await ChannelMember.find({
        channel: channelId,
        role: ROLES.OWNER,
      }).populate("user", "email");

      const ownerEmails = owners.map((o) => o.user?.email).filter(Boolean);
      await sendOAuthRevokedEmail(channelPlatform, ownerEmails);
      
      throw new Error(`OAuth connection revoked. Notification sent to owners.`);
    }
    throw error;
  }
};

/**
 * Validates the Cloudinary asset before downloading.
 */
const validateCloudinaryAsset = async (videoUrl) => {
  try {
    const headRes = await axios.head(videoUrl);
    
    const contentType = headRes.headers['content-type'];
    const contentLength = headRes.headers['content-length'];

    if (!contentType || !contentType.startsWith('video/')) {
      throw new Error(`Invalid content type: ${contentType}. Expected video/*`);
    }

    if (!contentLength) {
      throw new Error("Missing content-length header from video source.");
    }

    const sizeBytes = parseInt(contentLength, 10);
    if (sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error(`Video size (${(sizeBytes / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size of ${MAX_YOUTUBE_UPLOAD_SIZE_MB}MB.`);
    }

    return { contentType, contentLength: sizeBytes };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Video file not found at the provided URL.");
    }
    throw new Error(`Failed to validate video asset: ${error.message}`);
  }
};

/**
 * Downloads the video as a stream.
 */
export const downloadSubmissionVideo = async (videoUrl) => {
  await validateCloudinaryAsset(videoUrl);
  
  const response = await axios({
    method: 'GET',
    url: videoUrl,
    responseType: 'stream',
  });
  
  return response.data; // Readable Stream
};

/**
 * Sleeps for a given number of milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Uploads the video stream to YouTube with progress logging and retry support.
 */
export const uploadVideoToYouTube = async ({ youtube, title, description, tags, privacyStatus, videoStream, channelPlatform }) => {
  let attempt = 0;
  const maxRetries = 3;

  while (attempt <= maxRetries) {
    try {
      console.log(`[Upload] Started uploading video "${title}" to YouTube...`);
      
      const resolvedPrivacyStatus = privacyStatus || "public";

      console.log({
        channelId: channelPlatform?.youtubeChannelId,
        channelName: channelPlatform?.youtubeChannelName,
        privacyStatus: resolvedPrivacyStatus,
        title
      });

      const res = await youtube.videos.insert({
        part: "snippet,status",
        requestBody: {
          snippet: {
            title,
            description,
            tags: tags || [],
          },
          status: {
            privacyStatus: resolvedPrivacyStatus,
          },
        },
        media: {
          body: videoStream,
        },
      }, {
        onUploadProgress: (evt) => {
          if (evt.total) {
            const progress = Math.round((evt.bytesRead / evt.total) * 100);
            console.log(`[Upload] Progress for "${title}": ${progress}% (${evt.bytesRead}/${evt.total} bytes)`);
          } else {
            console.log(`[Upload] Progress for "${title}": ${evt.bytesRead} bytes uploaded`);
          }
        },
      });

      console.log(`[Upload] Completed uploading video "${title}".`);
      
      const videoId = res.data.id;
      return {
        videoId,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        uploadResponse: res.data,
      };
    } catch (error) {
      const statusCode = error.response?.status || error.code;
      
      // Do NOT retry 403 (Permission) or Auth errors
      if (statusCode === 403 || error.message.includes("invalid_grant") || error.message.includes("invalid_token")) {
        throw error;
      }

      // Retry on 429 (Rate Limit) or 50x (Server Error)
      if (statusCode === 429 || (statusCode >= 500 && statusCode < 600) || ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code)) {
        attempt++;
        if (attempt > maxRetries) {
          throw new Error(`Upload failed after ${maxRetries} retries: ${error.message}`);
        }
        const backoff = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.warn(`[Upload] Transient error (${statusCode}). Retrying in ${backoff}ms... (Attempt ${attempt}/${maxRetries})`);
        await sleep(backoff);
      } else {
        // Other errors (e.g., 400 Bad Request for invalid metadata)
        throw error;
      }
    }
  }
};

/**
 * Orchestrates the full publishing flow.
 */
export const publishSubmission = async (channelId, submission) => {
  console.log(`[Publisher] Starting publish flow for submission ${submission._id}...`);
  
  // 1. Validate OAuth & Get Client
  const { youtube, channelPlatform } = await getAuthenticatedYouTubeClient(channelId);
  
  // 2. Download Video Stream
  console.log(`[Publisher] Downloading video stream from Cloudinary...`);
  const videoStream = await downloadSubmissionVideo(submission.videoUrl);
  
  // 3. Upload to YouTube
  const uploadParams = {
    youtube,
    title: submission.title,
    description: submission.description || "",
    tags: submission.tags || [],
    privacyStatus: 
      submission.privacyStatus || 
      channelPlatform.defaultPrivacyStatus || 
      process.env.DEFAULT_YOUTUBE_PRIVACY || 
      "public",
    videoStream,
    channelPlatform,
  };
  
  const result = await uploadVideoToYouTube(uploadParams);
  
  console.log(`[Publisher] Successfully published video: ${result.youtubeUrl}`);
  
  return {
    ...result,
    youtubeChannelId: channelPlatform.youtubeChannelId,
    privacyStatus: uploadParams.privacyStatus,
  };
};
