import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { initialVouchersState, computeFilteredVouchers, computeEligibleVouchersCount } from './vouchers_state';
import { VouchersIntentType } from './vouchers_intent';
import { container } from '../../core/di/container';

/**
 * Pure Reducer: receives current vouchers state and intent, returns new state
 */
export function vouchersReducer(state, action) {
  switch (action.type) {
    case VouchersIntentType.LOAD_START:
      return {
        ...state,
        loading: true,
        errorMessage: null,
      };

    case VouchersIntentType.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        vouchers: action.payload || [],
        errorMessage: null,
      };

    case VouchersIntentType.LOAD_ERROR:
      return {
        ...state,
        loading: false,
        errorMessage: action.payload,
      };

    case VouchersIntentType.SET_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload,
      };

    case VouchersIntentType.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case VouchersIntentType.SET_INPUT_CODE:
      return {
        ...state,
        inputCode: action.payload,
      };

    case VouchersIntentType.SET_REDEEM_FEEDBACK:
      return {
        ...state,
        redeemFeedback: action.payload,
      };

    case VouchersIntentType.SET_REDEEMING:
      return {
        ...state,
        redeeming: Boolean(action.payload),
      };

    case VouchersIntentType.SELECT_TERMS_VOUCHER:
      return {
        ...state,
        selectedTermsVoucher: action.payload,
      };

    case VouchersIntentType.CLEAR_TERMS_VOUCHER:
      return {
        ...state,
        selectedTermsVoucher: null,
      };

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects for Vouchers
 */
export function useVouchersStore(cartSubtotal = 0) {
  const [state, dispatch] = useReducer(vouchersReducer, initialVouchersState);

  const loadVouchers = useCallback(async () => {
    dispatch({ type: VouchersIntentType.LOAD_START });
    try {
      const data = await container.getVouchersUseCase.execute();
      dispatch({ type: VouchersIntentType.LOAD_SUCCESS, payload: data });
    } catch (err) {
      console.error('[VouchersStore] Failed to load vouchers:', err);
      dispatch({
        type: VouchersIntentType.LOAD_ERROR,
        payload: err.message || 'Failed to load vouchers',
      });
    }
  }, []);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  const onIntent = useCallback((intent) => {
    dispatch(intent);
  }, []);

  const filteredVouchers = useMemo(() => {
    return computeFilteredVouchers(state.vouchers, state.selectedCategory, state.searchQuery);
  }, [state.vouchers, state.selectedCategory, state.searchQuery]);

  const eligibleCount = useMemo(() => {
    return computeEligibleVouchersCount(state.vouchers, cartSubtotal);
  }, [state.vouchers, cartSubtotal]);

  return {
    state,
    onIntent,
    filteredVouchers,
    eligibleCount,
  };
}
