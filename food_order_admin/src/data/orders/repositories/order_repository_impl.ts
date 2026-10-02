import type { OrderEntity, OrderStatus } from '../../../domain/orders/entities/order_entity';
import type { OrderRepository } from '../../../domain/orders/repositories/order_repository';
import { OrderModel, type OrderModelData } from '../models/order_model';
import { mockOrdersData } from '../datasources/orders_mock_data';
import { indexedDBService, DB_STORES } from '../../../core/db';

export class OrderRepositoryImpl implements OrderRepository {
  private localOrders: OrderModelData[] = [];
  private isInitialized = false;

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const stored = await indexedDBService.getAll<OrderModelData>(DB_STORES.ORDERS);
      if (stored && stored.length > 0) {
        this.localOrders = stored;
      } else {
        this.localOrders = [...mockOrdersData];
        await indexedDBService.putAll(DB_STORES.ORDERS, this.localOrders);
      }
    } catch {
      this.localOrders = [...mockOrdersData];
    }
    this.isInitialized = true;
  }

  async getOrders(): Promise<OrderEntity[]> {
    await this.ensureInitialized();
    return this.localOrders.map((m) => OrderModel.toEntity(m));
  }

  async getOrderById(id: string): Promise<OrderEntity | null> {
    await this.ensureInitialized();
    const found = this.localOrders.find((o) => o.id === id);
    return found ? OrderModel.toEntity(found) : null;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderEntity> {
    await this.ensureInitialized();
    const item = this.localOrders.find((o) => o.id === id);
    if (!item) {
      throw new Error(`Order with ID ${id} not found`);
    }
    item.status = status;
    if (status === 'delivered') {
      item.estimatedDeliveryMinutes = 0;
    }

    // Persist to local IndexedDB
    await indexedDBService.put(DB_STORES.ORDERS, item);

    return OrderModel.toEntity(item);
  }
}
