/**
 * Use case to fetch the current user's loyalty profile.
 */
export class GetLoyaltyProfileUseCase {
  constructor(loyaltyRepository) {
    this.loyaltyRepository = loyaltyRepository;
  }

  async execute() {
    return this.loyaltyRepository.getProfile();
  }
}
