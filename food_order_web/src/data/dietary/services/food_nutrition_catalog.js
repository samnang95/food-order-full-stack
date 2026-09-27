import { NutritionalInfoEntity } from '../../../domain/dietary/entities/nutritional_info_entity';
import { DietaryInfoEntity } from '../../../domain/dietary/entities/dietary_info_entity';

export class FoodNutritionCatalog {
  /**
   * Deterministically analyze dish attributes and return { nutrition, dietary }
   */
  static getNutritionAndDietary(food) {
    if (!food) {
      return {
        nutrition: new NutritionalInfoEntity({ calories: 450, protein: 20, carbs: 45, fat: 15 }),
        dietary: new DietaryInfoEntity(),
      };
    }

    const name = (food.name || '').toLowerCase();
    const desc = (food.description || '').toLowerCase();
    const cat = (food.categoryName || '').toLowerCase();
    const text = `${name} ${desc} ${cat}`;

    // Base defaults based on category
    let calories = 480;
    let protein = 22;
    let carbs = 50;
    let fat = 18;
    let fiber = 3;
    let sodium = 650;

    let isHalal = true; // Default food in local market is certified halal or pork-free unless pork specified
    let isVegetarian = false;
    let isVegan = false;
    let isGlutenFree = false;
    let isNutFree = true;
    let isDairyFree = true;
    let isHighProtein = false;
    let isKeto = false;
    const allergens = [];
    let spiceLevel = 0;

    // Detect meat / plant-based
    const hasPork = text.includes('pork') || text.includes('bacon') || text.includes('ribs');
    const hasBeef = text.includes('beef') || text.includes('lok lak') || text.includes('steak') || text.includes('wagyu') || text.includes('burger');
    const hasChicken = text.includes('chicken') || text.includes('poultry') || text.includes('wings');
    const hasSeafood = text.includes('shrimp') || text.includes('fish') || text.includes('salmon') || text.includes('seafood') || text.includes('crab') || text.includes('calamari') || text.includes('prawn');
    const hasEgg = text.includes('egg') || text.includes('omelet') || text.includes('mayo');
    const hasDairy = text.includes('cheese') || text.includes('milk') || text.includes('cream') || text.includes('butter') || text.includes('yogurt') || text.includes('parmesan') || text.includes('mozzarella');
    const hasPeanut = text.includes('peanut') || text.includes('satay') || text.includes('pad thai');
    const hasGluten = text.includes('bread') || text.includes('bun') || text.includes('pasta') || text.includes('pizza') || text.includes('noodle') || text.includes('ramen') || text.includes('wheat') || text.includes('flour') || text.includes('croissant');

    if (hasPork) {
      isHalal = false;
    }

    if (hasEgg) {
      allergens.push('eggs');
    }

    if (hasDairy) {
      isDairyFree = false;
      allergens.push('dairy');
    }

    if (hasPeanut) {
      isNutFree = false;
      allergens.push('peanuts');
    }

    if (hasSeafood) {
      allergens.push('shellfish');
    }

    if (hasGluten) {
      allergens.push('gluten');
    } else {
      isGlutenFree = true;
    }

    // Specific food heuristics:
    if (text.includes('salad') || text.includes('bowl') || text.includes('vegan') || text.includes('green') || text.includes('tofu') || text.includes('avocado')) {
      if (!hasBeef && !hasChicken && !hasPork && !hasSeafood) {
        isVegetarian = true;
        if (!hasDairy && !hasEgg) {
          isVegan = true;
        }
      }
      calories = 360;
      protein = 16;
      carbs = 35;
      fat = 14;
      fiber = 7;
      sodium = 420;
    } else if (text.includes('burger') || text.includes('pizza')) {
      calories = 680;
      protein = 34;
      carbs = 62;
      fat = 32;
      fiber = 3;
      sodium = 980;
      isGlutenFree = false;
      isHighProtein = true;
      if (!allergens.includes('gluten')) allergens.push('gluten');
      if (!allergens.includes('dairy')) allergens.push('dairy');
    } else if (text.includes('noodle') || text.includes('ramen') || text.includes('pho') || text.includes('pad thai')) {
      calories = 540;
      protein = 24;
      carbs = 72;
      fat = 16;
      fiber = 4;
      sodium = 1120;
      spiceLevel = 1;
      if (text.includes('pho')) {
        isGlutenFree = true; // rice noodles
      }
    } else if (text.includes('lok lak') || text.includes('amok') || text.includes('curry') || text.includes('rice')) {
      calories = 590;
      protein = 36;
      carbs = 65;
      fat = 18;
      fiber = 3;
      sodium = 850;
      isGlutenFree = true; // rice-based Khmer signature
      spiceLevel = text.includes('curry') ? 2 : 1;
      isHighProtein = true;
    } else if (text.includes('drink') || text.includes('coffee') || text.includes('latte') || text.includes('tea') || text.includes('smoothie')) {
      calories = 190;
      protein = 4;
      carbs = 32;
      fat = 5;
      fiber = 1;
      sodium = 80;
      isVegetarian = true;
      isGlutenFree = true;
      if (!hasDairy) isVegan = true;
    } else if (text.includes('dessert') || text.includes('cake') || text.includes('sweet') || text.includes('ice cream')) {
      calories = 420;
      protein = 6;
      carbs = 58;
      fat = 19;
      fiber = 2;
      sodium = 220;
      isVegetarian = true;
    }

    // High protein threshold
    if (protein >= 28) {
      isHighProtein = true;
    }

    // Keto check: low carbs, high fat/protein
    if (carbs <= 20 && fat >= 18) {
      isKeto = true;
    }

    // Add mild spice level for curries or spicy items
    if (text.includes('spicy') || text.includes('chili') || text.includes('hot')) {
      spiceLevel = Math.max(spiceLevel, 3);
    }

    const nutrition = new NutritionalInfoEntity({
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sodium,
    });

    const dietary = new DietaryInfoEntity({
      isHalal,
      isVegetarian,
      isVegan,
      isGlutenFree,
      isNutFree,
      isDairyFree,
      isHighProtein,
      isKeto,
      allergens: [...new Set(allergens)],
      spiceLevel,
    });

    return { nutrition, dietary };
  }
}
