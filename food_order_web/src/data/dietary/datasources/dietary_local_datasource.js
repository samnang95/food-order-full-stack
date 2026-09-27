import { UserDietaryPreferencesModel } from '../models/user_dietary_preferences_model';
import { UserDietaryPreferencesEntity } from '../../../domain/dietary/entities/user_dietary_preferences_entity';

const PREFERENCES_STORAGE_KEY = 'bitecraft_dietary_user_preferences';

export class DietaryLocalDataSource {
  constructor(storage = window.localStorage) {
    this.storage = storage;
  }

  getUserPreferences() {
    try {
      const raw = this.storage.getItem(PREFERENCES_STORAGE_KEY);
      if (!raw) {
        return new UserDietaryPreferencesEntity();
      }
      const parsed = JSON.parse(raw);
      return UserDietaryPreferencesModel.fromJson(parsed);
    } catch (e) {
      console.warn('Error reading dietary preferences from storage:', e);
      return new UserDietaryPreferencesEntity();
    }
  }

  saveUserPreferences(preferences) {
    try {
      const json = UserDietaryPreferencesModel.toJson(preferences);
      this.storage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(json));
      return true;
    } catch (e) {
      console.warn('Error saving dietary preferences to storage:', e);
      return false;
    }
  }
}
