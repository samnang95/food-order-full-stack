import { ApiClient, LocalDB, DBKeys } from '../../core';

/**
 * Model / State (M) in MVI:
 * Immutable representation of the Authentication feature state.
 */
export function createInitialAuthState() {
  const user = LocalDB.getJSON(DBKeys.USER_PROFILE, null);
  const token = ApiClient.getToken() || null;

  return {
    user,
    token,
    loading: false,
    authError: null,
    isAuthModalOpen: false,
    authModalMode: 'login', // 'login' | 'register'
    isAuthenticated: Boolean(user && token),
  };
}
