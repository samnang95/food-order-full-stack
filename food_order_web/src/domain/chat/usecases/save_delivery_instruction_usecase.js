/**
 * Use case to save delivery instructions for an order.
 */
export class SaveDeliveryInstructionUseCase {
  constructor(chatRepository) {
    this.chatRepository = chatRepository;
  }

  async execute(orderId, instruction) {
    if (!orderId) {
      throw new Error('Order ID is required to set delivery instructions.');
    }
    return this.chatRepository.saveDeliveryInstruction(orderId, instruction);
  }
}
