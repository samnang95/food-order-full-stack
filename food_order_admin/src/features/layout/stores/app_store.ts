import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import { LayoutIntentType, type LayoutIntent, LayoutIntents } from '../layout_intent';
import { initialLayoutState, type LayoutState } from '../layout_state';

export const useAppStore = defineStore('app', () => {
  const state = reactive<LayoutState>({ ...initialLayoutState });

  function dispatch(intent: LayoutIntent) {
    switch (intent.type) {
      case LayoutIntentType.TOGGLE_SIDEBAR:
        state.isSidebarCollapsed = !state.isSidebarCollapsed;
        break;
      case LayoutIntentType.SET_RESTAURANT_STATUS:
        state.restaurantStatus = intent.payload;
        break;
      case LayoutIntentType.MARK_NOTIFICATIONS_READ:
        state.notifications.forEach((n) => (n.unread = false));
        break;
      case LayoutIntentType.SET_SOUND_ENABLED:
        state.soundEnabled = intent.payload;
        break;
    }
  }

  const isSidebarCollapsed = computed({
    get: () => state.isSidebarCollapsed,
    set: () => dispatch(LayoutIntents.toggleSidebar()),
  });
  const restaurantStatus = computed({
    get: () => state.restaurantStatus,
    set: (s: 'open' | 'busy' | 'closed') => dispatch(LayoutIntents.setRestaurantStatus(s)),
  });
  const apiStatus = computed({
    get: () => state.apiStatus,
    set: (val: 'connected' | 'checking' | 'offline') => {
      state.apiStatus = val;
    },
  });
  const soundEnabled = computed({
    get: () => state.soundEnabled,
    set: (val: boolean) => dispatch(LayoutIntents.setSoundEnabled(val)),
  });
  const notifications = computed(() => state.notifications);

  return {
    state,
    dispatch,
    isSidebarCollapsed,
    restaurantStatus,
    apiStatus,
    soundEnabled,
    notifications,
    toggleSidebar: () => dispatch(LayoutIntents.toggleSidebar()),
    setRestaurantStatus: (s: 'open' | 'busy' | 'closed') => dispatch(LayoutIntents.setRestaurantStatus(s)),
    markNotificationsAsRead: () => dispatch(LayoutIntents.markNotificationsRead()),
  };
});
