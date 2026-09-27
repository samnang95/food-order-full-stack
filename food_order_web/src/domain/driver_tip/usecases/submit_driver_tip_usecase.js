export class SubmitDriverTipUseCase {
  constructor(driverTipRepository) {
    this.driverTipRepository = driverTipRepository;
  }

  async execute(tipData) {
    return this.driverTipRepository.submitDriverTip(tipData);
  }
}
