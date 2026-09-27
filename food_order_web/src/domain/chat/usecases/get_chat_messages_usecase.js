/**
 * Use case to load order chat messages.
 */
export class GetChatMessagesUseCase {
  constructor(chatRepository) {
    this.chatRepository = chatRepository;
  }

  async execute(orderId) {
    if (!orderId) return [];
    return this.chatRepository.getMessages(orderId);
  }
}
