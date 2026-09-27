/**
 * Chat state definition for MVI architecture.
 */
export const initialChatState = {
  isOpen: false,
  orderId: null,
  orderNumber: '',
  driver: {
    name: 'Sok Dara',
    phone: '+855 12 889 900',
    vehicle: 'Honda Scoopy (Phnom Penh 1AB-2345)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 4.95,
    trips: 1840,
    status: 'on_the_way',
  },
  messages: [],
  unreadCount: 0,
  isDriverTyping: false,
  driverTypingName: 'Sok Dara',
  deliveryInstruction: '',
  inputText: '',
  isLoading: false,
  error: null,
};
