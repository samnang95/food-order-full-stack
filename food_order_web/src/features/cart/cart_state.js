import { LocalDB, DBKeys } from '../../core';

export const DELIVERY_FEE_STANDARD = 1.5; // $1.50 (approx 6,000 KHR)
export const FREE_DELIVERY_THRESHOLD = 25.0; // Free delivery over $25

/**
 * Pure helper to compute cart financial metrics
 */
export function computeCartFinancials(items = [], appliedVoucher = null, tipAmount = 0) {
  const subtotal = items.reduce(
    (acc, item) => acc + (Number(item.food?.price) || 0) * (item.quantity || 1),
    0
  );

  const isFreeDelivery =
    subtotal >= FREE_DELIVERY_THRESHOLD ||
    appliedVoucher?.code === 'FREESHIP' ||
    appliedVoucher?.discountType === 'free_delivery' ||
    appliedVoucher?.code?.startsWith('BITEDELIV');

  const deliveryFee =
    items.length === 0 ? 0 : isFreeDelivery ? 0 : DELIVERY_FEE_STANDARD;

  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountAmount) {
      discountAmount = Number(appliedVoucher.discountAmount) || 0;
    } else if (appliedVoucher.discountType === 'percent') {
      discountAmount = Math.round(((subtotal * (Number(appliedVoucher.discountValue) || 0)) / 100) * 100) / 100;
    } else if (appliedVoucher.discountType === 'fixed') {
      discountAmount = Number(appliedVoucher.discountValue) || 0;
    } else if (appliedVoucher.discountValue && appliedVoucher.discountType !== 'free_delivery') {
      discountAmount = Number(appliedVoucher.discountValue) || 0;
    }
  }

  const rawTotal = subtotal + deliveryFee - discountAmount + tipAmount;
  const totalAmount = Math.max(0, Math.round(rawTotal * 100) / 100);
  const totalCount = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return {
    subtotal,
    deliveryFee,
    discountAmount,
    totalAmount,
    totalCount,
  };
}

/**
 * Model / State (M) in MVI:
 * Immutable representation of the Cart feature state.
 */
export function createInitialCartState() {
  const items = LocalDB.getJSON(DBKeys.CART_ITEMS, []);
  const financials = computeCartFinancials(items, null, 0);

  return {
    items,
    isCartOpen: false,
    isCheckoutOpen: false,
    voucherCode: '',
    appliedVoucher: null,
    availableVouchers: [],
    tipAmount: 0,
    ...financials,
  };
}
