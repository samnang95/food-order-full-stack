import type { FoodEntity } from '../entities/food_entity';
import type { FoodRepository } from '../repositories/food_repository';

export class GetFoodsUseCase {
  constructor(private foodRepository: FoodRepository) {}

  async execute(): Promise<FoodEntity[]> {
    return await this.foodRepository.getFoods();
  }
}
