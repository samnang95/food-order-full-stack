import type { OrderEntity, OrderStatus } from '../entities/order_entity';

export interface OrderRepository {
  getOrders(): Promise<OrderEntity[]>;
  getOrderById(id: string): Promise<OrderEntity | null>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<OrderEntity>;
}
