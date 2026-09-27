export class GetOrderTipStatusUseCase {
  constructor(driverTipRepository) {
    this.driverTipRepository = driverTipRepository;
  }

  async execute(orderId) {
    return this.driverTipRepository.getOrderTipStatus(orderId);
  }
}
