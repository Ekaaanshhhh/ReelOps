import api from './axios';

export const platformAPI = {
  /**
   * Get all connected platforms for the user
   * @returns {Promise<object>} { connectedPlatforms }
   */
  getPlatforms: async () => {
    const { data } = await api.get('/platforms');
    return data;
  },

  /**
   * Initiate a platform connection placeholder
   * @param {string} platform Platform enum (e.g., YOUTUBE, INSTAGRAM)
   * @returns {Promise<object>} { connection }
   */
  connectPlatform: async (platform) => {
    const { data } = await api.post('/platforms/connect', { platform });
    return data;
  },

  /**
   * Disconnect a platform
   * @param {string} platformId The ID of the connection
   * @returns {Promise<object>}
   */
  disconnectPlatform: async (platformId) => {
    const { data } = await api.delete(`/platforms/${platformId}`);
    return data;
  },

  // ── NEW: Channel-Centric Endpoints ──────────────────────────────

  /**
   * Get connected platforms for a channel
   */
  getChannelPlatforms: async (channelId) => {
    const { data } = await api.get(`/platforms/channel/${channelId}`);
    return data;
  },

  /**
   * Initiate YouTube connection OAuth flow
   */
  connectYouTube: async (channelId) => {
    const { data } = await api.get(`/oauth/google/connect/${channelId}`);
    return data;
  },

  /**
   * Disconnect YouTube from a channel
   */
  disconnectYouTube: async (channelId) => {
    const { data } = await api.delete(`/oauth/youtube/${channelId}`);
    return data;
  },

  /**
   * Get current YouTube connection health
   */
  getYouTubeHealth: async (channelId) => {
    const { data } = await api.get(`/platforms/youtube/health/${channelId}`);
    return data;
  },

  /**
   * Test YouTube connection by attempting to refresh token
   */
  testYouTubeConnection: async (channelId) => {
    const { data } = await api.post(`/platforms/youtube/test/${channelId}`);
    return data;
  },

  /**
   * Test YouTube Upload by uploading a small test video
   */
  testUploadYouTube: async (channelId) => {
    const { data } = await api.post(`/platforms/youtube/test-upload/${channelId}`);
    return data;
  },
};
