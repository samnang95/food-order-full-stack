export const DriverTipIntentType = {
  SET_DRIVER: 'DRIVER_TIP/SET_DRIVER',
  SET_TIP_AMOUNT: 'DRIVER_TIP/SET_TIP_AMOUNT',
  SET_CUSTOM_TIP: 'DRIVER_TIP/SET_CUSTOM_TIP',
  TOGGLE_COMPLIMENT: 'DRIVER_TIP/TOGGLE_COMPLIMENT',
  SET_RATING: 'DRIVER_TIP/SET_RATING',
  SET_REVIEW_TEXT: 'DRIVER_TIP/SET_REVIEW_TEXT',
  OPEN_RATING_MODAL: 'DRIVER_TIP/OPEN_RATING_MODAL',
  CLOSE_RATING_MODAL: 'DRIVER_TIP/CLOSE_RATING_MODAL',
  OPEN_KHQR_TIP_MODAL: 'DRIVER_TIP/OPEN_KHQR_TIP_MODAL',
  CLOSE_KHQR_TIP_MODAL: 'DRIVER_TIP/CLOSE_KHQR_TIP_MODAL',
  SET_BAKONG_PAYLOAD: 'DRIVER_TIP/SET_BAKONG_PAYLOAD',
  SET_LOADING: 'DRIVER_TIP/SET_LOADING',
  SET_TIP_SUBMITTED: 'DRIVER_TIP/SET_TIP_SUBMITTED',
  RESET_TIP_STATE: 'DRIVER_TIP/RESET_TIP_STATE',
  SET_ERROR: 'DRIVER_TIP/SET_ERROR',
};

export const DriverTipIntent = {
  setDriver: (driver) => ({
    type: DriverTipIntentType.SET_DRIVER,
    payload: driver,
  }),

  setTipAmount: (amount) => ({
    type: DriverTipIntentType.SET_TIP_AMOUNT,
    payload: amount,
  }),

  setCustomTip: (value) => ({
    type: DriverTipIntentType.SET_CUSTOM_TIP,
    payload: value,
  }),

  toggleCompliment: (compliment) => ({
    type: DriverTipIntentType.TOGGLE_COMPLIMENT,
    payload: compliment,
  }),

  setRating: (rating) => ({
    type: DriverTipIntentType.SET_RATING,
    payload: rating,
  }),

  setReviewText: (text) => ({
    type: DriverTipIntentType.SET_REVIEW_TEXT,
    payload: text,
  }),

  openRatingModal: (orderId) => ({
    type: DriverTipIntentType.OPEN_RATING_MODAL,
    payload: orderId,
  }),

  closeRatingModal: () => ({
    type: DriverTipIntentType.CLOSE_RATING_MODAL,
  }),

  openKhqrTipModal: (payload) => ({
    type: DriverTipIntentType.OPEN_KHQR_TIP_MODAL,
    payload,
  }),

  closeKhqrTipModal: () => ({
    type: DriverTipIntentType.CLOSE_KHQR_TIP_MODAL,
  }),

  setBakongPayload: (payload) => ({
    type: DriverTipIntentType.SET_BAKONG_PAYLOAD,
    payload,
  }),

  setLoading: (isLoading) => ({
    type: DriverTipIntentType.SET_LOADING,
    payload: isLoading,
  }),

  setTipSubmitted: ({ submitted, recentTip }) => ({
    type: DriverTipIntentType.SET_TIP_SUBMITTED,
    payload: { submitted, recentTip },
  }),

  resetTipState: () => ({
    type: DriverTipIntentType.RESET_TIP_STATE,
  }),

  setError: (error) => ({
    type: DriverTipIntentType.SET_ERROR,
    payload: error,
  }),
};
