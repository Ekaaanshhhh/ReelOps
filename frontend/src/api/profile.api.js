import api from './axios';

export const profileAPI = {
  /**
   * Get the current user's profile and connected platforms
   * @returns {Promise<object>} { user, connectedPlatforms }
   */
  getProfile: async () => {
    const { data } = await api.get('/profile');
    return data;
  },

  /**
   * Update the user's profile
   * @param {object} profileData { name, phoneNumber, profilePicture }
   * @returns {Promise<object>} { user }
   */
  updateProfile: async (profileData) => {
    const { data } = await api.put('/profile/update', profileData);
    return data;
  },
};
