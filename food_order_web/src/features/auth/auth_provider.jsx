import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './auth_context';
import { ApiClient, LocalDB, DBKeys, firebaseService } from '../../core';

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
    firebaseService.syncTokenWithBackend();
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

  const updateProfile = useCallback(
    async (updateData) => {
      setLoading(true);
      setAuthError(null);
      try {
        let updatedUser = { ...user, ...updateData };
        if (token) {
          try {
            const res = await ApiClient.put('/users/profile', updateData);
            if (res?.user) {
              updatedUser = { ...user, ...res.user };
            }
          } catch (apiErr) {
            console.warn('API update failed, updating local profile:', apiErr.message);
          }
        }
        setUser(updatedUser);
        LocalDB.setJSON(DBKeys.USER_PROFILE, updatedUser);
        return updatedUser;
      } catch (err) {
        setAuthError(err.message || 'Failed to update profile');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, token]
  );

  const changePassword = useCallback(
    async (oldPassword, newPassword) => {
      setLoading(true);
      setAuthError(null);
      try {
        if (!token) throw new Error('You must be logged in to change your password');
        const res = await ApiClient.put('/users/profile/password', { oldPassword, newPassword });
        return res;
      } catch (err) {
        setAuthError(err.message || 'Failed to change password');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const uploadAvatar = useCallback(
    async (file) => {
      if (!file) return null;
      setLoading(true);
      setAuthError(null);
      try {
        let avatarUrl = '';
        if (file instanceof File) {
          if (token) {
            try {
              const formData = new FormData();
              formData.append('image', file);
              const headers = {};
              const currentToken = ApiClient.getToken();
              if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`;

              const res = await fetch('/api/upload', {
                method: 'POST',
                headers,
                body: formData,
              });
              if (res.ok) {
                const data = await res.json();
                avatarUrl = data?.image?.url || '';
              }
            } catch (upErr) {
              console.warn('Upload to server failed, falling back to local preview:', upErr);
            }
          }

          if (!avatarUrl) {
            avatarUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(file);
            });
          }
        } else if (typeof file === 'string') {
          avatarUrl = file;
        }

        if (avatarUrl) {
          await updateProfile({ avatar: avatarUrl });
        }
        return avatarUrl;
      } catch (err) {
        setAuthError(err.message || 'Failed to update avatar photo');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, updateProfile]
  );

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
    updateProfile,
    changePassword,
    uploadAvatar,
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
