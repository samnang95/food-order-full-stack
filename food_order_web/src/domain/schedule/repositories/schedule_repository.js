/**
 * Abstract repository interface for delivery schedule persistence and quick reorder operations.
 */
export class ScheduleRepository {
  /**
   * Retrieves the currently active delivery schedule entity.
   * @returns {Promise<import('../entities/delivery_schedule_entity').DeliveryScheduleEntity>}
   */
  async getDeliverySchedule() {
    throw new Error('ScheduleRepository.getDeliverySchedule() not implemented');
  }

  /**
   * Persists the delivery schedule configuration.
   * @returns {Promise<import('../entities/delivery_schedule_entity').DeliveryScheduleEntity>}
   */
  async saveDeliverySchedule() {
    throw new Error('ScheduleRepository.saveDeliverySchedule() not implemented');
  }

  /**
   * Prepares and validates a past order's items for quick reorder.
   * @returns {Promise<import('../entities/reorder_result_entity').ReorderResultEntity>}
   */
  async prepareReorder() {
    throw new Error('ScheduleRepository.prepareReorder() not implemented');
  }
}
