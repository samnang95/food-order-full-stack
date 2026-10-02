import type { VoucherRepository, CreateVoucherParams } from '../repositories/voucher_repository';
import type { Voucher } from '../entities/voucher';

export class CreateVoucherUseCase {
  constructor(private readonly voucherRepository: VoucherRepository) {}

  async execute(params: CreateVoucherParams): Promise<Voucher> {
    if (!params.code.trim()) {
      throw new Error('Voucher code is required');
    }
    if (!params.title.trim()) {
      throw new Error('Voucher title is required');
    }
    if (params.value <= 0) {
      throw new Error('Discount value must be greater than zero');
    }
    if (params.type === 'percentage' && params.value > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }
    return this.voucherRepository.createVoucher(params);
  }
}
