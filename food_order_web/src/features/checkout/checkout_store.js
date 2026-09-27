import { useReducer, useCallback } from 'react';
import { createInitialCheckoutState, buildFullDeliveryAddress } from './checkout_state';
import { CheckoutIntentType, CheckoutIntent } from './checkout_intent';
import { container } from '../../core/di/container';

/**
 * Pure Reducer: receives current checkout state and intent, returns new state
 */
export function checkoutReducer(state, action) {
  switch (action.type) {
    case CheckoutIntentType.SET_CUSTOMER_NAME:
      return { ...state, customerName: action.payload };

    case CheckoutIntentType.SET_CUSTOMER_PHONE:
      return { ...state, customerPhone: action.payload };

    case CheckoutIntentType.SET_SELECTED_DISTRICT:
      return { ...state, selectedDistrict: action.payload };

    case CheckoutIntentType.SET_STREET_ADDRESS:
      return { ...state, streetAddress: action.payload };

    case CheckoutIntentType.SET_DELIVERY_NOTE:
      return { ...state, deliveryNote: action.payload };

    case CheckoutIntentType.SET_COORDINATES:
      return { ...state, coordinates: action.payload };

    case CheckoutIntentType.SET_PAYMENT_METHOD:
      return { ...state, paymentMethod: action.payload };

    case CheckoutIntentType.SET_LOCATION_DETAILS: {
      const { district, address, coords } = action.payload;
      return {
        ...state,
        selectedDistrict: district || state.selectedDistrict,
        streetAddress: address || state.streetAddress,
        coordinates: coords || state.coordinates,
      };
    }

    case CheckoutIntentType.SET_SUBMITTING:
      return { ...state, submitting: Boolean(action.payload) };

    case CheckoutIntentType.SET_ERROR_MSG:
      return { ...state, errorMsg: action.payload || '' };

    case CheckoutIntentType.SET_PLACED_ORDER:
      return { ...state, placedOrder: action.payload };

    case CheckoutIntentType.SET_SHOW_KHQR_MODAL:
      return { ...state, showKhqrModal: Boolean(action.payload) };

    case CheckoutIntentType.RESET_CHECKOUT:
      return createInitialCheckoutState();

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects for Checkout
 */
export function useCheckoutStore(user, cartProps = {}) {
  const [state, dispatch] = useReducer(checkoutReducer, user, createInitialCheckoutState);

  const onIntent = useCallback((intent) => {
    dispatch(intent);
  }, []);

  const validateForm = useCallback(() => {
    dispatch(CheckoutIntent.setErrorMsg(''));

    if (!cartProps.items || cartProps.items.length === 0) {
      dispatch(CheckoutIntent.setErrorMsg('Your cart is empty. Please select food items from the menu.'));
      return false;
    }

    if (!state.customerName.trim() || !state.customerPhone.trim() || !state.streetAddress.trim()) {
      dispatch(CheckoutIntent.setErrorMsg('Please complete all contact and delivery address fields.'));
      return false;
    }

    return true;
  }, [cartProps.items, state.customerName, state.customerPhone, state.streetAddress]);

  const buildOrderPayload = useCallback(
    (extraPaymentInfo = {}) => {
      const fullDeliveryAddress = buildFullDeliveryAddress(
        state.streetAddress,
        state.selectedDistrict,
        state.deliveryNote
      );

      return {
        items: (cartProps.items || []).map((i) => ({
          food: i.food.id,
          quantity: i.quantity,
          notes: i.notes || '',
        })),
        deliveryAddress: fullDeliveryAddress,
        deliveryLocation: {
          lat: state.coordinates ? state.coordinates[0] : 11.551,
          lng: state.coordinates ? state.coordinates[1] : 104.925,
        },
        paymentMethod: state.paymentMethod === 'khqr' ? 'bakong_khqr' : 'cash',
        paymentStatus:
          extraPaymentInfo.paymentStatus || (state.paymentMethod === 'khqr' ? 'completed' : 'pending'),
        paymentRef: extraPaymentInfo.transactionId || undefined,
        voucherCode: cartProps.voucherCode || undefined,
        tipAmount: cartProps.tipAmount || 0,
        deliverySchedule: extraPaymentInfo.deliverySchedule || null,
        deliveryNotes: extraPaymentInfo.deliveryNotes || state.deliveryNote || '',
      };
    },
    [
      state.streetAddress,
      state.selectedDistrict,
      state.deliveryNote,
      state.coordinates,
      state.paymentMethod,
      cartProps.items,
      cartProps.voucherCode,
      cartProps.tipAmount,
    ]
  );

  const executeOrderCreation = useCallback(
    async (orderPayload, ensureCustomerSession, clearCart) => {
      dispatch(CheckoutIntent.setSubmitting(true));
      try {
        await ensureCustomerSession?.();
        const created = await container.createOrderUseCase.execute(orderPayload);
        dispatch(CheckoutIntent.setPlacedOrder(created));
        clearCart?.();
        dispatch(CheckoutIntent.setShowKhqrModal(false));
        return created;
      } catch (err) {
        console.error('[CheckoutStore] Order placement error:', err);
        dispatch(
          CheckoutIntent.setErrorMsg(
            err.message || 'We could not place your order. Please check your details and try again.'
          )
        );
        throw err;
      } finally {
        dispatch(CheckoutIntent.setSubmitting(false));
      }
    },
    []
  );

  return {
    state,
    onIntent,
    validateForm,
    buildOrderPayload,
    executeOrderCreation,
  };
}
