import { useReducer, useEffect, useCallback } from 'react';
import { createInitialCartState, computeCartFinancials } from './cart_state';
import { CartIntentType } from './cart_intent';
import { LocalDB, DBKeys } from '../../core';
import { container } from '../../core/di/container';

/**
 * Pure Reducer: receives current state and intent, returns new state
 */
export function cartReducer(state, action) {
  switch (action.type) {
    case CartIntentType.ADD_ITEM: {
      const { food, quantity = 1, notes = '' } = action.payload;
      if (!food || !food.id) return state;

      const existingIdx = state.items.findIndex((i) => i.food.id === food.id);
      let updatedItems;

      if (existingIdx >= 0) {
        updatedItems = [...state.items];
        updatedItems[existingIdx] = {
          ...updatedItems[existingIdx],
          quantity: updatedItems[existingIdx].quantity + quantity,
          notes: notes || updatedItems[existingIdx].notes,
        };
      } else {
        updatedItems = [...state.items, { food, quantity, notes }];
      }

      const financials = computeCartFinancials(updatedItems, state.appliedVoucher, state.tipAmount);
      return {
        ...state,
        items: updatedItems,
        ...financials,
      };
    }

    case CartIntentType.REMOVE_ITEM: {
      const foodId = action.payload;
      const updatedItems = state.items.filter((i) => i.food.id !== foodId);
      const financials = computeCartFinancials(updatedItems, state.appliedVoucher, state.tipAmount);
      return {
        ...state,
        items: updatedItems,
        ...financials,
      };
    }

    case CartIntentType.UPDATE_QUANTITY: {
      const { foodId, quantity } = action.payload;
      let updatedItems;

      if (quantity <= 0) {
        updatedItems = state.items.filter((i) => i.food.id !== foodId);
      } else {
        updatedItems = state.items.map((i) =>
          i.food.id === foodId ? { ...i, quantity } : i
        );
      }

      const financials = computeCartFinancials(updatedItems, state.appliedVoucher, state.tipAmount);
      return {
        ...state,
        items: updatedItems,
        ...financials,
      };
    }

    case CartIntentType.CLEAR_CART: {
      const financials = computeCartFinancials([], null, 0);
      return {
        ...state,
        items: [],
        voucherCode: '',
        appliedVoucher: null,
        tipAmount: 0,
        ...financials,
      };
    }

    case CartIntentType.OPEN_CART:
      return { ...state, isCartOpen: true };

    case CartIntentType.CLOSE_CART:
      return { ...state, isCartOpen: false };

    case CartIntentType.TOGGLE_CART:
      return { ...state, isCartOpen: !state.isCartOpen };

    case CartIntentType.OPEN_CHECKOUT:
      return { ...state, isCartOpen: false, isCheckoutOpen: true };

    case CartIntentType.CLOSE_CHECKOUT:
      return { ...state, isCheckoutOpen: false };

    case CartIntentType.SET_APPLIED_VOUCHER: {
      const voucher = action.payload;
      const financials = computeCartFinancials(state.items, voucher, state.tipAmount);
      return {
        ...state,
        voucherCode: voucher ? voucher.code : '',
        appliedVoucher: voucher,
        ...financials,
      };
    }

    case CartIntentType.REMOVE_VOUCHER: {
      const financials = computeCartFinancials(state.items, null, state.tipAmount);
      return {
        ...state,
        voucherCode: '',
        appliedVoucher: null,
        ...financials,
      };
    }

    case CartIntentType.SET_AVAILABLE_VOUCHERS:
      return {
        ...state,
        availableVouchers: action.payload || [],
      };

    case CartIntentType.SET_TIP: {
      const tipAmount = Math.max(0, Number(action.payload) || 0);
      const financials = computeCartFinancials(state.items, state.appliedVoucher, tipAmount);
      return {
        ...state,
        tipAmount,
        ...financials,
      };
    }

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects for Cart
 */
export function useCartStore() {
  const [state, dispatch] = useReducer(cartReducer, undefined, createInitialCartState);

  // Sync state.items to LocalDB
  useEffect(() => {
    LocalDB.setJSON(DBKeys.CART_ITEMS, state.items);
  }, [state.items]);

  // Load available vouchers on mount
  useEffect(() => {
    let isMounted = true;
    container.getVouchersUseCase
      .execute()
      .then((vouchers) => {
        if (isMounted && Array.isArray(vouchers)) {
          dispatch({
            type: CartIntentType.SET_AVAILABLE_VOUCHERS,
            payload: vouchers,
          });
        }
      })
      .catch((err) => {
        console.error('[CartStore] Failed to load vouchers:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const applyVoucher = useCallback(
    async (code) => {
      try {
        const res = await container.validateVoucherUseCase.execute(code, state.subtotal);
        if (res.valid) {
          dispatch({
            type: CartIntentType.SET_APPLIED_VOUCHER,
            payload: res,
          });
          return { success: true, message: res.message || `Voucher ${res.code} applied!` };
        } else {
          return { success: false, message: res.message || 'Invalid or expired voucher' };
        }
      } catch (err) {
        return { success: false, message: err.message || 'Voucher validation error' };
      }
    },
    [state.subtotal]
  );

  const onIntent = useCallback(
    (intent) => {
      switch (intent.type) {
        case CartIntentType.APPLY_VOUCHER:
          return applyVoucher(intent.payload);

        default:
          dispatch(intent);
          break;
      }
    },
    [applyVoucher]
  );

  return {
    state,
    onIntent,
    // Convenience selectors and delegates for backward compatibility:
    items: state.items,
    totalCount: state.totalCount,
    subtotal: state.subtotal,
    deliveryFee: state.deliveryFee,
    discountAmount: state.discountAmount,
    tipAmount: state.tipAmount,
    totalAmount: state.totalAmount,
    voucherCode: state.voucherCode,
    appliedVoucher: state.appliedVoucher,
    availableVouchers: state.availableVouchers,
    isCartOpen: state.isCartOpen,
    isCheckoutOpen: state.isCheckoutOpen,

    addItem: (food, qty, notes) =>
      onIntent({ type: CartIntentType.ADD_ITEM, payload: { food, quantity: qty, notes } }),
    removeItem: (id) => onIntent({ type: CartIntentType.REMOVE_ITEM, payload: id }),
    updateQuantity: (id, qty) =>
      onIntent({ type: CartIntentType.UPDATE_QUANTITY, payload: { foodId: id, quantity: qty } }),
    clearCart: () => onIntent({ type: CartIntentType.CLEAR_CART }),
    openCart: () => onIntent({ type: CartIntentType.OPEN_CART }),
    closeCart: () => onIntent({ type: CartIntentType.CLOSE_CART }),
    toggleCart: () => onIntent({ type: CartIntentType.TOGGLE_CART }),
    openCheckout: () => onIntent({ type: CartIntentType.OPEN_CHECKOUT }),
    closeCheckout: () => onIntent({ type: CartIntentType.CLOSE_CHECKOUT }),
    applyVoucher,
    applyCustomVoucher: (voucher) => onIntent({ type: CartIntentType.SET_APPLIED_VOUCHER, payload: voucher }),
    removeVoucher: () => onIntent({ type: CartIntentType.REMOVE_VOUCHER }),
    setTipAmount: (amount) => onIntent({ type: CartIntentType.SET_TIP, payload: amount }),
  };
}

