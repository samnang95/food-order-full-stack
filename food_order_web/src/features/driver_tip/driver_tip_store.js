import { useReducer, useEffect, useCallback, useRef } from 'react';
import { initialDriverTipState } from './driver_tip_state';
import { DriverTipIntentType, DriverTipIntent } from './driver_tip_intent';
import { container } from '../../core/di/container';

export function driverTipReducer(state, action) {
  switch (action.type) {
    case DriverTipIntentType.SET_DRIVER:
      return { ...state, driver: action.payload };

    case DriverTipIntentType.SET_TIP_AMOUNT:
      return {
        ...state,
        tipAmount: action.payload,
        isCustomActive: false,
        customTipValue: '',
      };

    case DriverTipIntentType.SET_CUSTOM_TIP: {
      const parsed = parseFloat(action.payload);
      return {
        ...state,
        customTipValue: action.payload,
        isCustomActive: true,
        tipAmount: !isNaN(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0,
      };
    }

    case DriverTipIntentType.TOGGLE_COMPLIMENT: {
      const comp = action.payload;
      const isSelected = state.selectedCompliments.includes(comp);
      const next = isSelected
        ? state.selectedCompliments.filter((c) => c !== comp)
        : [...state.selectedCompliments, comp];
      return { ...state, selectedCompliments: next };
    }

    case DriverTipIntentType.SET_RATING:
      return { ...state, rating: action.payload };

    case DriverTipIntentType.SET_REVIEW_TEXT:
      return { ...state, reviewText: action.payload };

    case DriverTipIntentType.OPEN_RATING_MODAL:
      return {
        ...state,
        activeOrderId: action.payload || null,
        isRatingModalOpen: true,
        tipSubmitted: false,
        error: null,
      };

    case DriverTipIntentType.CLOSE_RATING_MODAL:
      return { ...state, isRatingModalOpen: false };

    case DriverTipIntentType.OPEN_KHQR_TIP_MODAL:
      return {
        ...state,
        isKhqrTipModalOpen: true,
        bakongPayload: action.payload,
      };

    case DriverTipIntentType.CLOSE_KHQR_TIP_MODAL:
      return {
        ...state,
        isKhqrTipModalOpen: false,
        bakongPayload: null,
      };

    case DriverTipIntentType.SET_BAKONG_PAYLOAD:
      return { ...state, bakongPayload: action.payload };

    case DriverTipIntentType.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case DriverTipIntentType.SET_TIP_SUBMITTED:
      return {
        ...state,
        tipSubmitted: action.payload.submitted,
        recentTip: action.payload.recentTip,
        isLoading: false,
      };

    case DriverTipIntentType.RESET_TIP_STATE:
      return {
        ...state,
        tipAmount: 1.0,
        customTipValue: '',
        isCustomActive: false,
        selectedCompliments: ['friendly_smile', 'super_fast'],
        rating: 5,
        reviewText: '',
        tipSubmitted: false,
      };

    case DriverTipIntentType.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    default:
      return state;
  }
}

export function useDriverTipStore() {
  const [state, dispatch] = useReducer(driverTipReducer, initialDriverTipState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Load driver profile on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const driver = await container.getDriverProfileUseCase.execute('driver_001');
        if (isMounted && driver) {
          dispatch(DriverTipIntent.setDriver(driver));
        }
      } catch (err) {
        console.warn('Failed to load driver profile:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const setTipAmount = useCallback((amount) => {
    dispatch(DriverTipIntent.setTipAmount(amount));
  }, []);

  const setCustomTip = useCallback((value) => {
    dispatch(DriverTipIntent.setCustomTip(value));
  }, []);

  const toggleCompliment = useCallback((compliment) => {
    dispatch(DriverTipIntent.toggleCompliment(compliment));
  }, []);

  const setRating = useCallback((rating) => {
    dispatch(DriverTipIntent.setRating(rating));
  }, []);

  const setReviewText = useCallback((text) => {
    dispatch(DriverTipIntent.setReviewText(text));
  }, []);

  const openRatingModal = useCallback((orderId) => {
    dispatch(DriverTipIntent.openRatingModal(orderId));
  }, []);

  const closeRatingModal = useCallback(() => {
    dispatch(DriverTipIntent.closeRatingModal());
  }, []);

  const openKhqrTipModal = useCallback((payload) => {
    dispatch(DriverTipIntent.openKhqrTipModal(payload));
  }, []);

  const closeKhqrTipModal = useCallback(() => {
    dispatch(DriverTipIntent.closeKhqrTipModal());
  }, []);

  const generateBakongQr = useCallback(
    (amount, orderId) => {
      const currentDriver = stateRef.current.driver;
      return container.generateBakongTipQrUseCase.execute({
        orderId: orderId || `tip_${Date.now()}`,
        driver: currentDriver,
        amountUsd: amount,
        amountKhr: Math.round(amount * 4100),
      });
    },
    []
  );

  const submitTip = useCallback(
    async ({ orderId, amount, paymentMethod = 'checkout_add_on', compliments, note }) => {
      try {
        dispatch(DriverTipIntent.setLoading(true));
        const currentDriver = stateRef.current.driver;

        const tip = await container.submitDriverTipUseCase.execute({
          orderId,
          driverId: currentDriver.id,
          amountUsd: amount !== undefined ? amount : stateRef.current.tipAmount,
          paymentMethod,
          compliments: compliments || stateRef.current.selectedCompliments,
          note: note !== undefined ? note : stateRef.current.reviewText,
        });

        dispatch(DriverTipIntent.setTipSubmitted({ submitted: true, recentTip: tip }));
        return tip;
      } catch (err) {
        console.warn('Failed to submit driver tip:', err);
        dispatch(DriverTipIntent.setError(err.message));
        throw err;
      }
    },
    []
  );

  const submitFeedback = useCallback(
    async ({ orderId, rating, compliments, reviewText, tipAmount }) => {
      try {
        dispatch(DriverTipIntent.setLoading(true));
        const currentDriver = stateRef.current.driver;

        const feedback = await container.submitDriverFeedbackUseCase.execute({
          orderId,
          driverId: currentDriver.id,
          rating: rating || stateRef.current.rating,
          compliments: compliments || stateRef.current.selectedCompliments,
          reviewText: reviewText !== undefined ? reviewText : stateRef.current.reviewText,
          tipAmount: tipAmount !== undefined ? tipAmount : stateRef.current.tipAmount,
        });

        // Also submit tip if tipAmount > 0
        const finalTip = tipAmount !== undefined ? tipAmount : stateRef.current.tipAmount;
        if (finalTip > 0) {
          await submitTip({
            orderId,
            amount: finalTip,
            paymentMethod: 'checkout_add_on',
            compliments: compliments || stateRef.current.selectedCompliments,
            note: reviewText || '',
          });
        }

        dispatch(DriverTipIntent.setLoading(false));
        return feedback;
      } catch (err) {
        console.warn('Failed to submit driver feedback:', err);
        dispatch(DriverTipIntent.setError(err.message));
        throw err;
      }
    },
    [submitTip]
  );

  const resetTipState = useCallback(() => {
    dispatch(DriverTipIntent.resetTipState());
  }, []);

  return {
    state,
    driver: state.driver,
    tipAmount: state.tipAmount,
    customTipValue: state.customTipValue,
    isCustomActive: state.isCustomActive,
    selectedCompliments: state.selectedCompliments,
    rating: state.rating,
    reviewText: state.reviewText,
    activeOrderId: state.activeOrderId,
    isRatingModalOpen: state.isRatingModalOpen,
    isKhqrTipModalOpen: state.isKhqrTipModalOpen,
    bakongPayload: state.bakongPayload,
    isLoading: state.isLoading,
    tipSubmitted: state.tipSubmitted,
    recentTip: state.recentTip,
    error: state.error,

    // Actions
    setTipAmount,
    setCustomTip,
    toggleCompliment,
    setRating,
    setReviewText,
    openRatingModal,
    closeRatingModal,
    openKhqrTipModal,
    closeKhqrTipModal,
    generateBakongQr,
    submitTip,
    submitFeedback,
    resetTipState,
  };
}
