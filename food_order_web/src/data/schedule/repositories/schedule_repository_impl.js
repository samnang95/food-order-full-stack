import { ScheduleRepository } from '../../../domain/schedule/repositories/schedule_repository';
import { ReorderResultEntity } from '../../../domain/schedule/entities/reorder_result_entity';
import { ScheduleLocalDataSource } from '../datasources/schedule_local_datasource';

export class ScheduleRepositoryImpl extends ScheduleRepository {
  constructor({
    localDataSource = new ScheduleLocalDataSource(),
    foodRepository = null,
  } = {}) {
    super();
    this.localDataSource = localDataSource;
    this.foodRepository = foodRepository;
  }

  setFoodRepository(foodRepo) {
    this.foodRepository = foodRepo;
  }

  async getDeliverySchedule() {
    return this.localDataSource.getDeliverySchedule();
  }

  async saveDeliverySchedule(scheduleEntity) {
    return this.localDataSource.saveDeliverySchedule(scheduleEntity);
  }

  async prepareReorder(order) {
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      throw new Error('Order does not have items to reorder.');
    }

    // Try to cross-check active food items if foodRepository is available
    let allFoods = [];
    if (this.foodRepository) {
      try {
        allFoods = await this.foodRepository.getFoods();
      } catch (e) {
        console.warn('Could not fetch latest foods for reorder verification, using snapshot info:', e);
      }
    }

    const itemsAdded = [];
    const unavailableItemNames = [];

    for (const item of order.items) {
      const foodId = item.foodId || item.id;
      // Check if food still exists in current catalog
      let matchingFood = allFoods.find((f) => f.id === foodId);

      if (!matchingFood && allFoods.length > 0) {
        // Match by title/name if ID shifted
        matchingFood = allFoods.find(
          (f) => f.title?.toLowerCase() === item.foodName?.toLowerCase()
        );
      }

      if (matchingFood) {
        itemsAdded.push({
          food: matchingFood,
          quantity: item.quantity || 1,
          notes: item.notes || '',
        });
      } else {
        // Fallback to recreating minimal Food object from order snapshot so user doesn't lose food
        const snapshotFood = {
          id: foodId,
          title: item.foodName || 'Food Item',
          price: item.price || 0,
          imageUrl: item.foodImageUrl || '',
          category: 'General',
        };
        itemsAdded.push({
          food: snapshotFood,
          quantity: item.quantity || 1,
          notes: item.notes || '',
        });
      }
    }

    return new ReorderResultEntity({
      orderId: order.id || order.orderNumber,
      totalRequested: order.items.length,
      itemsAdded,
      skippedCount: unavailableItemNames.length,
      unavailableItemNames,
      timestamp: new Date(),
    });
  }
}
