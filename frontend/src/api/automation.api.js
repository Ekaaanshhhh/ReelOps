import api from './axios';

/**
 * Automation API Module
 * Handles scheduling automations for approved submissions.
 */
export const automationAPI = {
  /**
   * Create a new automation
   * @param {Object} data 
   * @param {string} data.submissionId 
   * @param {string} data.scheduledAt - ISO string 
   * @param {string} data.scheduleSource - "AI" or "OWNER"
   */
  createAutomation: async (data) => {
    const response = await api.post('/automation', data);
    return response.data;
  },

  /**
   * Get all automations for a channel
   * @param {string} channelId 
   */
  getChannelAutomations: async (channelId) => {
    const response = await api.get(`/automation/channel/${channelId}`);
    return response.data;
  },

  /**
   * Cancel an automation
   * @param {string} automationId 
   */
  cancelAutomation: async (automationId) => {
    const response = await api.delete(`/automation/${automationId}`);
    return response.data;
  },

  /**
   * Delete a cancelled automation permanently
   * @param {string} automationId 
   */
  deleteAutomation: async (automationId) => {
    const response = await api.delete(`/automation/${automationId}/delete`);
    return response.data;
  },

  /**
   * Get execution history for a specific automation
   * @param {string} automationId
   */
  getExecutionHistory: async (automationId) => {
    const response = await api.get(`/automation/${automationId}/executions`);
    return response.data;
  },
};
