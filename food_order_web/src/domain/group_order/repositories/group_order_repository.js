/**
 * Abstract repository interface for Group Order management and synchronization.
 */
export class GroupOrderRepository {
  /**
   * Retrieves active group order if any.
   * @returns {Promise<import('../entities/group_order_entity').GroupOrderEntity|null>}
   */
  async getActiveGroupOrder() {
    throw new Error('GroupOrderRepository.getActiveGroupOrder() not implemented');
  }

  /**
   * Creates a new collaborative group order.
   * @returns {Promise<import('../entities/group_order_entity').GroupOrderEntity>}
   */
  async createGroupOrder() {
    throw new Error('GroupOrderRepository.createGroupOrder() not implemented');
  }

  /**
   * Joins an existing group order with room code.
   * @returns {Promise<import('../entities/group_order_entity').GroupOrderEntity>}
   */
  async joinGroupOrder() {
    throw new Error('GroupOrderRepository.joinGroupOrder() not implemented');
  }

  /**
   * Adds a dish to the group cart for a specific member.
   * @returns {Promise<import('../entities/group_order_entity').GroupOrderEntity>}
   */
  async addMemberItem() {
    throw new Error('GroupOrderRepository.addMemberItem() not implemented');
  }

  /**
   * Removes a dish from the group cart.
   * @returns {Promise<import('../entities/group_order_entity').GroupOrderEntity>}
   */
  async removeMemberItem() {
    throw new Error('GroupOrderRepository.removeMemberItem() not implemented');
  }

  /**
   * Toggles the order lock status.
   * @returns {Promise<import('../entities/group_order_entity').GroupOrderEntity>}
   */
  async lockGroupOrder() {
    throw new Error('GroupOrderRepository.lockGroupOrder() not implemented');
  }

  /**
   * Leaves or disbands the group order.
   * @returns {Promise<void>}
   */
  async leaveGroupOrder() {
    throw new Error('GroupOrderRepository.leaveGroupOrder() not implemented');
  }
}
