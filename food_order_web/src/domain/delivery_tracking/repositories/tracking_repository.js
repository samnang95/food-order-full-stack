/**
 * DeliveryTracking Repository Interface (Domain Layer)
 * Defines abstract methods the data layer must implement.
 */
export class DeliveryTrackingRepository {
  /**
   * Get active tracking session for an order.
   * @param {string} orderId
   * @returns {Promise<import('../entities/tracking_entity').DeliveryTrackingEntity>}
   */
  async getTrackingByOrderId() {
    throw new Error('Method getTrackingByOrderId() must be implemented.');
  }

  /**
   * Get all active delivery sessions for the current user.
   * @returns {Promise<import('../entities/tracking_entity').DeliveryTrackingEntity[]>}
   */
  async getActiveDeliveries() {
    throw new Error('Method getActiveDeliveries() must be implemented.');
  }

  /**
   * Update driver location in a tracking session.
   * @param {string} orderId
   * @param {{ lat: number, lng: number }} location
   * @returns {Promise<import('../entities/tracking_entity').DeliveryTrackingEntity>}
   */
  async updateDriverLocation() {
    throw new Error('Method updateDriverLocation() must be implemented.');
  }

  /**
   * Update the status of a tracking session.
   * @param {string} orderId
   * @param {string} newStatus
   * @returns {Promise<import('../entities/tracking_entity').DeliveryTrackingEntity>}
   */
  async updateTrackingStatus() {
    throw new Error('Method updateTrackingStatus() must be implemented.');
  }
}
