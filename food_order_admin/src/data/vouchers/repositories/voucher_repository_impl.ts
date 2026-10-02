import type {
  VoucherRepository,
  CreateVoucherParams,
  UpdateVoucherParams,
} from '../../../domain/vouchers/repositories/voucher_repository';
import type { Voucher, VoucherValidationResult } from '../../../domain/vouchers/entities/voucher';
import { VoucherRemoteDataSource } from '../datasources/voucher_remote_datasource';
import { VoucherLocalDataSource } from '../datasources/voucher_local_datasource';
import { VoucherModel } from '../models/voucher_model';

const DEFAULT_SEED_VOUCHERS: Voucher[] = [
  {
    id: 'vchr_welcome10_0',
    code: 'WELCOME10',
    title: '10% OFF Welcome Meal',
    desc: '10% off your entire first order over $5',
    type: 'percentage',
    value: 10,
    minSpend: 5.0,
    maxDiscount: 5.0,
    usageLimit: 1000,
    usedCount: 142,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vchr_freeship_1',
    code: 'FREESHIP',
    title: 'FREE DELIVERY',
    desc: '$1.50 discount on delivery fee for orders over $8',
    type: 'fixed',
    value: 1.5,
    minSpend: 8.0,
    maxDiscount: 1.5,
    usageLimit: 500,
    usedCount: 89,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vchr_bitecraft2_2',
    code: 'BITECRAFT2',
    title: '$2.00 OFF Lunch Deal',
    desc: 'Flat $2 off orders over $10',
    type: 'fixed',
    value: 2.0,
    minSpend: 10.0,
    maxDiscount: 2.0,
    usageLimit: 300,
    usedCount: 215,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vchr_khnewyear_3',
    code: 'KHNEWYEAR',
    title: '15% OFF Holiday Feast',
    desc: '15% celebration discount up to $6 on orders over $12',
    type: 'percentage',
    value: 15,
    minSpend: 12.0,
    maxDiscount: 6.0,
    usageLimit: 250,
    usedCount: 68,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vchr_vip25_4',
    code: 'VIPDINER25',
    title: '25% OFF VIP Feast',
    desc: 'Exclusive 25% discount for loyalty members on orders over $25',
    type: 'percentage',
    value: 25,
    minSpend: 25.0,
    maxDiscount: 10.0,
    usageLimit: 100,
    usedCount: 42,
    isActive: false,
    createdAt: new Date().toISOString(),
  },
];

export class VoucherRepositoryImpl implements VoucherRepository {
  constructor(
    private readonly remoteDataSource = new VoucherRemoteDataSource(),
    private readonly localDataSource = new VoucherLocalDataSource()
  ) {}

  async getVouchers(): Promise<Voucher[]> {
    let localVouchers = this.localDataSource.getVouchers();

    try {
      const remoteDtos = await this.remoteDataSource.getVouchers();
      if (remoteDtos.length > 0) {
        // Merge remote items with local items
        const remoteVouchers = remoteDtos.map((dto, idx) => VoucherModel.fromApi(dto, idx));

        // Keep local overrides/additions
        const codeMap = new Map<string, Voucher>();
        remoteVouchers.forEach(v => codeMap.set(v.code, v));
        localVouchers.forEach(v => codeMap.set(v.code, v));

        const merged = Array.from(codeMap.values());
        this.localDataSource.saveVouchers(merged);
        return merged;
      }
    } catch (err) {
      console.warn('[VoucherRepository] Could not fetch remote vouchers, using cached/seed:', err);
    }

    if (localVouchers.length === 0) {
      localVouchers = [...DEFAULT_SEED_VOUCHERS];
      this.localDataSource.saveVouchers(localVouchers);
    }

    return localVouchers;
  }

  async getVoucherById(id: string): Promise<Voucher | null> {
    const vouchers = await this.getVouchers();
    return vouchers.find(v => v.id === id) || null;
  }

  async createVoucher(params: CreateVoucherParams): Promise<Voucher> {
    const newVoucher: Voucher = {
      id: `vchr_${params.code.toLowerCase()}_${Date.now()}`,
      code: params.code.trim().toUpperCase(),
      title: params.title.trim(),
      desc: params.desc.trim(),
      type: params.type,
      value: params.value,
      minSpend: params.minSpend,
      maxDiscount: params.maxDiscount,
      usageLimit: params.usageLimit || 500,
      usedCount: 0,
      startDate: params.startDate,
      endDate: params.endDate,
      isActive: params.isActive !== undefined ? params.isActive : true,
      createdAt: new Date().toISOString(),
    };

    this.localDataSource.addVoucher(newVoucher);
    return newVoucher;
  }

  async updateVoucher(params: UpdateVoucherParams): Promise<Voucher> {
    const existing = await this.getVoucherById(params.id);
    if (!existing) {
      throw new Error(`Voucher with ID ${params.id} not found`);
    }

    const updated: Voucher = {
      ...existing,
      ...params,
      code: params.code ? params.code.trim().toUpperCase() : existing.code,
    };

    this.localDataSource.updateVoucher(updated);
    return updated;
  }

  async deleteVoucher(id: string): Promise<boolean> {
    this.localDataSource.deleteVoucher(id);
    return true;
  }

  async toggleVoucherStatus(id: string): Promise<Voucher> {
    const existing = await this.getVoucherById(id);
    if (!existing) {
      throw new Error(`Voucher with ID ${id} not found`);
    }

    const updated: Voucher = {
      ...existing,
      isActive: !existing.isActive,
    };

    this.localDataSource.updateVoucher(updated);
    return updated;
  }

  async validateVoucher(code: string, subtotal: number): Promise<VoucherValidationResult> {
    // First try remote validation
    const remoteResult = await this.remoteDataSource.validateVoucher(code, subtotal);
    if (remoteResult.valid) {
      return remoteResult;
    }

    // If remote fails or item is in local storage:
    const vouchers = await this.getVouchers();
    const cleanCode = code.trim().toUpperCase();
    const found = vouchers.find(v => v.code === cleanCode);

    if (!found) {
      return { valid: false, message: `Voucher "${cleanCode}" not found or expired.` };
    }

    if (!found.isActive) {
      return { valid: false, message: `Voucher "${cleanCode}" is currently inactive.` };
    }

    if (subtotal < found.minSpend) {
      return {
        valid: false,
        code: found.code,
        minSpend: found.minSpend,
        message: `Minimum spend of $${found.minSpend.toFixed(2)} required (current: $${subtotal.toFixed(2)}).`,
      };
    }

    let discountAmount = 0;
    if (found.type === 'percentage') {
      discountAmount = (subtotal * found.value) / 100;
      if (found.maxDiscount && discountAmount > found.maxDiscount) {
        discountAmount = found.maxDiscount;
      }
    } else {
      discountAmount = found.value;
    }

    discountAmount = Math.min(discountAmount, subtotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      valid: true,
      code: found.code,
      title: found.title,
      discountType: found.type,
      discountAmount,
      finalSubtotal: Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100),
      message: `Voucher "${found.code}" applied! You saved $${discountAmount.toFixed(2)}`,
    };
  }
}
