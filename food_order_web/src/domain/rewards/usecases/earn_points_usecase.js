/**
 * Use case to award BitePoints upon order completion.
 */
export class EarnPointsUseCase {
  constructor(loyaltyRepository) {
    this.loyaltyRepository = loyaltyRepository;
  }

  async execute(orderId, orderAmount) {
    if (!orderId || !orderAmount) return null;
    return this.loyaltyRepository.earnPointsFromOrder(orderId, orderAmount);
  }
}
