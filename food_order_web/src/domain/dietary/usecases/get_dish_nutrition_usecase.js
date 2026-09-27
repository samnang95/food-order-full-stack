export class GetDishNutritionUseCase {
  constructor(dietaryRepository) {
    this.dietaryRepository = dietaryRepository;
  }

  execute(food) {
    return this.dietaryRepository.getDishNutritionAndDietary(food);
  }
}
