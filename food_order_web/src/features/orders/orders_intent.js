/**
 * Intent (I) in MVI:
 * Plain actions representing user intents and external events.
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

  UPDATE_STATUS_OPTIMISTIC: 'ORDERS/UPDATE_STATUS_OPTIMISTIC',
  ORDER_UPDATED_FROM_SOCKET: 'ORDERS/ORDER_UPDATED_FROM_SOCKET',
};

export const OrdersIntent = {
  fetchOrders: () => ({
    type: OrdersIntentType.FETCH_ORDERS,
  }),

  setFilter: (status) => ({
    type: OrdersIntentType.SET_FILTER,
    payload: status,
  }),

  setSearch: (query) => ({
    type: OrdersIntentType.SET_SEARCH,
    payload: query,
  }),

  selectOrder: (order) => ({
    type: OrdersIntentType.SELECT_ORDER,
    payload: order,
  }),

  clearSelectedOrder: () => ({
    type: OrdersIntentType.CLEAR_SELECTED_ORDER,
  }),

  updateOrderStatus: (orderId, newStatus) => ({
    type: OrdersIntentType.UPDATE_STATUS_OPTIMISTIC,
    payload: { orderId, newStatus },
  }),

  handleSocketOrderUpdate: (data) => ({
    type: OrdersIntentType.ORDER_UPDATED_FROM_SOCKET,
    payload: data,
  }),
};
