import type { OrderEntity } from '../entities/order_entity';
import type { OrderRepository } from '../repositories/order_repository';

export class GetOrdersUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(): Promise<OrderEntity[]> {
    return await this.orderRepository.getOrders();
  }
}
