export class GetCategoryDetailUseCase {
  constructor(foodRepository) {
    this.foodRepository = foodRepository;
  }

  async execute(categoryId) {
    if (!categoryId) throw new Error('Category ID or name is required');
    return await this.foodRepository.getCategoryById(categoryId);
  }
}
