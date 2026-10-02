import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import { checkApiHealth } from '../../../core/services/api_client';
import { LocalDB, DBKeys } from '../../../core/db';
import { useAppStore } from '../../layout/stores/app_store';
import { SettingsIntentType, type SettingsIntent, SettingsIntents } from '../settings_intent';
import { initialSettingsState, type SettingsState, type RestaurantProfile } from '../settings_state';

export const useSettingsStore = defineStore('settings', () => {
  const appStore = useAppStore();

  // Load persisted profile from LocalDB if available
  const savedProfile = LocalDB.getJson<RestaurantProfile>(DBKeys.STORE_PROFILE);
  const state = reactive<SettingsState>({
    ...initialSettingsState,
    profile: savedProfile ? { ...initialSettingsState.profile, ...savedProfile } : { ...initialSettingsState.profile },
  });

  async function dispatch(intent: SettingsIntent) {
    switch (intent.type) {
      case SettingsIntentType.TEST_API_START: {
        state.isTestingApi = true;
        const isHealthy = await checkApiHealth();
        state.isTestingApi = false;
        state.apiStatus = isHealthy ? 'connected' : 'offline';
        appStore.apiStatus = isHealthy ? 'connected' : 'offline';
        break;
      }

      case SettingsIntentType.UPDATE_PROFILE: {
        state.profile = {
          ...state.profile,
          ...intent.payload,
        } as RestaurantProfile;
        LocalDB.setJson(DBKeys.STORE_PROFILE, state.profile);
        break;
      }

      case SettingsIntentType.SAVE_SETTINGS: {
        appStore.soundEnabled = state.profile.soundAlerts;
        LocalDB.setJson(DBKeys.STORE_PROFILE, state.profile);
        LocalDB.setBool(DBKeys.SOUND_ENABLED, state.profile.soundAlerts);
        state.isSavedToastVisible = true;
        setTimeout(() => {
          state.isSavedToastVisible = false;
        }, 3000);
        break;
      }
    }
  }

  const profile = computed(() => state.profile);
  const isTestingApi = computed(() => state.isTestingApi);
  const apiStatus = computed(() => state.apiStatus);
  const isSavedToastVisible = computed(() => state.isSavedToastVisible);

  return {
    state,
    dispatch,
    profile,
    isTestingApi,
    apiStatus,
    isSavedToastVisible,
    testApi: () => dispatch(SettingsIntents.testApi()),
    saveSettings: () => dispatch(SettingsIntents.saveSettings()),
  };
});
