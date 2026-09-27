/**
 * Intent (I) in MVI:
 * Plain actions representing user intents and profile events.
 */
export const ProfileIntentType = {
  OPEN_EDIT_MODAL: 'PROFILE/OPEN_EDIT_MODAL',
  CLOSE_EDIT_MODAL: 'PROFILE/CLOSE_EDIT_MODAL',
  SET_ACTIVE_TAB: 'PROFILE/SET_ACTIVE_TAB',
};

export const ProfileIntent = {
  openEditModal: () => ({
    type: ProfileIntentType.OPEN_EDIT_MODAL,
  }),

  closeEditModal: () => ({
    type: ProfileIntentType.CLOSE_EDIT_MODAL,
  }),

  setActiveTab: (tab) => ({
    type: ProfileIntentType.SET_ACTIVE_TAB,
    payload: tab,
  }),
};
