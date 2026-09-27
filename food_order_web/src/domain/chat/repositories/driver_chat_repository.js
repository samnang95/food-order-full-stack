/**
 * Abstract repository interface for Driver Chat.
 */
export class DriverChatRepository {
  /**
   * Retrieves messages for an order.
   * @param {string} _orderId
   * @returns {Promise<Array<import('../entities/chat_message_entity').ChatMessageEntity>>}
   */
  async getMessages() {
    throw new Error('DriverChatRepository.getMessages() not implemented');
  }

  /**
   * Sends a message to the driver.
   * @param {string} _orderId
   * @param {Object} _messagePayload
   * @returns {Promise<import('../entities/chat_message_entity').ChatMessageEntity>}
   */
  async sendMessage() {
    throw new Error('DriverChatRepository.sendMessage() not implemented');
  }

  /**
   * Marks unread messages as read.
   * @param {string} _orderId
   * @returns {Promise<void>}
   */
  async markAsRead() {
    throw new Error('DriverChatRepository.markAsRead() not implemented');
  }

  /**
   * Saves delivery notes/instructions for the order.
   * @param {string} _orderId
   * @param {string} _instruction
   * @returns {Promise<void>}
   */
  async saveDeliveryInstruction() {
    throw new Error('DriverChatRepository.saveDeliveryInstruction() not implemented');
  }
}
