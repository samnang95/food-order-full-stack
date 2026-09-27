export class SaveUserDietaryPreferencesUseCase {
  constructor(dietaryRepository) {
    this.dietaryRepository = dietaryRepository;
  }

  async execute(preferences) {
    return this.dietaryRepository.saveUserPreferences(preferences);
  }
}
