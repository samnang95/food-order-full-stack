/**
 * Intent (I) in MVI for Layout & System App state:
 */
export const LayoutIntentType = {
  TOGGLE_SIDEBAR: 'LAYOUT/TOGGLE_SIDEBAR',
  TOGGLE_MOBILE_SIDEBAR: 'LAYOUT/TOGGLE_MOBILE_SIDEBAR',
  CLOSE_MOBILE_SIDEBAR: 'LAYOUT/CLOSE_MOBILE_SIDEBAR',
  SET_RESTAURANT_STATUS: 'LAYOUT/SET_RESTAURANT_STATUS',
  MARK_NOTIFICATIONS_READ: 'LAYOUT/MARK_NOTIFICATIONS_READ',
  SET_SOUND_ENABLED: 'LAYOUT/SET_SOUND_ENABLED',
} as const;

export type LayoutIntent =
  | { type: typeof LayoutIntentType.TOGGLE_SIDEBAR }
  | { type: typeof LayoutIntentType.TOGGLE_MOBILE_SIDEBAR }
  | { type: typeof LayoutIntentType.CLOSE_MOBILE_SIDEBAR }
  | { type: typeof LayoutIntentType.SET_RESTAURANT_STATUS; payload: 'open' | 'busy' | 'closed' }
  | { type: typeof LayoutIntentType.MARK_NOTIFICATIONS_READ }
  | { type: typeof LayoutIntentType.SET_SOUND_ENABLED; payload: boolean };

export const LayoutIntents = {
  toggleSidebar: (): LayoutIntent => ({
    type: LayoutIntentType.TOGGLE_SIDEBAR,
  }),
  toggleMobileSidebar: (): LayoutIntent => ({
    type: LayoutIntentType.TOGGLE_MOBILE_SIDEBAR,
  }),
  closeMobileSidebar: (): LayoutIntent => ({
    type: LayoutIntentType.CLOSE_MOBILE_SIDEBAR,
  }),
  setRestaurantStatus: (status: 'open' | 'busy' | 'closed'): LayoutIntent => ({
    type: LayoutIntentType.SET_RESTAURANT_STATUS,
    payload: status,
  }),
  markNotificationsRead: (): LayoutIntent => ({
    type: LayoutIntentType.MARK_NOTIFICATIONS_READ,
  }),
  setSoundEnabled: (enabled: boolean): LayoutIntent => ({
    type: LayoutIntentType.SET_SOUND_ENABLED,
    payload: enabled,
  }),
};
