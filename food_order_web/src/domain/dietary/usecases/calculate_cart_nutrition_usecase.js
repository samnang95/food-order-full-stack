export class CalculateCartNutritionUseCase {
  constructor(dietaryRepository) {
    this.dietaryRepository = dietaryRepository;
  }

  execute(cartItems) {
    return this.dietaryRepository.calculateNutritionSummary(cartItems);
  }
}
