export class CreateOrderUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderData) {
    if (!orderData) throw new Error('Order data is required');
    return await this.orderRepository.createOrder(orderData);
  }
}
