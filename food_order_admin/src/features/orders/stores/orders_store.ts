import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import type { OrderStatus } from '../../../domain/orders/entities/order_entity';
import { orderRepository } from '../../../data';
import { GetOrdersUseCase } from '../../../domain/orders/usecases/get_orders_usecase';
import { UpdateOrderStatusUseCase } from '../../../domain/orders/usecases/update_order_status_usecase';
import { OrdersIntentType, type OrdersIntent, OrdersIntents } from '../orders_intent';
import {
  initialOrdersState,
  computeFilteredOrders,
  computeStatusCounts,
  computeTotalRevenue,
  computeActiveOrdersCount,
  type OrdersState,
} from '../orders_state';

export const useOrdersStore = defineStore('orders', () => {
  const getOrdersUseCase = new GetOrdersUseCase(orderRepository);
  const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);

  // MVI Reactive State (M)
  const state = reactive<OrdersState>({ ...initialOrdersState });

  function applyStateUpdates() {
    state.filteredOrders = computeFilteredOrders(state.orders, state.activeFilter, state.searchQuery);
    state.statusCounts = computeStatusCounts(state.orders);
    state.totalRevenue = computeTotalRevenue(state.orders);
    state.activeOrdersCount = computeActiveOrdersCount(state.orders);
  }

  /**
   * MVI Reducer / Dispatcher (I -> M)
   * All mutations and asynchronous effects are processed through user intents.
   */
  async function dispatch(intent: OrdersIntent) {
    switch (intent.type) {
      case OrdersIntentType.FETCH_ORDERS: {
        state.isLoading = true;
        state.errorMessage = null;
        try {
          const result = await getOrdersUseCase.execute();
          state.orders = result;
          applyStateUpdates();
        } catch (err: unknown) {
          state.errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
        } finally {
          state.isLoading = false;
        }
        break;
      }

      case OrdersIntentType.SET_FILTER: {
        state.activeFilter = intent.payload;
        state.filteredOrders = computeFilteredOrders(state.orders, state.activeFilter, state.searchQuery);
        break;
      }

      case OrdersIntentType.SET_SEARCH: {
        state.searchQuery = intent.payload;
        state.filteredOrders = computeFilteredOrders(state.orders, state.activeFilter, state.searchQuery);
        break;
      }

      case OrdersIntentType.SELECT_ORDER: {
        state.selectedOrder = intent.payload;
        state.isDetailModalOpen = true;
        break;
      }

      case OrdersIntentType.CLEAR_SELECTED_ORDER: {
        state.selectedOrder = null;
        state.isDetailModalOpen = false;
        break;
      }

      case OrdersIntentType.UPDATE_STATUS: {
        const { orderId, newStatus } = intent.payload;
        try {
          const updated = await updateOrderStatusUseCase.execute(orderId, newStatus);
          const idx = state.orders.findIndex((o) => o.id === orderId);
          if (idx !== -1) {
            state.orders[idx] = updated;
          }
          if (state.selectedOrder?.id === orderId) {
            state.selectedOrder = updated;
          }
          applyStateUpdates();
        } catch (err: unknown) {
          state.errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
        }
        break;
      }

      case OrdersIntentType.ADVANCE_STATUS: {
        const order = state.orders.find((o) => o.id === intent.payload.orderId);
        if (!order) return;
        const flow: Record<OrderStatus, OrderStatus> = {
          pending: 'preparing',
          preparing: 'on_delivery',
          on_delivery: 'delivered',
          delivered: 'delivered',
          confirmed: 'preparing',
          cancelled: 'cancelled',
        };
        const next = flow[order.status];
        if (next && next !== order.status) {
          await dispatch(OrdersIntents.updateStatus(order.id, next));
        }
        break;
      }

      case OrdersIntentType.CANCEL_ORDER: {
        await dispatch(OrdersIntents.updateStatus(intent.payload.orderId, 'cancelled'));
        break;
      }
    }
  }

  // Initial Fetch on store instantiation
  dispatch(OrdersIntents.fetchOrders());

  // Direct accessors / bindings
  const orders = computed(() => state.orders);
  const filteredOrders = computed(() => state.filteredOrders);
  const selectedOrder = computed(() => state.selectedOrder);
  const activeStatusFilter = computed({
    get: () => state.activeFilter,
    set: (val: string) => dispatch(OrdersIntents.setFilter(val)),
  });
  const searchQuery = computed({
    get: () => state.searchQuery,
    set: (val: string) => dispatch(OrdersIntents.setSearch(val)),
  });
  const isDetailModalOpen = computed(() => state.isDetailModalOpen);
  const statusCounts = computed(() => state.statusCounts);
  const totalRevenue = computed(() => state.totalRevenue);
  const activeOrdersCount = computed(() => state.activeOrdersCount);

  return {
    state,
    dispatch,
    orders,
    filteredOrders,
    selectedOrder,
    activeStatusFilter,
    searchQuery,
    isDetailModalOpen,
    statusCounts,
    totalRevenue,
    activeOrdersCount,
    // Convenience helper methods that dispatch intents
    updateOrderStatus: (id: string, status: OrderStatus) => dispatch(OrdersIntents.updateStatus(id, status)),
    advanceOrderStatus: (id: string) => dispatch(OrdersIntents.advanceStatus(id)),
    openOrderDetail: (order: Parameters<typeof OrdersIntents.selectOrder>[0]) => dispatch(OrdersIntents.selectOrder(order)),
    closeOrderDetail: () => dispatch(OrdersIntents.clearSelectedOrder()),
    loadOrders: () => dispatch(OrdersIntents.fetchOrders()),
  };
});
