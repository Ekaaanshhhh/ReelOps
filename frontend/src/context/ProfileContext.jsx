import { createContext, useState, useCallback } from 'react';
import { profileAPI } from '../api/profile.api';
import { platformAPI } from '../api/platform.api';

export const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await profileAPI.getProfile();
      setProfile(data.user);
      setConnectedPlatforms(data.connectedPlatforms);
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const data = await profileAPI.updateProfile(profileData);
      setProfile(data.user);
      return data;
    } catch (error) {
      console.error('Failed to update profile', error);
      throw error;
    }
  }, []);

  const connectPlatform = useCallback(async (platform) => {
    try {
      const data = await platformAPI.connectPlatform(platform);
      setConnectedPlatforms(prev => [data.connection, ...prev]);
      return data;
    } catch (error) {
      console.error('Failed to connect platform', error);
      throw error;
    }
  }, []);

  const disconnectPlatform = useCallback(async (platformId) => {
    try {
      await platformAPI.disconnectPlatform(platformId);
      setConnectedPlatforms(prev => prev.filter(p => p._id !== platformId));
    } catch (error) {
      console.error('Failed to disconnect platform', error);
      throw error;
    }
  }, []);

  const value = {
    profile,
    connectedPlatforms,
    loading,
    fetchProfile,
    updateProfile,
    connectPlatform,
    disconnectPlatform,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
