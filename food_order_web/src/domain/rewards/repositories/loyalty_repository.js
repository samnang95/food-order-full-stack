/**
 * Abstract repository interface for Loyalty & Rewards.
 */
export class LoyaltyRepository {
  /**
   * Retrieves user's loyalty profile.
   * @returns {Promise<import('../entities/loyalty_profile_entity').LoyaltyProfileEntity>}
   */
  async getProfile() {
    throw new Error('LoyaltyRepository.getProfile() not implemented');
  }

  /**
   * Claims daily streak check-in rewards.
   * @returns {Promise<import('../entities/loyalty_profile_entity').LoyaltyProfileEntity>}
   */
  async claimDailyCheckIn() {
    throw new Error('LoyaltyRepository.claimDailyCheckIn() not implemented');
  }

  /**
   * Redeems a reward using BitePoints.
   * @returns {Promise<{ profile: import('../entities/loyalty_profile_entity').LoyaltyProfileEntity, voucher: Object }>}
   */
  async redeemReward() {
    throw new Error('LoyaltyRepository.redeemReward() not implemented');
  }

  /**
   * Credits earned points when an order is placed.
   * @returns {Promise<import('../entities/loyalty_profile_entity').LoyaltyProfileEntity>}
   */
  async earnPointsFromOrder() {
    throw new Error('LoyaltyRepository.earnPointsFromOrder() not implemented');
  }
}
