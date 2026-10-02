import type { VoucherRepository } from '../repositories/voucher_repository';
import type { Voucher } from '../entities/voucher';

export class ToggleVoucherStatusUseCase {
  constructor(private readonly voucherRepository: VoucherRepository) {}

  async execute(id: string): Promise<Voucher> {
    if (!id) throw new Error('Voucher ID is required');
    return this.voucherRepository.toggleVoucherStatus(id);
  }
}
