export class CancelOrderUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId, reason = '') {
    if (!orderId) throw new Error('Order ID is required');
    return await this.orderRepository.cancelOrder(orderId, reason);
  }
}
