import type { OrderEntity, OrderStatus } from '../../domain/orders/entities/order_entity';

/**
 * Intent (I) in MVI:
 * Action types and intent creators representing user actions and external events.
 */
export const OrdersIntentType = {
  FETCH_ORDERS: 'ORDERS/FETCH_ORDERS',
  FETCH_START: 'ORDERS/FETCH_START',
  FETCH_SUCCESS: 'ORDERS/FETCH_SUCCESS',
  FETCH_ERROR: 'ORDERS/FETCH_ERROR',

  SET_FILTER: 'ORDERS/SET_FILTER',
  SET_SEARCH: 'ORDERS/SET_SEARCH',

  SELECT_ORDER: 'ORDERS/SELECT_ORDER',
  CLEAR_SELECTED_ORDER: 'ORDERS/CLEAR_SELECTED_ORDER',

  UPDATE_STATUS: 'ORDERS/UPDATE_STATUS',
  ADVANCE_STATUS: 'ORDERS/ADVANCE_STATUS',
  CANCEL_ORDER: 'ORDERS/CANCEL_ORDER',
} as const;

export type OrdersIntent =
  | { type: typeof OrdersIntentType.FETCH_ORDERS }
  | { type: typeof OrdersIntentType.FETCH_START }
  | { type: typeof OrdersIntentType.FETCH_SUCCESS; payload: OrderEntity[] }
  | { type: typeof OrdersIntentType.FETCH_ERROR; payload: string }
  | { type: typeof OrdersIntentType.SET_FILTER; payload: string }
  | { type: typeof OrdersIntentType.SET_SEARCH; payload: string }
  | { type: typeof OrdersIntentType.SELECT_ORDER; payload: OrderEntity }
  | { type: typeof OrdersIntentType.CLEAR_SELECTED_ORDER }
  | { type: typeof OrdersIntentType.UPDATE_STATUS; payload: { orderId: string; newStatus: OrderStatus } }
  | { type: typeof OrdersIntentType.ADVANCE_STATUS; payload: { orderId: string } }
  | { type: typeof OrdersIntentType.CANCEL_ORDER; payload: { orderId: string } };

export const OrdersIntents = {
  fetchOrders: (): OrdersIntent => ({
    type: OrdersIntentType.FETCH_ORDERS,
  }),
  setFilter: (status: string): OrdersIntent => ({
    type: OrdersIntentType.SET_FILTER,
    payload: status,
  }),
  setSearch: (query: string): OrdersIntent => ({
    type: OrdersIntentType.SET_SEARCH,
    payload: query,
  }),
  selectOrder: (order: OrderEntity): OrdersIntent => ({
    type: OrdersIntentType.SELECT_ORDER,
    payload: order,
  }),
  clearSelectedOrder: (): OrdersIntent => ({
    type: OrdersIntentType.CLEAR_SELECTED_ORDER,
  }),
  updateStatus: (orderId: string, newStatus: OrderStatus): OrdersIntent => ({
    type: OrdersIntentType.UPDATE_STATUS,
    payload: { orderId, newStatus },
  }),
  advanceStatus: (orderId: string): OrdersIntent => ({
    type: OrdersIntentType.ADVANCE_STATUS,
    payload: { orderId },
  }),
  cancelOrder: (orderId: string): OrdersIntent => ({
    type: OrdersIntentType.CANCEL_ORDER,
    payload: { orderId },
  }),
};
