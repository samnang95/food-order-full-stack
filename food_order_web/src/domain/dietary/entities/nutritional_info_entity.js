export class NutritionalInfoEntity {
  constructor({
    calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0,
    fiber = 0,
    sodium = 0,
  } = {}) {
    this.calories = Math.round(Number(calories) || 0);
    this.protein = Math.round(Number(protein) || 0); // grams
    this.carbs = Math.round(Number(carbs) || 0);     // grams
    this.fat = Math.round(Number(fat) || 0);         // grams
    this.fiber = Math.round(Number(fiber) || 0);     // grams
    this.sodium = Math.round(Number(sodium) || 0);   // mg
  }

  get proteinCalories() {
    return this.protein * 4;
  }

  get carbsCalories() {
    return this.carbs * 4;
  }

  get fatCalories() {
    return this.fat * 9;
  }

  get totalCalculatedCalories() {
    const sum = this.proteinCalories + this.carbsCalories + this.fatCalories;
    return sum > 0 ? sum : this.calories || 1;
  }

  get macroPercentages() {
    const total = this.totalCalculatedCalories;
    return {
      protein: Math.round((this.proteinCalories / total) * 100),
      carbs: Math.round((this.carbsCalories / total) * 100),
      fat: Math.round((this.fatCalories / total) * 100),
    };
  }
}
