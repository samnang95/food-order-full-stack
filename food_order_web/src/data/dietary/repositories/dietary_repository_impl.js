import { DietaryRepository } from '../../../domain/dietary/repositories/dietary_repository';
import { FoodNutritionCatalog } from '../services/food_nutrition_catalog';
import { NutritionalInfoEntity } from '../../../domain/dietary/entities/nutritional_info_entity';
import { DIET_TYPES } from '../../../domain/dietary/entities/dietary_info_entity';

export class DietaryRepositoryImpl extends DietaryRepository {
  constructor({ localDataSource }) {
    super();
    this.localDataSource = localDataSource;
  }

  async getUserPreferences() {
    return this.localDataSource.getUserPreferences();
  }

  async saveUserPreferences(preferences) {
    return this.localDataSource.saveUserPreferences(preferences);
  }

  getDishNutritionAndDietary(food) {
    return FoodNutritionCatalog.getNutritionAndDietary(food);
  }

  filterDishes({ foods = [], activeDietTag = DIET_TYPES.ALL, userPreferences = null }) {
    if (!Array.isArray(foods)) return [];

    return foods.filter((food) => {
      const { dietary } = FoodNutritionCatalog.getNutritionAndDietary(food);

      // 1. If user has allergen exclusions set, check for conflicts
      if (userPreferences && userPreferences.allergensToAvoid?.length > 0) {
        const allergenConflicts = userPreferences.checkAllergenConflict(dietary);
        if (allergenConflicts.length > 0) {
          return false;
        }
      }

      // 2. If activeDietTag is specified (e.g. 'halal', 'vegan', 'gluten_free', etc.)
      if (activeDietTag && activeDietTag !== DIET_TYPES.ALL) {
        if (!dietary.matchesDietType(activeDietTag)) {
          return false;
        }
      }

      // 3. If user has active general diets set in preferences, filter unless overridden
      if (userPreferences && userPreferences.activeDiets?.length > 0) {
        for (const diet of userPreferences.activeDiets) {
          if (!dietary.matchesDietType(diet)) {
            return false;
          }
        }
      }

      return true;
    });
  }

  calculateNutritionSummary(cartItems = []) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSodium = 0;

    const itemsSummary = [];

    for (const item of cartItems) {
      const food = item.food || item;
      const qty = Number(item.quantity) || 1;
      const { nutrition, dietary } = FoodNutritionCatalog.getNutritionAndDietary(food);

      totalCalories += nutrition.calories * qty;
      totalProtein += nutrition.protein * qty;
      totalCarbs += nutrition.carbs * qty;
      totalFat += nutrition.fat * qty;
      totalFiber += nutrition.fiber * qty;
      totalSodium += nutrition.sodium * qty;

      itemsSummary.push({
        id: food.id || item.id,
        name: food.name || item.name,
        quantity: qty,
        nutrition,
        dietary,
        subtotalCalories: nutrition.calories * qty,
      });
    }

    const aggregated = new NutritionalInfoEntity({
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      fiber: totalFiber,
      sodium: totalSodium,
    });

    return {
      aggregated,
      itemsSummary,
    };
  }
}
