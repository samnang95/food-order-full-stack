import { DriverChatRepository } from '../../../domain/chat/repositories/driver_chat_repository';
import { ChatLocalDataSource } from '../datasources/chat_local_datasource';
import { ChatMessageEntity } from '../../../domain/chat/entities/chat_message_entity';
import { socketService } from '../../../core/services/socket_service';

export class DriverChatRepositoryImpl extends DriverChatRepository {
  constructor(localDataSource = new ChatLocalDataSource()) {
    super();
    this.localDataSource = localDataSource;
  }

  async getMessages(orderId) {
    return this.localDataSource.getMessages(orderId);
  }

  async sendMessage(orderId, messagePayload) {
    const entity = new ChatMessageEntity({
      ...messagePayload,
      orderId,
      status: 'delivered',
    });

    // Save locally
    this.localDataSource.appendMessage(orderId, entity);

    // Emit through real-time socket
    socketService.sendChatMessage({
      orderId,
      text: entity.text,
      sender: entity.sender,
      senderName: entity.senderName,
      type: entity.type,
      photoUrl: entity.photoUrl,
    });

    return entity;
  }

  async markAsRead(orderId) {
    const list = this.localDataSource.getMessages(orderId);
    const updated = list.map((msg) => {
      if (msg.sender === 'driver') {
        msg.status = 'read';
      }
      return msg;
    });
    this.localDataSource.saveMessages(orderId, updated);
  }

  async saveDeliveryInstruction(orderId, instruction) {
    this.localDataSource.saveDeliveryInstruction(orderId, instruction);
  }

  getDeliveryInstruction(orderId) {
    return this.localDataSource.getDeliveryInstruction(orderId);
  }
}
