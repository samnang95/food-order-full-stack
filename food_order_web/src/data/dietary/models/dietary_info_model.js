import { DietaryInfoEntity } from '../../../domain/dietary/entities/dietary_info_entity';

export class DietaryInfoModel {
  static fromJson(raw = {}) {
    return new DietaryInfoEntity({
      isHalal: Boolean(raw.isHalal),
      isVegetarian: Boolean(raw.isVegetarian),
      isVegan: Boolean(raw.isVegan),
      isGlutenFree: Boolean(raw.isGlutenFree),
      isNutFree: Boolean(raw.isNutFree),
      isDairyFree: Boolean(raw.isDairyFree),
      isHighProtein: Boolean(raw.isHighProtein),
      isKeto: Boolean(raw.isKeto),
      allergens: Array.isArray(raw.allergens) ? raw.allergens : [],
      spiceLevel: Number(raw.spiceLevel) || 0,
    });
  }

  static toJson(entity) {
    if (!entity) return {};
    return {
      isHalal: entity.isHalal,
      isVegetarian: entity.isVegetarian,
      isVegan: entity.isVegan,
      isGlutenFree: entity.isGlutenFree,
      isNutFree: entity.isNutFree,
      isDairyFree: entity.isDairyFree,
      isHighProtein: entity.isHighProtein,
      isKeto: entity.isKeto,
      allergens: entity.allergens,
      spiceLevel: entity.spiceLevel,
    };
  }
}
