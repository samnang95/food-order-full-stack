export class GetFoodByIdUseCase {
  constructor(foodRepository) {
    this.foodRepository = foodRepository;
  }

  async execute(foodId) {
    if (!foodId) throw new Error('Food ID is required');
    return await this.foodRepository.getFoodById(foodId);
  }
}
