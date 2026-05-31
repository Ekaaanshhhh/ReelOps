import api from './axios';

/**
 * Submission API Module
 *
 * Channel-scoped routes:
 *   POST /api/v1/channel/:channelId/submission/upload
 *   GET  /api/v1/channel/:channelId/submission/all
 *
 * Standalone routes:
 *   GET    /api/v1/submission/:id
 *   PUT    /api/v1/submission/:id
 *   DELETE /api/v1/submission/:id
 *   PUT    /api/v1/submission/:id/approve
 *   PUT    /api/v1/submission/:id/reject
 */

export const submissionAPI = {
  /**
   * Upload a new submission to a channel.
   * @param {string} channelId
   * @param {FormData} formData - Must include: video (file), title, platform. Optional: description
   * @param {Function} [onUploadProgress] - Axios progress callback
   * @returns {Promise<{submission}>}
   */
  uploadSubmission: async (channelId, formData, onUploadProgress) => {
    const { data } = await api.post(
      `/channel/${channelId}/submission/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      }
    );
    return data;
  },

  /**
   * Get all submissions for a channel with optional filters.
   * @param {string} channelId
   * @param {object} [filters] - { status, platform, page, limit }
   * @returns {Promise<{submissions, count, total, page, totalPages}>}
   */
  getChannelSubmissions: async (channelId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const { data } = await api.get(
      `/channel/${channelId}/submission/all?${params.toString()}`
    );
    return data;
  },

  /**
   * Get a single submission by ID.
   * @param {string} submissionId
   * @returns {Promise<{submission}>}
   */
  getSubmissionById: async (submissionId) => {
    const { data } = await api.get(`/submission/${submissionId}`);
    return data;
  },

  /**
   * Update a submission (title, description, platform).
   * @param {string} submissionId
   * @param {object} updateData - { title, description, platform }
   * @returns {Promise<{submission}>}
   */
  updateSubmission: async (submissionId, updateData) => {
    const { data } = await api.put(`/submission/${submissionId}`, updateData);
    return data;
  },

  /**
   * Delete a submission.
   * @param {string} submissionId
   * @returns {Promise<void>}
   */
  deleteSubmission: async (submissionId) => {
    const { data } = await api.delete(`/submission/${submissionId}`);
    return data;
  },

  /**
   * Approve a submission (OWNER only).
   * @param {string} submissionId
   * @returns {Promise<{submission}>}
   */
  approveSubmission: async (submissionId) => {
    const { data } = await api.put(`/submission/${submissionId}/approve`);
    return data;
  },

  /**
   * Reject a submission.
   * @param {string} submissionId
   * @param {string} reason
   * @returns {Promise<object>}
   */
  rejectSubmission: async (submissionId, reason) => {
    const { data } = await api.put(`/submission/${submissionId}/reject`, { reason });
    return data;
  },

  /**
   * Change a submission's status via the channel-scoped route (Owner only).
   * @param {string} channelId
   * @param {string} submissionId
   * @param {string} status ('APPROVED' | 'REJECTED')
   * @param {string} [reason]
   * @returns {Promise<object>}
   */
  changeStatus: async (channelId, submissionId, status, reason = '') => {
    const { data } = await api.post(`/channel/${channelId}/submission/${submissionId}/status`, {
      status,
      reason,
    });
    return data;
  },

  /**
   * Delete a submission via the channel-scoped route (Owner only).
   * @param {string} channelId
   * @param {string} submissionId
   * @returns {Promise<object>}
   */
  deleteChannelSubmission: async (channelId, submissionId) => {
    const { data } = await api.delete(`/channel/${channelId}/submission/${submissionId}`);
    return data;
  },
};
