import type { VoucherRepository } from '../repositories/voucher_repository';
import type { VoucherValidationResult } from '../entities/voucher';

export class ValidateVoucherUseCase {
  constructor(private readonly voucherRepository: VoucherRepository) {}

  async execute(code: string, subtotal: number): Promise<VoucherValidationResult> {
    if (!code.trim()) {
      return { valid: false, message: 'Please enter a voucher code' };
    }
    return this.voucherRepository.validateVoucher(code, subtotal);
  }
}
