/**
 * Intent (I) in MVI:
 * Plain actions representing user intents and cart events.
 */
export const CartIntentType = {
  ADD_ITEM: 'CART/ADD_ITEM',
  ADD_ITEMS_BATCH: 'CART/ADD_ITEMS_BATCH',
  REMOVE_ITEM: 'CART/REMOVE_ITEM',
  UPDATE_QUANTITY: 'CART/UPDATE_QUANTITY',
  CLEAR_CART: 'CART/CLEAR_CART',

  OPEN_CART: 'CART/OPEN_CART',
  CLOSE_CART: 'CART/CLOSE_CART',
  TOGGLE_CART: 'CART/TOGGLE_CART',

  OPEN_CHECKOUT: 'CART/OPEN_CHECKOUT',
  CLOSE_CHECKOUT: 'CART/CLOSE_CHECKOUT',

  APPLY_VOUCHER: 'CART/APPLY_VOUCHER',
  SET_APPLIED_VOUCHER: 'CART/SET_APPLIED_VOUCHER',
  REMOVE_VOUCHER: 'CART/REMOVE_VOUCHER',
  SET_AVAILABLE_VOUCHERS: 'CART/SET_AVAILABLE_VOUCHERS',

  SET_TIP: 'CART/SET_TIP',
};

export const CartIntent = {
  addItem: (food, quantity = 1, notes = '') => ({
    type: CartIntentType.ADD_ITEM,
    payload: { food, quantity, notes },
  }),

  addItemsBatch: (items) => ({
    type: CartIntentType.ADD_ITEMS_BATCH,
    payload: items,
  }),

  removeItem: (foodId) => ({
    type: CartIntentType.REMOVE_ITEM,
    payload: foodId,
  }),

  updateQuantity: (foodId, quantity) => ({
    type: CartIntentType.UPDATE_QUANTITY,
    payload: { foodId, quantity },
  }),

  clearCart: () => ({
    type: CartIntentType.CLEAR_CART,
  }),

  openCart: () => ({
    type: CartIntentType.OPEN_CART,
  }),

  closeCart: () => ({
    type: CartIntentType.CLOSE_CART,
  }),

  toggleCart: () => ({
    type: CartIntentType.TOGGLE_CART,
  }),

  openCheckout: () => ({
    type: CartIntentType.OPEN_CHECKOUT,
  }),

  closeCheckout: () => ({
    type: CartIntentType.CLOSE_CHECKOUT,
  }),

  applyVoucher: (code) => ({
    type: CartIntentType.APPLY_VOUCHER,
    payload: code,
  }),

  setAppliedVoucher: (voucher) => ({
    type: CartIntentType.SET_APPLIED_VOUCHER,
    payload: voucher,
  }),

  removeVoucher: () => ({
    type: CartIntentType.REMOVE_VOUCHER,
  }),

  setAvailableVouchers: (vouchers) => ({
    type: CartIntentType.SET_AVAILABLE_VOUCHERS,
    payload: vouchers,
  }),

  setTip: (tipAmount) => ({
    type: CartIntentType.SET_TIP,
    payload: tipAmount,
  }),
};
