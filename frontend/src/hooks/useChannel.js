import { useContext } from 'react';
import { ChannelContext } from '../context/ChannelContext';

/**
 * Custom hook to access ChannelContext.
 * @returns {object} Channel state and methods
 */
export default function useChannel() {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  return context;
}
