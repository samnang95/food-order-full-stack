import type { FoodEntity } from '../entities/food_entity';
import type { FoodRepository } from '../repositories/food_repository';

export class SaveFoodUseCase {
  constructor(private foodRepository: FoodRepository) {}

  async execute(food: Partial<FoodEntity>): Promise<FoodEntity> {
    return await this.foodRepository.saveFood(food);
  }
}
