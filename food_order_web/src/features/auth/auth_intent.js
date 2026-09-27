export const AuthIntentType = {
  SET_LOADING: 'AUTH/SET_LOADING',
  SET_AUTH_ERROR: 'AUTH/SET_AUTH_ERROR',
  SET_AUTH_SESSION: 'AUTH/SET_AUTH_SESSION',
  CLEAR_AUTH_SESSION: 'AUTH/CLEAR_AUTH_SESSION',
  UPDATE_USER_DATA: 'AUTH/UPDATE_USER_DATA',

  OPEN_AUTH_MODAL: 'AUTH/OPEN_AUTH_MODAL',
  CLOSE_AUTH_MODAL: 'AUTH/CLOSE_AUTH_MODAL',
  SET_AUTH_MODAL_MODE: 'AUTH/SET_AUTH_MODAL_MODE',
};

export const AuthIntent = {
  setLoading: (loading) => ({
    type: AuthIntentType.SET_LOADING,
    payload: loading,
  }),

  setAuthError: (error) => ({
    type: AuthIntentType.SET_AUTH_ERROR,
    payload: error,
  }),

  setAuthSession: ({ token, user }) => ({
    type: AuthIntentType.SET_AUTH_SESSION,
    payload: { token, user },
  }),

  clearAuthSession: () => ({
    type: AuthIntentType.CLEAR_AUTH_SESSION,
  }),

  updateUserData: (updatedFields) => ({
    type: AuthIntentType.UPDATE_USER_DATA,
    payload: updatedFields,
  }),

  openAuthModal: (mode = 'login') => ({
    type: AuthIntentType.OPEN_AUTH_MODAL,
    payload: mode,
  }),

  closeAuthModal: () => ({
    type: AuthIntentType.CLOSE_AUTH_MODAL,
  }),

  setAuthModalMode: (mode) => ({
    type: AuthIntentType.SET_AUTH_MODAL_MODE,
    payload: mode,
  }),
};
