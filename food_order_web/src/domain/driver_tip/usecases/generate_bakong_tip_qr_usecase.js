export class GenerateBakongTipQrUseCase {
  constructor(driverTipRepository) {
    this.driverTipRepository = driverTipRepository;
  }

  execute({ orderId, driver, amountUsd, amountKhr }) {
    return this.driverTipRepository.generateBakongTipQr({
      orderId,
      driver,
      amountUsd,
      amountKhr,
    });
  }
}
