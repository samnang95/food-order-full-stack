import type { OrderEntity, OrderStatus } from '../../domain/orders/entities/order_entity';

export type KdsIntent =
  | { type: 'LOAD_ORDERS' }
  | { type: 'UPDATE_STATUS'; payload: { id: string; status: OrderStatus } }
  | { type: 'TOGGLE_ITEM_PREPARED'; payload: { orderId: string; itemId: string } }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_FILTER'; payload: 'all' | 'pending' | 'preparing' | 'ready' }
  | { type: 'OPEN_PRINT_MODAL'; payload: OrderEntity }
  | { type: 'CLOSE_PRINT_MODAL' }
  | { type: 'TOGGLE_FULLSCREEN' };
