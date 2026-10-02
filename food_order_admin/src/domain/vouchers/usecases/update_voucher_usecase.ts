import type { VoucherRepository, UpdateVoucherParams } from '../repositories/voucher_repository';
import type { Voucher } from '../entities/voucher';

export class UpdateVoucherUseCase {
  constructor(private readonly voucherRepository: VoucherRepository) {}

  async execute(params: UpdateVoucherParams): Promise<Voucher> {
    if (!params.id) {
      throw new Error('Voucher ID is required');
    }
    return this.voucherRepository.updateVoucher(params);
  }
}
