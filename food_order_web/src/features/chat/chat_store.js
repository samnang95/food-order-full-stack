import { useReducer, useEffect, useCallback, useRef } from 'react';
import { initialChatState } from './chat_state';
import { ChatIntentType, ChatIntent } from './chat_intent';
import { container } from '../../core/di/container';
import { socketService } from '../../core/services/socket_service';
import { soundService } from '../../core';

export function chatReducer(state, action) {
  switch (action.type) {
    case ChatIntentType.OPEN_CHAT:
      return {
        ...state,
        isOpen: true,
        unreadCount: 0,
      };

    case ChatIntentType.CLOSE_CHAT:
      return {
        ...state,
        isOpen: false,
      };

    case ChatIntentType.TOGGLE_CHAT:
      return {
        ...state,
        isOpen: !state.isOpen,
        unreadCount: !state.isOpen ? 0 : state.unreadCount,
      };

    case ChatIntentType.SET_ORDER: {
      const order = action.payload;
      if (!order) return state;
      const orderId = order.id || order._id;
      const orderNumber = order.orderNumber || (orderId ? `#${orderId.slice(-6).toUpperCase()}` : '');
      const driverStatus = (order.status || 'on_the_way').toLowerCase();

      return {
        ...state,
        orderId,
        orderNumber,
        driver: {
          ...state.driver,
          status: driverStatus,
        },
      };
    }

    case ChatIntentType.LOAD_MESSAGES_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case ChatIntentType.LOAD_MESSAGES_SUCCESS: {
      const messages = action.payload || [];
      const unreadCount = state.isOpen
        ? 0
        : messages.filter((m) => m.sender === 'driver' && m.status !== 'read').length;

      return {
        ...state,
        messages,
        unreadCount,
        isLoading: false,
        error: null,
      };
    }

    case ChatIntentType.LOAD_MESSAGES_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case ChatIntentType.SET_INPUT_TEXT:
      return {
        ...state,
        inputText: action.payload,
      };

    case ChatIntentType.SEND_MESSAGE_START:
      return {
        ...state,
        isLoading: true,
      };

    case ChatIntentType.SEND_MESSAGE_SUCCESS: {
      const newMsg = action.payload;
      const existing = state.messages.some((m) => m.id === newMsg.id);
      const messages = existing ? state.messages : [...state.messages, newMsg];
      return {
        ...state,
        messages,
        inputText: '',
        isLoading: false,
      };
    }

    case ChatIntentType.SEND_MESSAGE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case ChatIntentType.RECEIVE_MESSAGE: {
      const incoming = action.payload;
      if (!incoming) return state;

      // Deduplicate
      const alreadyExists = state.messages.some((m) => m.id === incoming.id);
      if (alreadyExists) return state;

      const isFromDriver = incoming.sender === 'driver';
      const unreadCount = !state.isOpen && isFromDriver ? state.unreadCount + 1 : state.unreadCount;

      return {
        ...state,
        messages: [...state.messages, incoming],
        unreadCount,
        isDriverTyping: isFromDriver ? false : state.isDriverTyping,
      };
    }

    case ChatIntentType.SET_DRIVER_TYPING: {
      const { isTyping, driverName } = action.payload || {};
      return {
        ...state,
        isDriverTyping: Boolean(isTyping),
        driverTypingName: driverName || state.driver.name,
      };
    }

    case ChatIntentType.MARK_READ:
      return {
        ...state,
        unreadCount: 0,
      };

    case ChatIntentType.SET_DELIVERY_INSTRUCTION:
      return {
        ...state,
        deliveryInstruction: action.payload,
      };

    default:
      return state;
  }
}

/**
 * Custom React Hook encapsulating Driver Chat MVI State & Use Cases.
 */
export function useDriverChatStore(order) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const typingTimeoutRef = useRef(null);

  // Synchronize active order
  useEffect(() => {
    if (order) {
      dispatch(ChatIntent.setOrder(order));
    }
  }, [order]);

  // Load initial messages & delivery instructions from Clean Architecture Use Case
  const loadOrderChat = useCallback(async (orderId) => {
    if (!orderId) return;
    try {
      dispatch(ChatIntent.loadMessagesStart());
      const msgs = await container.getChatMessagesUseCase.execute(orderId);
      dispatch(ChatIntent.loadMessagesSuccess(msgs));

      const chatRepo = container.getDriverChatRepository();
      if (chatRepo?.getDeliveryInstruction) {
        const savedInstruction = chatRepo.getDeliveryInstruction(orderId);
        if (savedInstruction) {
          dispatch(ChatIntent.setDeliveryInstruction(savedInstruction));
        }
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
      dispatch(ChatIntent.loadMessagesFailure(err.message));
    }
  }, []);

  const orderId = order?.id || order?._id || state.orderId;

  useEffect(() => {
    if (orderId) {
      loadOrderChat(orderId);
    }
  }, [orderId, loadOrderChat]);

  // Listen to real-time socket events for chat and driver typing
  useEffect(() => {
    if (!orderId) return;

    socketService.joinOrder(orderId);

    const unsubChat = socketService.onChatMessage((msg) => {
      if (msg.orderId === orderId) {
        dispatch(ChatIntent.receiveMessage(msg));
        if (msg.sender === 'driver') {
          soundService.playBell();
        }
      }
    });

    const unsubTyping = socketService.onDriverTyping((data) => {
      if (data.orderId === orderId) {
        dispatch(ChatIntent.setDriverTyping({
          isTyping: data.isTyping,
          driverName: data.driverName || 'Sok Dara',
        }));
      }
    });

    return () => {
      unsubChat?.();
      unsubTyping?.();
    };
  }, [orderId]);

  // User sends text message
  const sendMessage = useCallback(
    async (text, type = 'text', photoUrl = null) => {
      const content = (text || '').trim();
      if (!orderId || (!content && !photoUrl)) return;

      try {
        dispatch(ChatIntent.sendMessageStart());

        const payload = {
          orderId,
          sender: 'customer',
          senderName: 'You',
          senderRole: 'Customer',
          senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
          text: content,
          type,
          photoUrl,
          timestamp: new Date().toISOString(),
          status: 'delivered',
          isQuickPreset: type === 'preset',
        };

        const created = await container.sendDriverMessageUseCase.execute(orderId, payload);
        dispatch(ChatIntent.sendMessageSuccess(created));
        soundService.playPop();
      } catch (err) {
        console.error('Failed to send driver message:', err);
        dispatch(ChatIntent.sendMessageFailure(err.message));
      }
    },
    [orderId]
  );

  // User sends quick delivery preset chip
  const sendPreset = useCallback(
    async (presetEntity) => {
      if (!presetEntity) return;
      const text = presetEntity.defaultEn || presetEntity.text;
      await sendMessage(text, 'preset');
    },
    [sendMessage]
  );

  // User types in input field -> trigger typing event to driver
  const handleInputChange = useCallback(
    (text) => {
      dispatch(ChatIntent.setInputText(text));

      if (orderId) {
        socketService.sendTyping({ orderId, isTyping: true, sender: 'customer' });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          socketService.sendTyping({ orderId, isTyping: false, sender: 'customer' });
        }, 1500);
      }
    },
    [orderId]
  );

  // Save persistent delivery instruction note
  const saveDeliveryInstruction = useCallback(
    async (instruction) => {
      if (!orderId) return;
      try {
        await container.saveDeliveryInstructionUseCase.execute(orderId, instruction);
        dispatch(ChatIntent.setDeliveryInstruction(instruction));
      } catch (err) {
        console.error('Failed to save delivery instruction:', err);
      }
    },
    [orderId]
  );

  const openChat = useCallback(() => {
    dispatch(ChatIntent.openChat());
    if (orderId) {
      container.getDriverChatRepository().markAsRead(orderId);
    }
  }, [orderId]);

  const closeChat = useCallback(() => {
    dispatch(ChatIntent.closeChat());
  }, []);

  const toggleChat = useCallback(() => {
    dispatch(ChatIntent.toggleChat());
    if (!state.isOpen && orderId) {
      container.getDriverChatRepository().markAsRead(orderId);
    }
  }, [state.isOpen, orderId]);

  return {
    state,
    isOpen: state.isOpen,
    driver: state.driver,
    messages: state.messages,
    unreadCount: state.unreadCount,
    isDriverTyping: state.isDriverTyping,
    driverTypingName: state.driverTypingName,
    deliveryInstruction: state.deliveryInstruction,
    inputText: state.inputText,
    isLoading: state.isLoading,
    openChat,
    closeChat,
    toggleChat,
    sendMessage,
    sendPreset,
    handleInputChange,
    saveDeliveryInstruction,
  };
}
