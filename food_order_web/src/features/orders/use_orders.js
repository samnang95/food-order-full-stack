import { useOrdersStore } from './orders_store';

export function useOrders() {
  return useOrdersStore();
}
