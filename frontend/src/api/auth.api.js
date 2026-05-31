import api from './axios';

/**
 * Auth API Module
 *
 * All authentication endpoints aligned with backend:
 *   POST /api/v1/auth/signup
 *   POST /api/v1/auth/login
 *   POST /api/v1/auth/logout
 */

export const authAPI = {
  /**
   * Register a new user.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} phoneNumber
   * @returns {Promise<{user, token}>}
   */
  signup: async (name, email, password, phoneNumber) => {
    const { data } = await api.post('/auth/signup', { name, email, password, phoneNumber });
    return data;
  },

  /**
   * Authenticate a user.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user, token}>}
   */
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  /**
   * Logout — clear server-side cookie.
   * @returns {Promise<void>}
   */
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
};
