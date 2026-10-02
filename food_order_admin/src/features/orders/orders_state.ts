import type { OrderEntity } from '../../domain/orders/entities/order_entity';

/**
 * Model / State (M) in MVI:
 * Immutable representation of the Orders feature state.
 */
export interface OrdersState {
  orders: OrderEntity[];
  filteredOrders: OrderEntity[];
  selectedOrder: OrderEntity | null;
  activeFilter: string;
  searchQuery: string;
  isDetailModalOpen: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  statusCounts: Record<string, number>;
  totalRevenue: number;
  activeOrdersCount: number;
}

export const initialOrdersState: OrdersState = {
  orders: [],
  filteredOrders: [],
  selectedOrder: null,
  activeFilter: 'all',
  searchQuery: '',
  isDetailModalOpen: false,
  isLoading: false,
  errorMessage: null,
  statusCounts: {
    all: 0,
    pending: 0,
    preparing: 0,
    on_delivery: 0,
    delivered: 0,
    cancelled: 0,
  },
  totalRevenue: 0,
  activeOrdersCount: 0,
};

export function computeFilteredOrders(
  orders: OrderEntity[],
  filter: string,
  search: string
): OrderEntity[] {
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
      const orderNum = (order.orderNumber || '').toLowerCase();
      const customer = (order.customerName || '').toLowerCase();
      const phone = order.customerPhone || '';
      return orderNum.includes(q) || customer.includes(q) || phone.includes(q);
    });
  }

  return result;
}

export function computeStatusCounts(orders: OrderEntity[]): Record<string, number> {
  const counts: Record<string, number> = {
    all: orders.length,
    pending: 0,
    preparing: 0,
    on_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const o of orders) {
    if (counts[o.status] !== undefined) {
      counts[o.status]++;
    }
  }
  return counts;
}

export function computeTotalRevenue(orders: OrderEntity[]): number {
  return orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
}

export function computeActiveOrdersCount(orders: OrderEntity[]): number {
  return orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'on_delivery'
  ).length;
}
