export class GetFoodsUseCase {
  constructor(foodRepository) {
    this.foodRepository = foodRepository;
  }

  async execute(filter = {}) {
    return await this.foodRepository.getFoods(filter);
  }
}
