export class GetVouchersUseCase {
  constructor(voucherRepository) {
    this.voucherRepository = voucherRepository;
  }

  async execute() {
    return await this.voucherRepository.getAvailableVouchers();
  }
}
