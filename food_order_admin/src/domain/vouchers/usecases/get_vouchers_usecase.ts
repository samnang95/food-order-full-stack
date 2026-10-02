import type { VoucherRepository } from '../repositories/voucher_repository';
import type { Voucher } from '../entities/voucher';

export class GetVouchersUseCase {
  constructor(private readonly voucherRepository: VoucherRepository) {}

  async execute(): Promise<Voucher[]> {
    return this.voucherRepository.getVouchers();
  }
}
