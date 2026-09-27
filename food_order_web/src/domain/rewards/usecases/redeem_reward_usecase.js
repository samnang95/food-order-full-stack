/**
 * Use case to redeem BitePoints for a discount voucher.
 */
export class RedeemRewardUseCase {
  constructor(loyaltyRepository) {
    this.loyaltyRepository = loyaltyRepository;
  }

  async execute(reward) {
    if (!reward) {
      throw new Error('Reward item is required for redemption.');
    }
    return this.loyaltyRepository.redeemReward(reward);
  }
}
