import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './auth_context';
import { ApiClient, LocalDB, DBKeys } from '../../core';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => LocalDB.getJSON(DBKeys.USER_PROFILE));

  const [token, setToken] = useState(() => ApiClient.getToken());
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    if (token) {
      ApiClient.setToken(token);
    } else {
      ApiClient.clearToken();
    }
  }, [token]);

  const saveAuthSession = useCallback((tokenStr, userData) => {
    setToken(tokenStr);
    setUser(userData);
    ApiClient.setToken(tokenStr);
    LocalDB.setJSON(DBKeys.USER_PROFILE, userData);
  }, []);


  const login = useCallback(
    async (username, password) => {
      setLoading(true);
      setAuthError(null);
      try {
        const res = await ApiClient.post('/auth/login', { username, password });
        saveAuthSession(res.token, res.user);
        setIsAuthModalOpen(false);
        return res;
      } catch (err) {
        setAuthError(err.message || 'Login failed. Please check your credentials.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [saveAuthSession]
  );

  const register = useCallback(
    async (username, password, email) => {
      setLoading(true);
      setAuthError(null);
      try {
        const res = await ApiClient.post('/auth/register', { username, password, email });
        saveAuthSession(res.token, res.user);
        setIsAuthModalOpen(false);
        return res;
      } catch (err) {
        setAuthError(err.message || 'Registration failed.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [saveAuthSession]
  );

  const loginWithGoogle = useCallback(
    async (idToken) => {
      setLoading(true);
      setAuthError(null);
      try {
        const res = await ApiClient.post('/auth/google', { token: idToken });
        saveAuthSession(res.token, res.user);
        setIsAuthModalOpen(false);
        return res;
      } catch (err) {
        const msg = err.message || 'Google Sign-In failed. Please try again.';
        setAuthError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [saveAuthSession]
  );

  const ensureCustomerSession = useCallback(async () => {
    if (token && user) return { token, user };

    // Auto-create or reuse guest foodie session so order placement never fails
    try {
      const guestUsername = `guest_${Math.floor(1000 + Math.random() * 9000)}`;
      const guestPassword = 'password123';
      const guestEmail = `${guestUsername}@bitecraft.local`;
      const res = await ApiClient.post('/auth/register', {
        username: guestUsername,
        password: guestPassword,
        email: guestEmail,
      });
      saveAuthSession(res.token, res.user);
      return { token: res.token, user: res.user };
    } catch (err) {
      console.warn('[AuthProvider] Guest session auto-creation warning:', err);
      return null;
    }
  }, [token, user, saveAuthSession]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    ApiClient.clearToken();
    LocalDB.remove(DBKeys.USER_PROFILE);
  }, []);


  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    authError,
    login,
    register,
    loginWithGoogle,
    logout,
    ensureCustomerSession,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
