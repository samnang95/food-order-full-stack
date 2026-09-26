import { useReducer, useEffect, useCallback, useRef } from 'react';
import { initialOrdersState, computeFilteredOrders } from './orders_state';
import { OrdersIntentType } from './orders_intent';
import { ApiClient } from '../../services/api_client';
import { socketService } from '../../services/socket_service';

/**
 * Pure Reducer: receives current state and intent, returns new state
 */
function ordersReducer(state, action) {
  switch (action.type) {
    case OrdersIntentType.FETCH_START:
      return {
        ...state,
        isLoading: true,
        errorMessage: null,
      };

    case OrdersIntentType.FETCH_SUCCESS: {
      const orders = action.payload;
      return {
        ...state,
        isLoading: false,
        orders,
        filteredOrders: computeFilteredOrders(orders, state.activeFilter, state.searchQuery),
        lastUpdated: new Date(),
        errorMessage: null,
      };
    }

    case OrdersIntentType.FETCH_ERROR:
      return {
        ...state,
        isLoading: false,
        errorMessage: action.payload,
      };

    case OrdersIntentType.SET_FILTER: {
      const activeFilter = action.payload;
      return {
        ...state,
        activeFilter,
        filteredOrders: computeFilteredOrders(state.orders, activeFilter, state.searchQuery),
      };
    }

    case OrdersIntentType.SET_SEARCH: {
      const searchQuery = action.payload;
      return {
        ...state,
        searchQuery,
        filteredOrders: computeFilteredOrders(state.orders, state.activeFilter, searchQuery),
      };
    }

    case OrdersIntentType.SELECT_ORDER:
      return {
        ...state,
        selectedOrder: action.payload,
      };

    case OrdersIntentType.CLEAR_SELECTED_ORDER:
      return {
        ...state,
        selectedOrder: null,
      };

    case OrdersIntentType.UPDATE_STATUS_OPTIMISTIC: {
      const { orderId, newStatus } = action.payload;
      const updatedOrders = state.orders.map((order) => {
        const id = order._id || order.id;
        if (id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });

      return {
        ...state,
        orders: updatedOrders,
        filteredOrders: computeFilteredOrders(updatedOrders, state.activeFilter, state.searchQuery),
        selectedOrder:
          state.selectedOrder && (state.selectedOrder._id || state.selectedOrder.id) === orderId
            ? { ...state.selectedOrder, status: newStatus }
            : state.selectedOrder,
      };
    }

    case OrdersIntentType.ORDER_UPDATED_FROM_SOCKET: {
      const { orderId, status } = action.payload;
      const updatedOrders = state.orders.map((order) => {
        const id = order._id || order.id;
        if (id === orderId) {
          return { ...order, status };
        }
        return order;
      });

      return {
        ...state,
        orders: updatedOrders,
        filteredOrders: computeFilteredOrders(updatedOrders, state.activeFilter, state.searchQuery),
      };
    }

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects
 */
export function useOrdersStore() {
  const [state, dispatch] = useReducer(ordersReducer, initialOrdersState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const fetchOrders = useCallback(async () => {
    dispatch({ type: OrdersIntentType.FETCH_START });
    try {
      const data = await ApiClient.get('/orders');
      // Normalize orders array from API response structure
      const ordersList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.orders)
        ? data.orders
        : [];
      dispatch({ type: OrdersIntentType.FETCH_SUCCESS, payload: ordersList });
    } catch (error) {
      dispatch({
        type: OrdersIntentType.FETCH_ERROR,
        payload: error.message || 'Failed to fetch orders from server',
      });
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    // 1. Optimistic UI update
    dispatch({
      type: OrdersIntentType.UPDATE_STATUS_OPTIMISTIC,
      payload: { orderId, newStatus },
    });

    // 2. Sync with backend API
    try {
      if (newStatus === 'cancelled') {
        await ApiClient.put(`/orders/${orderId}/cancel`, { reason: 'Cancelled by kitchen admin' });
      } else {
        await ApiClient.put(`/orders/${orderId}`, { status: newStatus });
      }
    } catch (error) {
      console.warn(`[OrdersStore] Backend status update warning: ${error.message}`);
    }
  }, []);

  /**
   * Main Intent Dispatcher: UI dispatches user intents through onIntent
   */
  const onIntent = useCallback(
    (intent) => {
      switch (intent.type) {
        case OrdersIntentType.FETCH_ORDERS:
          fetchOrders();
          break;

        case OrdersIntentType.UPDATE_STATUS_OPTIMISTIC:
          updateOrderStatus(intent.payload.orderId, intent.payload.newStatus);
          break;

        default:
          dispatch(intent);
          break;
      }
    },
    [fetchOrders, updateOrderStatus]
  );

  // Initial load & Socket.IO subscription
  useEffect(() => {
    fetchOrders();

    // Listen to real-time status changes from socket
    socketService.onOrderStatusChanged((data) => {
      console.log('⚡ [OrdersStore] Socket status changed event received:', data);
      dispatch({
        type: OrdersIntentType.ORDER_UPDATED_FROM_SOCKET,
        payload: data,
      });
    });

    // Listen for new push notifications
    socketService.onPushNotification((notif) => {
      console.log('🔔 [OrdersStore] Real-time notification received:', notif);
      fetchOrders();
    });
  }, [fetchOrders]);

  return {
    state,
    onIntent,
  };
}
