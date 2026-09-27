export class GetCategoriesUseCase {
  constructor(foodRepository) {
    this.foodRepository = foodRepository;
  }

  async execute() {
    return await this.foodRepository.getCategories();
  }
}
