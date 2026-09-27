export const DIET_TYPES = {
  ALL: 'all',
  HALAL: 'halal',
  VEGETARIAN: 'vegetarian',
  VEGAN: 'vegan',
  GLUTEN_FREE: 'gluten_free',
  NUT_FREE: 'nut_free',
  DAIRY_FREE: 'dairy_free',
  HIGH_PROTEIN: 'high_protein',
  KETO: 'keto',
};

export const COMMON_ALLERGENS = [
  'peanuts',
  'tree_nuts',
  'dairy',
  'eggs',
  'gluten',
  'soy',
  'shellfish',
  'fish',
  'sesame',
];

export class DietaryInfoEntity {
  constructor({
    isHalal = false,
    isVegetarian = false,
    isVegan = false,
    isGlutenFree = false,
    isNutFree = false,
    isDairyFree = false,
    isHighProtein = false,
    isKeto = false,
    allergens = [],
    spiceLevel = 0, // 0: None, 1: Mild, 2: Medium, 3: Spicy, 4: Fire
  } = {}) {
    this.isHalal = Boolean(isHalal);
    this.isVegetarian = Boolean(isVegetarian);
    this.isVegan = Boolean(isVegan);
    this.isGlutenFree = Boolean(isGlutenFree);
    this.isNutFree = Boolean(isNutFree);
    this.isDairyFree = Boolean(isDairyFree);
    this.isHighProtein = Boolean(isHighProtein);
    this.isKeto = Boolean(isKeto);
    this.allergens = Array.isArray(allergens) ? allergens : [];
    this.spiceLevel = Number(spiceLevel) || 0;
  }

  matchesDietType(dietType) {
    if (!dietType || dietType === DIET_TYPES.ALL) return true;
    switch (dietType) {
      case DIET_TYPES.HALAL:
        return this.isHalal;
      case DIET_TYPES.VEGETARIAN:
        return this.isVegetarian || this.isVegan;
      case DIET_TYPES.VEGAN:
        return this.isVegan;
      case DIET_TYPES.GLUTEN_FREE:
        return this.isGlutenFree;
      case DIET_TYPES.NUT_FREE:
        return this.isNutFree;
      case DIET_TYPES.DAIRY_FREE:
        return this.isDairyFree;
      case DIET_TYPES.HIGH_PROTEIN:
        return this.isHighProtein;
      case DIET_TYPES.KETO:
        return this.isKeto;
      default:
        return true;
    }
  }

  hasAllergen(allergenKey) {
    return this.allergens.includes(allergenKey);
  }
}
