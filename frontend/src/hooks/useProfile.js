import { useContext } from 'react';
import { ProfileContext } from '../context/ProfileContext';

/**
 * Custom hook to access ProfileContext.
 * @returns {object} Profile state and methods
 */
export default function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
