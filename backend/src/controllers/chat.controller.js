import * as chatService from "../services/chat.service.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

/**
 * Chat Controller
 *
 * Handles HTTP requests for chat history and fallback messaging.
 */

/**
 * Get channel chat info.
 */
export const getChannelChat = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    // getOrCreateChat ensures that pre-existing channels will get a chat document seamlessly
    const chat = await chatService.getOrCreateChat(channelId);
    
    return sendSuccess(res, 200, "Chat retrieved successfully", { chat });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated messages for a channel chat.
 */
export const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const result = await chatService.getChannelMessages(channelId, page, limit);
    
    return sendSuccess(res, 200, "Messages retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message via REST API (fallback for Socket.IO).
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return sendError(res, 400, "Message content is required.");
    }
    
    const message = await chatService.createMessage(channelId, req.user._id, content);
    
    return sendSuccess(res, 201, "Message sent successfully", { message });
  } catch (error) {
    next(error);
  }
};
