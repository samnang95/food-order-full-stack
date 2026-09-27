/**
 * Domain entity representing a chat message between customer and driver.
 */
export class ChatMessageEntity {
  constructor({
    id,
    orderId,
    sender = 'customer', // 'customer' | 'driver' | 'system'
    senderName = 'Customer',
    senderRole = 'Customer',
    senderAvatar = '',
    text = '',
    type = 'text', // 'text' | 'preset' | 'photo' | 'instruction'
    photoUrl = null,
    timestamp = new Date().toISOString(),
    status = 'delivered', // 'sending' | 'sent' | 'delivered' | 'read'
    isQuickPreset = false,
  }) {
    this.id = id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.orderId = orderId;
    this.sender = sender;
    this.senderName = senderName;
    this.senderRole = senderRole;
    this.senderAvatar = senderAvatar;
    this.text = text;
    this.type = type;
    this.photoUrl = photoUrl;
    this.timestamp = timestamp;
    this.status = status;
    this.isQuickPreset = Boolean(isQuickPreset);
  }

  isFromCustomer() {
    return this.sender === 'customer';
  }

  isFromDriver() {
    return this.sender === 'driver';
  }

  isSystem() {
    return this.sender === 'system';
  }
}
