export class GetUserDietaryPreferencesUseCase {
  constructor(dietaryRepository) {
    this.dietaryRepository = dietaryRepository;
  }

  async execute() {
    return this.dietaryRepository.getUserPreferences();
  }
}
