import { ApiClient } from '../../../core/services/api_client';

export class VoucherRemoteDataSource {
  async fetchVouchers() {
    const res = await ApiClient.get('/vouchers');
    if (res?.data && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }

  async validateVoucher(code, subtotal = 0) {
    const res = await ApiClient.post('/vouchers/validate', {
      code: (code || '').trim().toUpperCase(),
      subtotal: Number(subtotal) || 0,
    });
    return res?.data || res;
  }
}
