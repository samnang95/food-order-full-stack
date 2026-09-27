export class FilterDishesByDietaryUseCase {
  constructor(dietaryRepository) {
    this.dietaryRepository = dietaryRepository;
  }

  execute({ foods, activeDietTag, userPreferences }) {
    return this.dietaryRepository.filterDishes({
      foods,
      activeDietTag,
      userPreferences,
    });
  }
}
