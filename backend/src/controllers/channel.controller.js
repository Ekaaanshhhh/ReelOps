import * as channelService from "../services/channel.service.js";
import { sendSuccess } from "../utils/responseHandler.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Channel Controller
 *
 * Thin controller — delegates all business logic to channel.service.js
 */

// ── POST /api/v1/channel/create ─────────────────────────────────────
export const createChannel = asyncHandler(async (req, res) => {
  const { name, password } = req.body;

  const { channel, membership } = await channelService.createChannel(
    req.user._id,
    name,
    password
  );

  sendSuccess(res, 201, "Channel created successfully.", { channel, membership });
});

// ── POST /api/v1/channel/join ───────────────────────────────────────
export const joinChannel = asyncHandler(async (req, res) => {
  const { inviteCode, password } = req.body;

  const { channel, membership } = await channelService.joinChannel(
    req.user._id,
    inviteCode,
    password
  );

  sendSuccess(res, 200, "Joined channel successfully.", { channel, membership });
});

// ── GET /api/v1/channel/all ─────────────────────────────────────────
export const getUserChannels = asyncHandler(async (req, res) => {
  const channels = await channelService.getUserChannels(req.user._id);

  sendSuccess(res, 200, "Channels retrieved successfully.", {
    count: channels.length,
    channels,
  });
});

// ── GET /api/v1/channel/:id ─────────────────────────────────────────
export const getChannelDetails = asyncHandler(async (req, res) => {
  const { channel, members, submissions } = await channelService.getChannelDetails(
    req.params.id
  );

  sendSuccess(res, 200, "Channel details retrieved successfully.", {
    channel,
    members,
    submissions,
  });
});
