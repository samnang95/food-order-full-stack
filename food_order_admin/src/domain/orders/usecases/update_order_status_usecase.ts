import type { OrderEntity, OrderStatus } from '../entities/order_entity';
import type { OrderRepository } from '../repositories/order_repository';

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(id: string, status: OrderStatus): Promise<OrderEntity> {
    return await this.orderRepository.updateOrderStatus(id, status);
  }
}
