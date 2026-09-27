import { ChatMessageEntity } from '../../../domain/chat/entities/chat_message_entity';

export class ChatMessageModel {
  static fromJson(json) {
    if (!json) return null;
    return new ChatMessageEntity({
      id: json.id || json._id,
      orderId: json.orderId,
      sender: json.sender || 'customer',
      senderName: json.senderName || (json.sender === 'driver' ? 'Sok Dara' : 'You'),
      senderRole: json.senderRole || (json.sender === 'driver' ? 'Driver' : 'Customer'),
      senderAvatar: json.senderAvatar || (json.sender === 'driver'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'),
      text: json.text || '',
      type: json.type || 'text',
      photoUrl: json.photoUrl || null,
      timestamp: json.timestamp || new Date().toISOString(),
      status: json.status || 'delivered',
      isQuickPreset: Boolean(json.isQuickPreset),
    });
  }

  static toJson(entity) {
    if (!entity) return null;
    return {
      id: entity.id,
      orderId: entity.orderId,
      sender: entity.sender,
      senderName: entity.senderName,
      senderRole: entity.senderRole,
      senderAvatar: entity.senderAvatar,
      text: entity.text,
      type: entity.type,
      photoUrl: entity.photoUrl,
      timestamp: entity.timestamp,
      status: entity.status,
      isQuickPreset: entity.isQuickPreset,
    };
  }
}
