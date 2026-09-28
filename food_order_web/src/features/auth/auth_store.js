import { useReducer, useEffect, useCallback } from 'react';
import { createInitialAuthState } from './auth_state';
import { AuthIntentType, AuthIntent } from './auth_intent';
import { ApiClient, LocalDB, DBKeys, firebaseService } from '../../core';

/**
 * Pure Reducer: receives current auth state and intent, returns new state
 */
export function authReducer(state, action) {
  switch (action.type) {
    case AuthIntentType.SET_LOADING:
      return {
        ...state,
        loading: Boolean(action.payload),
      };

    case AuthIntentType.SET_AUTH_ERROR:
      return {
        ...state,
        authError: action.payload,
      };

    case AuthIntentType.SET_AUTH_SESSION: {
      const { token, user } = action.payload;
      return {
        ...state,
        token,
        user,
        isAuthenticated: Boolean(token && user),
        authError: null,
      };
    }

    case AuthIntentType.CLEAR_AUTH_SESSION:
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        authError: null,
      };

    case AuthIntentType.UPDATE_USER_DATA: {
      const updatedUser = state.user ? { ...state.user, ...action.payload } : action.payload;
      return {
        ...state,
        user: updatedUser,
      };
    }

    case AuthIntentType.OPEN_AUTH_MODAL:
      return {
        ...state,
        isAuthModalOpen: true,
        authModalMode: action.payload || 'login',
        authError: null,
      };

    case AuthIntentType.CLOSE_AUTH_MODAL:
      return {
        ...state,
        isAuthModalOpen: false,
        authError: null,
      };

    case AuthIntentType.SET_AUTH_MODAL_MODE:
      return {
        ...state,
        authModalMode: action.payload || 'login',
        authError: null,
      };

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects for Authentication
 */
export function useAuthStore() {
  const [state, dispatch] = useReducer(authReducer, undefined, createInitialAuthState);

  useEffect(() => {
    if (state.token) {
      ApiClient.setToken(state.token);
    } else {
      ApiClient.clearToken();
    }
  }, [state.token]);

  const saveAuthSession = useCallback((tokenStr, userData) => {
    dispatch(AuthIntent.setAuthSession({ token: tokenStr, user: userData }));
    ApiClient.setToken(tokenStr);
    LocalDB.setJSON(DBKeys.USER_PROFILE, userData);
    firebaseService.syncTokenWithBackend();
  }, []);

  const login = useCallback(
    async (username, password) => {
      dispatch(AuthIntent.setLoading(true));
      dispatch(AuthIntent.setAuthError(null));
      try {
        const res = await ApiClient.post('/auth/login', { username, password });
        saveAuthSession(res.token, res.user);
        dispatch(AuthIntent.closeAuthModal());
        return res;
      } catch (err) {
        const msg = err.message || 'Login failed. Please check your credentials.';
        dispatch(AuthIntent.setAuthError(msg));
        throw err;
      } finally {
        dispatch(AuthIntent.setLoading(false));
      }
    },
    [saveAuthSession]
  );

  const register = useCallback(
    async (username, password, email) => {
      dispatch(AuthIntent.setLoading(true));
      dispatch(AuthIntent.setAuthError(null));
      try {
        const res = await ApiClient.post('/auth/register', { username, password, email });
        saveAuthSession(res.token, res.user);
        dispatch(AuthIntent.closeAuthModal());
        return res;
      } catch (err) {
        const msg = err.message || 'Registration failed.';
        dispatch(AuthIntent.setAuthError(msg));
        throw err;
      } finally {
        dispatch(AuthIntent.setLoading(false));
      }
    },
    [saveAuthSession]
  );

  const loginWithGoogle = useCallback(
    async (idToken) => {
      dispatch(AuthIntent.setLoading(true));
      dispatch(AuthIntent.setAuthError(null));
      try {
        const res = await ApiClient.post('/auth/google', { token: idToken });
        saveAuthSession(res.token, res.user);
        dispatch(AuthIntent.closeAuthModal());
        return res;
      } catch (err) {
        const msg = err.message || 'Google Sign-In failed. Please try again.';
        dispatch(AuthIntent.setAuthError(msg));
        throw err;
      } finally {
        dispatch(AuthIntent.setLoading(false));
      }
    },
    [saveAuthSession]
  );

  const ensureCustomerSession = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && state.token && state.user && state.token !== 'token_phnom_penh_verified') {
      return { token: state.token, user: state.user };
    }

    try {
      const guestUsername = `guest_${Math.floor(1000 + Math.random() * 9000)}`;
      const guestPassword = 'password123';
      const guestEmail = `${guestUsername}@bitecraft.local`;
      const res = await ApiClient.post('/auth/register', {
        username: guestUsername,
        password: guestPassword,
        email: guestEmail,
      });

      if (res && res.token) {
        saveAuthSession(res.token, res.user);
        return res;
      }
    } catch (err) {
      console.warn('[AuthStore] Guest registration error, using fallback:', err);
    }

    const fallbackUser = {
      id: '6ab8774eabb2e4cd2315bb6b',
      name: 'Samnang',
      phone: '+855 12 888 999',
      address: 'Street 240, Daun Penh, Phnom Penh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    saveAuthSession('token_phnom_penh_verified', fallbackUser);
    return { token: 'token_phnom_penh_verified', user: fallbackUser };
  }, [state.token, state.user, saveAuthSession]);

  const logout = useCallback(() => {
    dispatch(AuthIntent.clearAuthSession());
    ApiClient.clearToken();
    LocalDB.remove(DBKeys.USER_PROFILE);
  }, []);

  const updateProfile = useCallback(
    async (updatedFields) => {
      dispatch(AuthIntent.setLoading(true));
      dispatch(AuthIntent.setAuthError(null));
      try {
        let resUser = null;
        try {
          const res = await ApiClient.put('/auth/profile', updatedFields);
          resUser = res?.user || res?.data;
        } catch {
          // Local fallback
        }

        const newUser = { ...(state.user || {}), ...updatedFields, ...(resUser || {}) };
        dispatch(AuthIntent.updateUserData(newUser));
        LocalDB.setJSON(DBKeys.USER_PROFILE, newUser);
        return newUser;
      } catch (err) {
        const msg = err.message || 'Failed to update profile';
        dispatch(AuthIntent.setAuthError(msg));
        throw err;
      } finally {
        dispatch(AuthIntent.setLoading(false));
      }
    },
    [state.user]
  );

  const openAuthModal = useCallback((mode = 'login') => {
    dispatch(AuthIntent.openAuthModal(mode));
  }, []);

  const closeAuthModal = useCallback(() => {
    dispatch(AuthIntent.closeAuthModal());
  }, []);

  const onIntent = useCallback((intent) => {
    dispatch(intent);
  }, []);

  return {
    state,
    onIntent,
    user: state.user,
    token: state.token,
    loading: state.loading,
    authError: state.authError,
    isAuthenticated: state.isAuthenticated,
    isAuthModalOpen: state.isAuthModalOpen,
    authModalMode: state.authModalMode,
    login,
    register,
    loginWithGoogle,
    ensureCustomerSession,
    logout,
    updateProfile,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode: (mode) => dispatch(AuthIntent.setAuthModalMode(mode)),
  };
}
