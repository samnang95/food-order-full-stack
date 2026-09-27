/**
 * Intent types for Driver Chat MVI architecture.
 */
export const ChatIntentType = {
  OPEN_CHAT: 'OPEN_CHAT',
  CLOSE_CHAT: 'CLOSE_CHAT',
  TOGGLE_CHAT: 'TOGGLE_CHAT',
  SET_ORDER: 'SET_ORDER',
  LOAD_MESSAGES_START: 'LOAD_MESSAGES_START',
  LOAD_MESSAGES_SUCCESS: 'LOAD_MESSAGES_SUCCESS',
  LOAD_MESSAGES_FAILURE: 'LOAD_MESSAGES_FAILURE',
  SET_INPUT_TEXT: 'SET_INPUT_TEXT',
  SEND_MESSAGE_START: 'SEND_MESSAGE_START',
  SEND_MESSAGE_SUCCESS: 'SEND_MESSAGE_SUCCESS',
  SEND_MESSAGE_FAILURE: 'SEND_MESSAGE_FAILURE',
  RECEIVE_MESSAGE: 'RECEIVE_MESSAGE',
  SET_DRIVER_TYPING: 'SET_DRIVER_TYPING',
  MARK_READ: 'MARK_READ',
  SET_DELIVERY_INSTRUCTION: 'SET_DELIVERY_INSTRUCTION',
};

/**
 * Chat Intent action creators.
 */
export const ChatIntent = {
  openChat: () => ({ type: ChatIntentType.OPEN_CHAT }),
  closeChat: () => ({ type: ChatIntentType.CLOSE_CHAT }),
  toggleChat: () => ({ type: ChatIntentType.TOGGLE_CHAT }),
  setOrder: (order) => ({ type: ChatIntentType.SET_ORDER, payload: order }),
  setInputText: (text) => ({ type: ChatIntentType.SET_INPUT_TEXT, payload: text }),
  loadMessagesStart: () => ({ type: ChatIntentType.LOAD_MESSAGES_START }),
  loadMessagesSuccess: (messages) => ({
    type: ChatIntentType.LOAD_MESSAGES_SUCCESS,
    payload: messages,
  }),
  loadMessagesFailure: (error) => ({
    type: ChatIntentType.LOAD_MESSAGES_FAILURE,
    payload: error,
  }),
  sendMessageStart: () => ({ type: ChatIntentType.SEND_MESSAGE_START }),
  sendMessageSuccess: (message) => ({
    type: ChatIntentType.SEND_MESSAGE_SUCCESS,
    payload: message,
  }),
  sendMessageFailure: (error) => ({
    type: ChatIntentType.SEND_MESSAGE_FAILURE,
    payload: error,
  }),
  receiveMessage: (message) => ({
    type: ChatIntentType.RECEIVE_MESSAGE,
    payload: message,
  }),
  setDriverTyping: ({ isTyping, driverName }) => ({
    type: ChatIntentType.SET_DRIVER_TYPING,
    payload: { isTyping, driverName },
  }),
  markRead: () => ({ type: ChatIntentType.MARK_READ }),
  setDeliveryInstruction: (instruction) => ({
    type: ChatIntentType.SET_DELIVERY_INSTRUCTION,
    payload: instruction,
  }),
};
