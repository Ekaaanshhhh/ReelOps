import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import ChannelMember from "../models/ChannelMember.js";

/**
 * Chat Service
 *
 * Handles chat lookups, message persistence, and pagination.
 */

/**
 * Get or create a chat for a channel.
 * Implements fallback for pre-existing channels without a chat.
 *
 * @param {string} channelId
 * @returns {Promise<object>}
 */
export const getOrCreateChat = async (channelId) => {
  let chat = await Chat.findOne({ channel: channelId });
  if (!chat) {
    chat = await Chat.create({ channel: channelId });
  }
  return chat;
};

/**
 * Get paginated messages for a channel.
 *
 * @param {string} channelId
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<{messages: Array, total: number, page: number, totalPages: number}>}
 */
export const getChannelMessages = async (channelId, page = 1, limit = 50) => {
  const chat = await getOrCreateChat(channelId);
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [messages, total] = await Promise.all([
    Message.find({ chat: chat._id, channel: channelId })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Message.countDocuments({ chat: chat._id, channel: channelId }),
  ]);

  return {
    messages,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  };
};

/**
 * Create a new message in a channel chat.
 *
 * @param {string} channelId
 * @param {string} userId
 * @param {string} content
 * @param {string} messageType
 * @returns {Promise<object>}
 */
export const createMessage = async (channelId, userId, content, messageType = "TEXT") => {
  // Validate membership for safety (in addition to socket-level or route-level validation)
  const membership = await ChannelMember.findOne({
    user: userId,
    channel: channelId,
  });

  if (!membership) {
    const error = new Error("Not a member of this channel.");
    error.statusCode = 403;
    throw error;
  }

  const chat = await getOrCreateChat(channelId);

  const message = await Message.create({
    chat: chat._id,
    channel: channelId,
    sender: userId,
    content,
    messageType,
  });

  await message.populate("sender", "name profilePicture");

  return message;
};
