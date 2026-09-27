import { DietaryRepository } from '../../../domain/dietary/repositories/dietary_repository';
import { FoodNutritionCatalog } from '../services/food_nutrition_catalog';
import { NutritionalInfoEntity } from '../../../domain/dietary/entities/nutritional_info_entity';
import { DIET_TYPES } from '../../../domain/dietary/entities/dietary_info_entity';
import { DietaryRemoteDataSource } from '../datasources/dietary_remote_datasource';

export class DietaryRepositoryImpl extends DietaryRepository {
  constructor({ localDataSource, remoteDataSource = new DietaryRemoteDataSource() }) {
    super();
    this.localDataSource = localDataSource;
    this.remoteDataSource = remoteDataSource;
  }

  async getUserPreferences() {
    const local = await this.localDataSource.getUserPreferences();
    try {
      const remote = await this.remoteDataSource.getPreferences();
      if (remote) {
        await this.localDataSource.saveUserPreferences(remote);
        return await this.localDataSource.getUserPreferences();
      }
    } catch (e) {
      console.debug('Using local dietary preferences fallback:', e.message);
    }
    return local;
  }

  async saveUserPreferences(preferences) {
    const saved = await this.localDataSource.saveUserPreferences(preferences);
    try {
      await this.remoteDataSource.savePreferences(preferences);
    } catch (e) {
      console.debug('Backend dietary save note:', e.message);
    }
    return saved;
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
