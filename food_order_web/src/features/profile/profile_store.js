import { useReducer, useCallback } from 'react';
import { initialProfileState } from './profile_state';
import { ProfileIntentType } from './profile_intent';

/**
 * Pure Reducer: receives current profile state and intent, returns new state
 */
export function profileReducer(state, action) {
  switch (action.type) {
    case ProfileIntentType.OPEN_EDIT_MODAL:
      return {
        ...state,
        isEditModalOpen: true,
      };

    case ProfileIntentType.CLOSE_EDIT_MODAL:
      return {
        ...state,
        isEditModalOpen: false,
      };

    case ProfileIntentType.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload || 'overview',
      };

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow for Profile
 */
export function useProfileStore() {
  const [state, dispatch] = useReducer(profileReducer, initialProfileState);

  const onIntent = useCallback((intent) => {
    dispatch(intent);
  }, []);

  return {
    state,
    onIntent,
    isEditModalOpen: state.isEditModalOpen,
    activeTab: state.activeTab,
  };
}
