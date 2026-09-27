/**
 * Use case to process and validate a quick reorder from a previous order.
 */
export class ExecuteQuickReorderUseCase {
  constructor(scheduleRepository) {
    this.scheduleRepository = scheduleRepository;
  }

  async execute(order) {
    if (!order || !order.items || order.items.length === 0) {
      throw new Error('Valid order with items is required for quick reorder.');
    }
    return this.scheduleRepository.prepareReorder(order);
  }
}
