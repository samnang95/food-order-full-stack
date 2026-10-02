import type { OrderEntity, OrderStatus } from '../../../domain/orders/entities/order_entity';
import type { OrderRepository } from '../../../domain/orders/repositories/order_repository';
import { OrderModel, type OrderModelData } from '../models/order_model';
import { mockOrdersData } from '../datasources/orders_mock_data';

export class OrderRepositoryImpl implements OrderRepository {
  private localOrders: OrderModelData[] = [...mockOrdersData];

  async getOrders(): Promise<OrderEntity[]> {
    return this.localOrders.map((m) => OrderModel.toEntity(m));
  }

  async getOrderById(id: string): Promise<OrderEntity | null> {
    const found = this.localOrders.find((o) => o.id === id);
    return found ? OrderModel.toEntity(found) : null;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderEntity> {
    const item = this.localOrders.find((o) => o.id === id);
    if (!item) {
      throw new Error(`Order with ID ${id} not found`);
    }
    item.status = status;
    if (status === 'delivered') {
      item.estimatedDeliveryMinutes = 0;
    }
    return OrderModel.toEntity(item);
  }
}
