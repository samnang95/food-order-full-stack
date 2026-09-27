export class ValidateVoucherUseCase {
  constructor(voucherRepository) {
    this.voucherRepository = voucherRepository;
  }

  async execute(code, subtotal = 0) {
    return await this.voucherRepository.validateVoucher(code, subtotal);
  }
}
