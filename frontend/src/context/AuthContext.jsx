import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth.api';

export const AuthContext = createContext(null);

/**
 * AuthProvider
 *
 * Handles pure authentication state — no global roles.
 * Roles are channel-specific and handled by ChannelContext.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('reelops_token');
    const savedUser = localStorage.getItem('reelops_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('reelops_token');
        localStorage.removeItem('reelops_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authAPI.login(email, password);
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('reelops_token', result.token);
    localStorage.setItem('reelops_user', JSON.stringify(result.user));
    return result;
  }, []);

  const signup = useCallback(async (name, email, password, phoneNumber) => {
    const result = await authAPI.signup(name, email, password, phoneNumber);
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('reelops_token', result.token);
    localStorage.setItem('reelops_user', JSON.stringify(result.user));
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('reelops_token');
      localStorage.removeItem('reelops_user');
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
