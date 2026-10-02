import type { VoucherRepository } from '../repositories/voucher_repository';

export class DeleteVoucherUseCase {
  constructor(private readonly voucherRepository: VoucherRepository) {}

  async execute(id: string): Promise<boolean> {
    if (!id) throw new Error('Voucher ID is required');
    return this.voucherRepository.deleteVoucher(id);
  }
}
