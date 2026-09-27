export class GetDriverProfileUseCase {
  constructor(driverTipRepository) {
    this.driverTipRepository = driverTipRepository;
  }

  async execute(driverId) {
    return this.driverTipRepository.getDriverProfile(driverId);
  }
}
