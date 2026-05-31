import { createContext, useState, useCallback } from 'react';
import { channelAPI } from '../api/channel.api';
import { ROLES } from '../utils/constants';

export const ChannelContext = createContext(null);

/**
 * ChannelProvider
 *
 * Manages channel state: list of user's channels, active channel,
 * membership, and channel-specific role checks.
 *
 * This is the CORE of the new architecture — permissions are
 * resolved per-channel, not globally.
 */
export function ChannelProvider({ children }) {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannelState] = useState(null);
  const [members, setMembers] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch all channels the user belongs to.
   */
  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      const result = await channelAPI.getUserChannels();
      setChannels(result.channels || []);
      return result.channels || [];
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      setChannels([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Set the active channel and load its details.
   * Also resolves the user's membership/role in that channel.
   */
  const setActiveChannel = useCallback(async (channelId, userId) => {
    if (!channelId) {
      setActiveChannelState(null);
      setMembers([]);
      setMembership(null);
      return;
    }

    setLoading(true);
    try {
      const result = await channelAPI.getChannelDetails(channelId);
      setActiveChannelState(result.channel);
      setMembers(result.members || []);

      // Find current user's membership in this channel
      const userMembership = (result.members || []).find(
        (m) => m.user?._id === userId || m.user === userId
      );
      setMembership(userMembership || null);

      return result;
    } catch (error) {
      console.error('Failed to load channel details:', error);
      setActiveChannelState(null);
      setMembers([]);
      setMembership(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh the active channel details (e.g., after upload/approve).
   */
  const refreshActiveChannel = useCallback(async (userId) => {
    if (activeChannel?._id) {
      return setActiveChannel(activeChannel._id, userId);
    }
  }, [activeChannel, setActiveChannel]);

  /**
   * Clear active channel state (e.g., when navigating away).
   */
  const clearActiveChannel = useCallback(() => {
    setActiveChannelState(null);
    setMembers([]);
    setMembership(null);
  }, []);

  const value = {
    // State
    channels,
    activeChannel,
    members,
    membership,
    loading,

    // Derived
    isOwner: membership?.role === ROLES.OWNER,
    isEditor: membership?.role === ROLES.EDITOR,
    userRole: membership?.role || null,

    // Actions
    fetchChannels,
    setActiveChannel,
    refreshActiveChannel,
    clearActiveChannel,
  };

  return (
    <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>
  );
}
