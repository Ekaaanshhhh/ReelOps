import Channel from "../models/Channel.js";
import ChannelMember from "../models/ChannelMember.js";
import Submission from "../models/Submission.js";
import Chat from "../models/chat.model.js";
import { ROLES } from "../constants/roles.js";

/**
 * Channel Service
 *
 * Business logic for channel creation, joining, and retrieval.
 */

/**
 * Create a new channel.
 * The creator is automatically added as OWNER.
 *
 * @param {string} userId - ID of the user creating the channel
 * @param {string} name - Channel name
 * @param {string} password - Channel password (will be hashed)
 * @returns {Promise<{channel: object, membership: object}>}
 */
export const createChannel = async (userId, name, password) => {
  if (!name || !password) {
    const error = new Error("Please provide a channel name and password.");
    error.statusCode = 400;
    throw error;
  }

  // Create the channel
  const channel = await Channel.create({
    name,
    password,
    createdBy: userId,
  });

  // Auto-add creator as OWNER
  const membership = await ChannelMember.create({
    user: userId,
    channel: channel._id,
    role: ROLES.OWNER,
  });

  // Automatically create a Chat room for this channel
  await Chat.create({ channel: channel._id });

  return { channel, membership };
};

/**
 * Join an existing channel using invite code and password.
 *
 * @param {string} userId - ID of the user joining
 * @param {string} inviteCode - Channel invite code
 * @param {string} password - Channel password
 * @returns {Promise<{channel: object, membership: object}>}
 */
export const joinChannel = async (userId, inviteCode, password) => {
  if (!inviteCode || !password) {
    const error = new Error("Please provide an invite code and channel password.");
    error.statusCode = 400;
    throw error;
  }

  // Find channel by invite code (include password for comparison)
  const channel = await Channel.findOne({ inviteCode }).select("+password");

  if (!channel) {
    const error = new Error("Invalid invite code. Channel not found.");
    error.statusCode = 404;
    throw error;
  }

  // Verify channel password
  const isMatch = await channel.comparePassword(password);

  if (!isMatch) {
    const error = new Error("Incorrect channel password.");
    error.statusCode = 401;
    throw error;
  }

  // Check if user is already a member
  const existingMembership = await ChannelMember.findOne({
    user: userId,
    channel: channel._id,
  });

  if (existingMembership) {
    const error = new Error("You are already a member of this channel.");
    error.statusCode = 400;
    throw error;
  }

  // Add user as EDITOR
  const membership = await ChannelMember.create({
    user: userId,
    channel: channel._id,
    role: ROLES.EDITOR,
  });

  return { channel, membership };
};

/**
 * Get all channels that a user belongs to.
 *
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getUserChannels = async (userId) => {
  const memberships = await ChannelMember.find({ user: userId })
    .populate("channel")
    .sort({ createdAt: -1 });

  // Return channels with the user's role in each
  return memberships.map((m) => ({
    channel: m.channel,
    role: m.role,
    joinedAt: m.createdAt,
  }));
};

/**
 * Get detailed channel info including members and submissions.
 *
 * @param {string} channelId
 * @returns {Promise<{channel: object, members: Array, submissions: Array}>}
 */
export const getChannelDetails = async (channelId) => {
  // Get channel info
  const channel = await Channel.findById(channelId).populate("createdBy", "name email");

  if (!channel) {
    const error = new Error("Channel not found.");
    error.statusCode = 404;
    throw error;
  }

  // Get all members
  const members = await ChannelMember.find({ channel: channelId })
    .populate("user", "name email")
    .sort({ createdAt: 1 });

  // Get all submissions
  const submissions = await Submission.find({ channel: channelId })
    .populate("uploadedBy", "name email")
    .populate("approvedBy", "name email")
    .sort({ createdAt: -1 });

  return { channel, members, submissions };
};
