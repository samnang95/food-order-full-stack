import { LocalDB } from '../../../core/db/local_db';
import { DBKeys } from '../../../core/db/db_keys';
import type { Voucher } from '../../../domain/vouchers/entities/voucher';

export class VoucherLocalDataSource {
  getVouchers(): Voucher[] {
    return LocalDB.getJson<Voucher[]>(DBKeys.CACHED_VOUCHERS, []) || [];
  }

  saveVouchers(vouchers: Voucher[]): void {
    LocalDB.setJson(DBKeys.CACHED_VOUCHERS, vouchers);
  }

  addVoucher(voucher: Voucher): Voucher[] {
    const list = this.getVouchers();
    const existingIndex = list.findIndex(v => v.id === voucher.id || v.code === voucher.code);
    if (existingIndex >= 0) {
      list[existingIndex] = voucher;
    } else {
      list.unshift(voucher);
    }
    this.saveVouchers(list);
    return list;
  }

  updateVoucher(voucher: Voucher): Voucher[] {
    const list = this.getVouchers();
    const index = list.findIndex(v => v.id === voucher.id);
    if (index >= 0) {
      list[index] = voucher;
      this.saveVouchers(list);
    }
    return list;
  }

  deleteVoucher(id: string): Voucher[] {
    const list = this.getVouchers().filter(v => v.id !== id);
    this.saveVouchers(list);
    return list;
  }
}
