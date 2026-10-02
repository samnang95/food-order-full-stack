export interface RestaurantProfileUpdate {
  name?: string;
  phone?: string;
  address?: string;
  autoAcceptOrders?: boolean;
  soundAlerts?: boolean;
  maxConcurrentOrders?: number;
}

/**
 * Intent (I) in MVI for Settings & Operations:
 */
export const SettingsIntentType = {
  TEST_API_START: 'SETTINGS/TEST_API_START',
  TEST_API_SUCCESS: 'SETTINGS/TEST_API_SUCCESS',
  TEST_API_ERROR: 'SETTINGS/TEST_API_ERROR',

  UPDATE_PROFILE: 'SETTINGS/UPDATE_PROFILE',
  SAVE_SETTINGS: 'SETTINGS/SAVE_SETTINGS',
} as const;

export type SettingsIntent =
  | { type: typeof SettingsIntentType.TEST_API_START }
  | { type: typeof SettingsIntentType.TEST_API_SUCCESS }
  | { type: typeof SettingsIntentType.TEST_API_ERROR }
  | { type: typeof SettingsIntentType.UPDATE_PROFILE; payload: RestaurantProfileUpdate }
  | { type: typeof SettingsIntentType.SAVE_SETTINGS };

export const SettingsIntents = {
  testApi: (): SettingsIntent => ({
    type: SettingsIntentType.TEST_API_START,
  }),
  updateProfile: (profile: RestaurantProfileUpdate): SettingsIntent => ({
    type: SettingsIntentType.UPDATE_PROFILE,
    payload: profile,
  }),
  saveSettings: (): SettingsIntent => ({
    type: SettingsIntentType.SAVE_SETTINGS,
  }),
};
