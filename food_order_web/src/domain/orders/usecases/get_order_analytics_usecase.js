export class GetOrderAnalyticsUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute() {
    return this.orderRepository.getOrderAnalytics();
  }
}
