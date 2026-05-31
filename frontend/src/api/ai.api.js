import api from './axios';

export const aiAPI = {
  /**
   * Generate AI metadata (captions, hashtags, description)
   * @param {object} data - { title, description, platform }
   * @returns {Promise<{data: {captions, hashtags, optimizedDescription, platform}}>}
   */
  generateMetadata: async (data) => {
    const response = await api.post('/ai/generate-metadata', data);
    return response.data;
  },
};
