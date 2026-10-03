import type { OrderEntity } from '../../domain/orders/entities/order_entity';

export type KdsStation = 'all' | 'kitchen' | 'drinks' | 'dessert';

export interface KdsState {
  orders: OrderEntity[];
  isLoading: boolean;
  error: string | null;
  soundEnabled: boolean;
  activeFilter: 'all' | 'pending' | 'preparing' | 'ready';
  stationFilter: KdsStation;
  preparedItems: Record<string, boolean>; // key: `${orderId}_${itemId}`
  selectedOrderForPrint: OrderEntity | null;
  isPrintModalOpen: boolean;
  isFullscreen: boolean;
  isRecallDrawerOpen: boolean;
  recentlyBumpedOrders: OrderEntity[];
}

export const initialKdsState: KdsState = {
  orders: [],
  isLoading: false,
  error: null,
  soundEnabled: true,
  activeFilter: 'all',
  stationFilter: 'all',
  preparedItems: {},
  selectedOrderForPrint: null,
  isPrintModalOpen: false,
  isFullscreen: false,
  isRecallDrawerOpen: false,
  recentlyBumpedOrders: [],
};
