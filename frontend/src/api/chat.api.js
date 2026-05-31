import api from './axios';

/**
 * Fetch paginated messages for a specific channel.
 */
export const getChannelMessages = async (channelId, page = 1, limit = 50) => {
  const response = await api.get(`/channel/${channelId}/chat/messages`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * REST fallback to send a message (normally handled by sockets).
 */
export const sendMessageFallback = async (channelId, content) => {
  const response = await api.post(`/channel/${channelId}/chat/message`, {
    content,
  });
  return response.data;
};
