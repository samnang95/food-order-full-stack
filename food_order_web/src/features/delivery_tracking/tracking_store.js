import { useReducer, useCallback, useEffect, useRef } from 'react';
import { createInitialTrackingState } from './tracking_state';
import { TrackingIntentType } from './tracking_intent';
import { container } from '../../core/di/container';
import { socketService } from '../../core/services/socket_service';
import { soundService } from '../../core';

/**
 * Pure Reducer: receives current state and intent, returns new state.
 */
export function trackingReducer(state, action) {
  switch (action.type) {
    case TrackingIntentType.LOAD_START:
      return { ...state, isLoading: true, errorMessage: null };

    case TrackingIntentType.LOAD_SUCCESS:
      return {
        ...state,
        isLoading: false,
        activeTracking: action.payload,
        errorMessage: null,
      };

    case TrackingIntentType.LOAD_ERROR:
      return { ...state, isLoading: false, errorMessage: action.payload };

    case TrackingIntentType.ACTIVE_DELIVERIES_LOADED:
      return { ...state, activeDeliveries: action.payload || [] };

    case TrackingIntentType.DRIVER_LOCATION_UPDATED:
      return {
        ...state,
        activeTracking: action.payload,
      };

    case TrackingIntentType.STATUS_UPDATED:
      return {
        ...state,
        activeTracking: action.payload,
      };

    case TrackingIntentType.TOGGLE_MAP:
      return { ...state, isMapExpanded: !state.isMapExpanded };

    case TrackingIntentType.SIMULATION_TICK:
      return {
        ...state,
        activeTracking: action.payload,
        simulationTick: state.simulationTick + 1,
      };

    case TrackingIntentType.CLEAR_TRACKING:
      return {
        ...state,
        activeTracking: null,
        simulationTick: 0,
      };

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects for Delivery Tracking.
 * Integrates real-time Socket.IO room subscriptions with fallback simulation.
 */
export function useTrackingStore(orderId = null) {
  const [state, dispatch] = useReducer(trackingReducer, undefined, createInitialTrackingState);
  const simulationRef = useRef(null);

  // Load tracking for a specific order
  const loadTracking = useCallback(async (id) => {
    if (!id) return;
    dispatch({ type: TrackingIntentType.LOAD_START });
    try {
      const tracking = await container.getTrackingByOrderIdUseCase.execute(id);
      dispatch({ type: TrackingIntentType.LOAD_SUCCESS, payload: tracking });
    } catch (err) {
      dispatch({
        type: TrackingIntentType.LOAD_ERROR,
        payload: err.message || 'Failed to load tracking',
      });
    }
  }, []);

  // Load all active deliveries
  const loadActiveDeliveries = useCallback(async () => {
    try {
      const deliveries = await container.getActiveDeliveriesUseCase.execute();
      dispatch({ type: TrackingIntentType.ACTIVE_DELIVERIES_LOADED, payload: deliveries });
    } catch (err) {
      console.warn('[TrackingStore] Failed to load active deliveries:', err);
    }
  }, []);

  // Simulate driver movement toward destination as fallback
  const simulateDriverMovement = useCallback(async (id) => {
    if (!id) return;
    try {
      const repo = container.getTrackingRepository();
      const session = await repo.getTrackingByOrderId(id);
      if (!session || !session.isLive || !session.deliveryLat || !session.deliveryLng) return;

      // Move driver slightly toward destination
      const moveFactor = 0.08 + Math.random() * 0.04;
      const jitter = () => (Math.random() - 0.5) * 0.0008;

      const newLat =
        session.driverLat + (session.deliveryLat - session.driverLat) * moveFactor + jitter();
      const newLng =
        session.driverLng + (session.deliveryLng - session.driverLng) * moveFactor + jitter();

      const updated = await repo.updateDriverLocation(id, { lat: newLat, lng: newLng });
      if (updated) {
        dispatch({ type: TrackingIntentType.SIMULATION_TICK, payload: updated });
      }
    } catch (err) {
      console.warn('[TrackingStore] Simulation tick error:', err);
    }
  }, []);

  // Auto-load tracking and subscribe to real-time socket room when orderId changes
  useEffect(() => {
    if (!orderId) {
      dispatch({ type: TrackingIntentType.CLEAR_TRACKING });
      return;
    }

    loadTracking(orderId);

    // Join real-time socket room for live driver location and status updates
    socketService.joinOrder(orderId);

    const unsubLocation = socketService.onDriverLocation((data) => {
      if (data?.orderId === orderId) {
        loadTracking(orderId);
      }
    });

    const unsubStatus = socketService.onOrderStatusChanged((data) => {
      if (data?.orderId === orderId) {
        soundService.playBell();
        loadTracking(orderId);
      }
    });

    return () => {
      socketService.leaveOrder(orderId);
      unsubLocation?.();
      unsubStatus?.();
      dispatch({ type: TrackingIntentType.CLEAR_TRACKING });
    };
  }, [orderId, loadTracking]);


  // Start/stop live simulation when tracking is active
  useEffect(() => {
    if (state.activeTracking?.isLive && orderId) {
      simulationRef.current = setInterval(() => {
        simulateDriverMovement(orderId);
      }, 4000); // Update every 4 seconds

      return () => {
        if (simulationRef.current) {
          clearInterval(simulationRef.current);
          simulationRef.current = null;
        }
      };
    }

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
    };
  }, [state.activeTracking?.isLive, orderId, simulateDriverMovement]);

  // Intent dispatcher
  const onIntent = useCallback(
    (intent) => {
      switch (intent.type) {
        case TrackingIntentType.LOAD_TRACKING:
          loadTracking(intent.payload);
          break;
        case TrackingIntentType.LOAD_ACTIVE_DELIVERIES:
          loadActiveDeliveries();
          break;
        default:
          dispatch(intent);
          break;
      }
    },
    [loadTracking, loadActiveDeliveries]
  );

  return {
    state,
    onIntent,
    tracking: state.activeTracking,
    activeDeliveries: state.activeDeliveries,
    isLoading: state.isLoading,
    errorMessage: state.errorMessage,
    isMapExpanded: state.isMapExpanded,
    loadTracking,
    loadActiveDeliveries,
    toggleMap: () => dispatch({ type: TrackingIntentType.TOGGLE_MAP }),
  };
}
