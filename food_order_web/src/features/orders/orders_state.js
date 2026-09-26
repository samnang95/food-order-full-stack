/**
 * Model / State (M) in MVI:
 * Immutable representation of the Orders feature state.
 */
export const initialOrdersState = {
  orders: [],
  filteredOrders: [],
  selectedOrder: null,
  activeFilter: 'all', // 'all', 'pending', 'preparing', 'on_the_way', 'delivered', 'cancelled'
  searchQuery: '',
  isLoading: false,
  errorMessage: null,
  lastUpdated: null,
};

/**
 * Pure helper to filter orders based on active tab and search query
 */
export function computeFilteredOrders(orders, filter, search) {
  let result = [...orders];

  if (filter && filter !== 'all') {
    result = result.filter((order) => {
      const status = (order.status || '').toLowerCase();
      return status === filter.toLowerCase();
    });
  }

  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    result = result.filter((order) => {
      const id = (order._id || order.id || '').toLowerCase();
      const customer = (order.user?.name || order.deliveryAddress || '').toLowerCase();
      return id.includes(q) || customer.includes(q);
    });
  }

  return result;
}
