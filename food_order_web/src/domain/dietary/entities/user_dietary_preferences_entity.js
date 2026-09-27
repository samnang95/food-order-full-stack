export class UserDietaryPreferencesEntity {
  constructor({
    activeDiets = [], // Array of diet keys e.g. ['halal', 'gluten_free']
    allergensToAvoid = [], // Array of allergen keys e.g. ['peanuts', 'shellfish']
    dailyCalorieTarget = 2000,
    dailyProteinTarget = 75,
    showMacroBadges = true,
  } = {}) {
    this.activeDiets = Array.isArray(activeDiets) ? activeDiets : [];
    this.allergensToAvoid = Array.isArray(allergensToAvoid) ? allergensToAvoid : [];
    this.dailyCalorieTarget = Number(dailyCalorieTarget) || 2000;
    this.dailyProteinTarget = Number(dailyProteinTarget) || 75;
    this.showMacroBadges = showMacroBadges !== false;
  }

  checkAllergenConflict(dishDietary) {
    if (!dishDietary || !Array.isArray(dishDietary.allergens) || !this.allergensToAvoid.length) {
      return [];
    }
    return dishDietary.allergens.filter((a) => this.allergensToAvoid.includes(a));
  }

  isDishAllowed(dishDietary) {
    if (!dishDietary) return true;

    // Check allergen conflicts
    const conflicts = this.checkAllergenConflict(dishDietary);
    if (conflicts.length > 0) return false;

    // Check required active diets
    for (const diet of this.activeDiets) {
      if (!dishDietary.matchesDietType(diet)) {
        return false;
      }
    }

    return true;
  }
}
