/**
 * Use case to dispatch a chat message to the driver.
 */
export class SendDriverMessageUseCase {
  constructor(chatRepository) {
    this.chatRepository = chatRepository;
  }

  async execute(orderId, messagePayload) {
    if (!orderId) {
      throw new Error('Order ID is required to send chat message.');
    }
    return this.chatRepository.sendMessage(orderId, messagePayload);
  }
}
