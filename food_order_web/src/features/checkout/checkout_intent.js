export const CheckoutIntentType = {
  SET_CUSTOMER_NAME: 'CHECKOUT/SET_CUSTOMER_NAME',
  SET_CUSTOMER_PHONE: 'CHECKOUT/SET_CUSTOMER_PHONE',
  SET_SELECTED_DISTRICT: 'CHECKOUT/SET_SELECTED_DISTRICT',
  SET_STREET_ADDRESS: 'CHECKOUT/SET_STREET_ADDRESS',
  SET_DELIVERY_NOTE: 'CHECKOUT/SET_DELIVERY_NOTE',
  SET_COORDINATES: 'CHECKOUT/SET_COORDINATES',
  SET_PAYMENT_METHOD: 'CHECKOUT/SET_PAYMENT_METHOD',

  SET_LOCATION_DETAILS: 'CHECKOUT/SET_LOCATION_DETAILS',

  SET_SUBMITTING: 'CHECKOUT/SET_SUBMITTING',
  SET_ERROR_MSG: 'CHECKOUT/SET_ERROR_MSG',
  SET_PLACED_ORDER: 'CHECKOUT/SET_PLACED_ORDER',
  SET_SHOW_KHQR_MODAL: 'CHECKOUT/SET_SHOW_KHQR_MODAL',
  RESET_CHECKOUT: 'CHECKOUT/RESET_CHECKOUT',
};

export const CheckoutIntent = {
  setCustomerName: (name) => ({
    type: CheckoutIntentType.SET_CUSTOMER_NAME,
    payload: name,
  }),

  setCustomerPhone: (phone) => ({
    type: CheckoutIntentType.SET_CUSTOMER_PHONE,
    payload: phone,
  }),

  setSelectedDistrict: (district) => ({
    type: CheckoutIntentType.SET_SELECTED_DISTRICT,
    payload: district,
  }),

  setStreetAddress: (address) => ({
    type: CheckoutIntentType.SET_STREET_ADDRESS,
    payload: address,
  }),

  setDeliveryNote: (note) => ({
    type: CheckoutIntentType.SET_DELIVERY_NOTE,
    payload: note,
  }),

  setCoordinates: (coords) => ({
    type: CheckoutIntentType.SET_COORDINATES,
    payload: coords,
  }),

  setPaymentMethod: (method) => ({
    type: CheckoutIntentType.SET_PAYMENT_METHOD,
    payload: method,
  }),

  setLocationDetails: ({ district, address, coords }) => ({
    type: CheckoutIntentType.SET_LOCATION_DETAILS,
    payload: { district, address, coords },
  }),

  setSubmitting: (submitting) => ({
    type: CheckoutIntentType.SET_SUBMITTING,
    payload: submitting,
  }),

  setErrorMsg: (msg) => ({
    type: CheckoutIntentType.SET_ERROR_MSG,
    payload: msg,
  }),

  setPlacedOrder: (order) => ({
    type: CheckoutIntentType.SET_PLACED_ORDER,
    payload: order,
  }),

  setShowKhqrModal: (show) => ({
    type: CheckoutIntentType.SET_SHOW_KHQR_MODAL,
    payload: show,
  }),

  resetCheckout: () => ({
    type: CheckoutIntentType.RESET_CHECKOUT,
  }),
};
