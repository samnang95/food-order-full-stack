import { NutritionalInfoEntity } from '../../../domain/dietary/entities/nutritional_info_entity';

export class NutritionalInfoModel {
  static fromJson(raw = {}) {
    return new NutritionalInfoEntity({
      calories: raw.calories ?? 0,
      protein: raw.protein ?? 0,
      carbs: raw.carbs ?? 0,
      fat: raw.fat ?? 0,
      fiber: raw.fiber ?? 0,
      sodium: raw.sodium ?? 0,
    });
  }

  static toJson(entity) {
    if (!entity) return {};
    return {
      calories: entity.calories,
      protein: entity.protein,
      carbs: entity.carbs,
      fat: entity.fat,
      fiber: entity.fiber,
      sodium: entity.sodium,
    };
  }
}
