export class IVoucherRepository {
  async getAvailableVouchers() {
    throw new Error('Method getAvailableVouchers() must be implemented.');
  }

  async validateVoucher() {
    throw new Error('Method validateVoucher(code, subtotal) must be implemented.');
  }
}
