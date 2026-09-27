import { UserDietaryPreferencesEntity } from '../../domain/dietary/entities/user_dietary_preferences_entity';
import { DIET_TYPES } from '../../domain/dietary/entities/dietary_info_entity';

export const initialDietaryState = {
  preferences: new UserDietaryPreferencesEntity(),
  activeDietTag: DIET_TYPES.ALL,
  isPreferencesModalOpen: false,
  isCartNutritionExpanded: true,
  isLoading: false,
  error: null,
};
