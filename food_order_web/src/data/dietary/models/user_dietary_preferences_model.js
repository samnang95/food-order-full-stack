import { UserDietaryPreferencesEntity } from '../../../domain/dietary/entities/user_dietary_preferences_entity';

export class UserDietaryPreferencesModel {
  static fromJson(raw = {}) {
    return new UserDietaryPreferencesEntity({
      activeDiets: Array.isArray(raw.activeDiets) ? raw.activeDiets : [],
      allergensToAvoid: Array.isArray(raw.allergensToAvoid) ? raw.allergensToAvoid : [],
      dailyCalorieTarget: Number(raw.dailyCalorieTarget) || 2000,
      dailyProteinTarget: Number(raw.dailyProteinTarget) || 75,
      showMacroBadges: raw.showMacroBadges !== false,
    });
  }

  static toJson(entity) {
    if (!entity) return {};
    return {
      activeDiets: entity.activeDiets,
      allergensToAvoid: entity.allergensToAvoid,
      dailyCalorieTarget: entity.dailyCalorieTarget,
      dailyProteinTarget: entity.dailyProteinTarget,
      showMacroBadges: entity.showMacroBadges,
    };
  }
}
