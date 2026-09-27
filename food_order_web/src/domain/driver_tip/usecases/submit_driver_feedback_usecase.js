export class SubmitDriverFeedbackUseCase {
  constructor(driverTipRepository) {
    this.driverTipRepository = driverTipRepository;
  }

  async execute(feedbackData) {
    return this.driverTipRepository.submitDriverFeedback(feedbackData);
  }
}
