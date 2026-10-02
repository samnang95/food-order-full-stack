import type { OrderEntity } from '../../domain/orders/entities/order_entity';

export interface KdsState {
  orders: OrderEntity[];
  isLoading: boolean;
  error: string | null;
  soundEnabled: boolean;
  activeFilter: 'all' | 'pending' | 'preparing' | 'ready';
  preparedItems: Record<string, boolean>; // key: `${orderId}_${itemId}`
  selectedOrderForPrint: OrderEntity | null;
  isPrintModalOpen: boolean;
  isFullscreen: boolean;
}

export const initialKdsState: KdsState = {
  orders: [],
  isLoading: false,
  error: null,
  soundEnabled: true,
  activeFilter: 'all',
  preparedItems: {},
  selectedOrderForPrint: null,
  isPrintModalOpen: false,
  isFullscreen: false,
};
