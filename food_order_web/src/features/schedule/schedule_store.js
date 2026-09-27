import { useReducer, useEffect, useCallback } from 'react';
import { initialScheduleState } from './schedule_state';
import { ScheduleIntentType, ScheduleIntent } from './schedule_intent';
import { container } from '../../core/di/container';
import { DeliveryScheduleEntity } from '../../domain/schedule/entities/delivery_schedule_entity';

export function scheduleReducer(state, action) {
  switch (action.type) {
    case ScheduleIntentType.SET_MODE:
      return { ...state, mode: action.payload };

    case ScheduleIntentType.SET_DATE:
      return { ...state, date: action.payload };

    case ScheduleIntentType.SET_TIME_SLOT:
      return { ...state, timeSlot: action.payload };

    case ScheduleIntentType.SET_NOTE:
      return { ...state, note: action.payload };

    case ScheduleIntentType.OPEN_MODAL:
      return { ...state, isModalOpen: true, error: null };

    case ScheduleIntentType.CLOSE_MODAL:
      return { ...state, isModalOpen: false };

    case ScheduleIntentType.TOGGLE_MODAL:
      return { ...state, isModalOpen: !state.isModalOpen };

    case ScheduleIntentType.LOAD_SCHEDULE_SUCCESS: {
      const s = action.payload;
      if (!s) return state;
      return {
        ...state,
        mode: s.mode || 'asap',
        date: s.date || state.date,
        timeSlot: s.timeSlot || state.timeSlot,
        note: s.note || '',
        isLoading: false,
      };
    }

    case ScheduleIntentType.SAVE_SCHEDULE_START:
      return { ...state, isLoading: true, error: null };

    case ScheduleIntentType.SAVE_SCHEDULE_SUCCESS: {
      const s = action.payload;
      return {
        ...state,
        mode: s.mode,
        date: s.date,
        timeSlot: s.timeSlot,
        note: s.note,
        isLoading: false,
        isModalOpen: false,
        error: null,
      };
    }

    case ScheduleIntentType.SAVE_SCHEDULE_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ScheduleIntentType.REORDER_START:
      return {
        ...state,
        reorderLoadingOrderId: action.payload,
        reorderSuccessResult: null,
        reorderErrorMessage: null,
      };

    case ScheduleIntentType.REORDER_SUCCESS:
      return {
        ...state,
        reorderLoadingOrderId: null,
        reorderSuccessResult: action.payload,
        reorderErrorMessage: null,
      };

    case ScheduleIntentType.REORDER_FAILURE:
      return {
        ...state,
        reorderLoadingOrderId: null,
        reorderErrorMessage: action.payload,
      };

    case ScheduleIntentType.CLEAR_REORDER_STATUS:
      return {
        ...state,
        reorderLoadingOrderId: null,
        reorderSuccessResult: null,
        reorderErrorMessage: null,
      };

    default:
      return state;
  }
}

export function useScheduleStore() {
  const [state, dispatch] = useReducer(scheduleReducer, initialScheduleState);

  // Load saved schedule on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const schedule = await container.getDeliveryScheduleUseCase.execute();
        if (isMounted && schedule) {
          dispatch(ScheduleIntent.loadScheduleSuccess(schedule));
        }
      } catch (err) {
        console.warn('Failed to load initial delivery schedule:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const setMode = useCallback((mode) => {
    dispatch(ScheduleIntent.setMode(mode));
  }, []);

  const setDate = useCallback((date) => {
    dispatch(ScheduleIntent.setDate(date));
  }, []);

  const setTimeSlot = useCallback((timeSlot) => {
    dispatch(ScheduleIntent.setTimeSlot(timeSlot));
  }, []);

  const setNote = useCallback((note) => {
    dispatch(ScheduleIntent.setNote(note));
  }, []);

  const openModal = useCallback(() => {
    dispatch(ScheduleIntent.openModal());
  }, []);

  const closeModal = useCallback(() => {
    dispatch(ScheduleIntent.closeModal());
  }, []);

  const toggleModal = useCallback(() => {
    dispatch(ScheduleIntent.toggleModal());
  }, []);

  const clearReorderStatus = useCallback(() => {
    dispatch(ScheduleIntent.clearReorderStatus());
  }, []);

  // Persist schedule changes
  const saveSchedule = useCallback(
    async ({ mode, date, timeSlot, note }) => {
      dispatch(ScheduleIntent.saveScheduleStart());
      try {
        const entity = new DeliveryScheduleEntity({
          mode: mode !== undefined ? mode : state.mode,
          date: date !== undefined ? date : state.date,
          timeSlot: timeSlot !== undefined ? timeSlot : state.timeSlot,
          note: note !== undefined ? note : state.note,
        });
        const saved = await container.saveDeliveryScheduleUseCase.execute(entity);
        dispatch(ScheduleIntent.saveScheduleSuccess(saved));
        return { success: true, schedule: saved };
      } catch (err) {
        dispatch(ScheduleIntent.saveScheduleFailure(err.message || 'Failed to save delivery schedule'));
        return { success: false, error: err.message };
      }
    },
    [state.mode, state.date, state.timeSlot, state.note]
  );

  // Quick 1-Click Reorder
  const quickReorder = useCallback(
    async (order, cartStore) => {
      if (!order) return { success: false, message: 'Invalid order' };
      const orderId = order.id || order.orderNumber;
      dispatch(ScheduleIntent.reorderStart(orderId));

      try {
        const result = await container.executeQuickReorderUseCase.execute(order);

        if (cartStore && result.itemsAdded.length > 0) {
          if (typeof cartStore.addItemsBatch === 'function') {
            cartStore.addItemsBatch(result.itemsAdded);
          } else if (typeof cartStore.addItem === 'function') {
            result.itemsAdded.forEach((item) => {
              cartStore.addItem(item.food, item.quantity, item.notes);
            });
          }

          if (typeof cartStore.openCart === 'function') {
            cartStore.openCart();
          }
        }

        dispatch(ScheduleIntent.reorderSuccess(result));

        // Auto clear toast after 4 seconds
        setTimeout(() => {
          dispatch(ScheduleIntent.clearReorderStatus());
        }, 4000);

        return { success: true, result };
      } catch (err) {
        const errorMsg = err.message || 'Quick reorder failed';
        dispatch(ScheduleIntent.reorderFailure(errorMsg));
        return { success: false, message: errorMsg };
      }
    },
    []
  );

  // Helper for current schedule entity
  const currentSchedule = new DeliveryScheduleEntity({
    mode: state.mode,
    date: state.date,
    timeSlot: state.timeSlot,
    note: state.note,
  });

  return {
    state,
    dispatch,
    currentSchedule,
    mode: state.mode,
    date: state.date,
    timeSlot: state.timeSlot,
    note: state.note,
    isModalOpen: state.isModalOpen,
    isLoading: state.isLoading,
    error: state.error,
    reorderLoadingOrderId: state.reorderLoadingOrderId,
    reorderSuccessResult: state.reorderSuccessResult,
    reorderErrorMessage: state.reorderErrorMessage,
    presetTimeSlots: state.presetTimeSlots,

    // Actions
    setMode,
    setDate,
    setTimeSlot,
    setNote,
    openModal,
    closeModal,
    toggleModal,
    saveSchedule,
    quickReorder,
    clearReorderStatus,
  };
}
