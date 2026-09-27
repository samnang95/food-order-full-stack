/**
 * Use case to claim daily streak bonus points.
 */
export class ClaimDailyCheckInUseCase {
  constructor(loyaltyRepository) {
    this.loyaltyRepository = loyaltyRepository;
  }

  async execute() {
    return this.loyaltyRepository.claimDailyCheckIn();
  }
}
