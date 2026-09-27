import { ChatMessageModel } from '../models/chat_message_model';

const STORAGE_PREFIX = 'bitecraft_chat_order_';
const INSTRUCTION_PREFIX = 'bitecraft_instruction_order_';

export class ChatLocalDataSource {
  getMessages(orderId) {
    if (!orderId) return [];
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${orderId}`);
      if (!raw) {
        // Seed initial friendly message from driver
        const initialDriverMessage = {
          id: `msg_welcome_${orderId}`,
          orderId,
          sender: 'driver',
          senderName: 'Sok Dara (Express Rider)',
          senderRole: 'Driver',
          senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
          text: "Hello! I'm Sok Dara, your delivery driver. I've secured your meal in an insulated thermal bag and am en route. Let me know if you have any drop-off instructions! 🛵💨",
          type: 'text',
          photoUrl: null,
          timestamp: new Date(Date.now() - 60000).toISOString(),
          status: 'delivered',
          isQuickPreset: false,
        };
        const list = [ChatMessageModel.fromJson(initialDriverMessage)];
        this.saveMessages(orderId, list);
        return list;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(ChatMessageModel.fromJson) : [];
    } catch (err) {
      console.error('Failed to load chat messages from localStorage:', err);
      return [];
    }
  }

  saveMessages(orderId, messages) {
    if (!orderId) return;
    try {
      const serialized = messages.map(ChatMessageModel.toJson);
      localStorage.setItem(`${STORAGE_PREFIX}${orderId}`, JSON.stringify(serialized));
    } catch (err) {
      console.error('Failed to save chat messages to localStorage:', err);
    }
  }

  appendMessage(orderId, message) {
    if (!orderId || !message) return;
    const current = this.getMessages(orderId);
    // Deduplicate by ID
    const exists = current.some((m) => m.id === message.id);
    if (!exists) {
      const updated = [...current, message];
      this.saveMessages(orderId, updated);
      return updated;
    }
    return current;
  }

  getDeliveryInstruction(orderId) {
    if (!orderId) return '';
    return localStorage.getItem(`${INSTRUCTION_PREFIX}${orderId}`) || '';
  }

  saveDeliveryInstruction(orderId, instruction) {
    if (!orderId) return;
    localStorage.setItem(`${INSTRUCTION_PREFIX}${orderId}`, instruction || '');
  }
}
