import api from './axios';

/**
 * Channel API Module
 *
 * All channel endpoints aligned with backend:
 *   POST /api/v1/channel/create
 *   POST /api/v1/channel/join
 *   GET  /api/v1/channel/all
 *   GET  /api/v1/channel/:id
 */

export const channelAPI = {
  /**
   * Create a new channel. Creator becomes OWNER.
   * @param {string} name - Channel name
   * @param {string} password - Channel password
   * @returns {Promise<{channel, membership}>}
   */
  createChannel: async (name, password) => {
    const { data } = await api.post('/channel/create', { name, password });
    return data;
  },

  /**
   * Join a channel via invite code + password.
   * @param {string} inviteCode - 8-char invite code
   * @param {string} password - Channel password
   * @returns {Promise<{channel, membership}>}
   */
  joinChannel: async (inviteCode, password) => {
    const { data } = await api.post('/channel/join', { inviteCode, password });
    return data;
  },

  /**
   * Get all channels the current user belongs to.
   * @returns {Promise<{channels: Array}>}
   */
  getUserChannels: async () => {
    const { data } = await api.get('/channel/all');
    return data;
  },

  /**
   * Get detailed info for a specific channel (members + submissions).
   * @param {string} channelId
   * @returns {Promise<{channel, members, submissions}>}
   */
  getChannelDetails: async (channelId) => {
    const { data } = await api.get(`/channel/${channelId}`);
    return data;
  },
};
