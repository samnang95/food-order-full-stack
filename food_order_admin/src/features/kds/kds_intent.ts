import type { OrderEntity, OrderStatus } from '../../domain/orders/entities/order_entity';
import type { KdsStation } from './kds_state';

export type KdsIntent =
  | { type: 'LOAD_ORDERS' }
  | { type: 'UPDATE_STATUS'; payload: { id: string; status: OrderStatus } }
  | { type: 'TOGGLE_ITEM_PREPARED'; payload: { orderId: string; itemId: string } }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TEST_SOUND'; payload?: 'kitchen' | 'transition' | 'urgent' }
  | { type: 'SET_FILTER'; payload: 'all' | 'pending' | 'preparing' | 'ready' }
  | { type: 'SET_STATION'; payload: KdsStation }
  | { type: 'OPEN_PRINT_MODAL'; payload: OrderEntity }
  | { type: 'CLOSE_PRINT_MODAL' }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'TOGGLE_RECALL_DRAWER' }
  | { type: 'RECALL_ORDER'; payload: { id: string; status: OrderStatus } };
