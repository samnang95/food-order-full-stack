import { IVoucherRepository } from '../../../domain/vouchers/repositories/voucher_repository';
import { VoucherModel } from '../models/voucher_model';
import { VoucherRemoteDataSource } from '../datasources/voucher_remote_datasource';
import { LocalDB, DBKeys } from '../../../core/db';

export const DEFAULT_VOUCHER_SEEDS = [
  {
    code: 'WELCOME20',
    title: '20% OFF Welcome Bonus',
    desc: 'Enjoy 20% discount on your first BiteCraft feast',
    type: 'percentage',
    value: 20,
    minSpend: 10.0,
    maxDiscount: 8.0,
    validUntil: '2026-10-31T23:59:59Z',
    badge: 'NEW FOODIE',
    category: 'WELCOME',
    icon: '🎁',
    terms: [
      'Valid exclusively for first-time customers and registered foodies.',
      'Minimum meal subtotal of $10.00 required.',
      'Maximum discount capped at $8.00.',
      'Cannot be redeemed in conjunction with other promo codes.',
    ],
  },
  {
    code: 'FREESHIP',
    title: 'Free Delivery Voucher',
    desc: 'Zero delivery fee anywhere in Phnom Penh city center',
    type: 'fixed',
    value: 1.5,
    minSpend: 8.0,
    maxDiscount: 1.5,
    validUntil: '2026-10-31T23:59:59Z',
    badge: 'FREE DELIVERY',
    category: 'DELIVERY',
    icon: '🛵',
    terms: [
      'Covers standard delivery fee up to $1.50 (6,000 KHR).',
      'Minimum order amount of $8.00 before delivery fees.',
      'Applicable to all verified restaurant partners in Phnom Penh.',
    ],
  },
  {
    code: 'WELCOME10',
    title: '10% OFF Any Meal',
    desc: 'Get 10% off your entire order with no fuss',
    type: 'percentage',
    value: 10,
    minSpend: 5.0,
    maxDiscount: 5.0,
    validUntil: '2026-10-31T23:59:59Z',
    badge: 'POPULAR',
    category: 'DISCOUNT',
    icon: '🎟️',
    terms: [
      'Valid on breakfast, lunch, and dinner orders.',
      'Minimum basket spend of $5.00 required.',
      'Maximum discount capped at $5.00.',
    ],
  },
  {
    code: 'BITECRAFT2',
    title: '$2.00 Flat Discount',
    desc: 'Instant $2 savings on orders over $10',
    type: 'fixed',
    value: 2.0,
    minSpend: 10.0,
    maxDiscount: 2.0,
    validUntil: '2026-10-31T23:59:59Z',
    badge: 'EASY SAVE',
    category: 'DISCOUNT',
    icon: '⚡',
    terms: [
      'Flat $2.00 deducted from total bill.',
      'Minimum order subtotal of $10.00.',
      'Valid for delivery and takeaway orders.',
    ],
  },
  {
    code: 'KHNEWYEAR',
    title: '15% Festive Celebration',
    desc: 'Celebrate authentic Khmer flavors with 15% off',
    type: 'percentage',
    value: 15,
    minSpend: 12.0,
    maxDiscount: 6.0,
    validUntil: '2026-10-31T23:59:59Z',
    badge: 'SPECIAL',
    category: 'FESTIVAL',
    icon: '🎉',
    terms: [
      'Special community holiday discount.',
      'Valid on Khmer specialties, Asian bowls, and family bundles.',
      'Minimum order requirement of $12.00.',
      'Maximum discount value $6.00.',
    ],
  },
  {
    code: 'WEEKEND5',
    title: '$5.00 Weekend Feast',
    desc: 'Save $5 when sharing weekend feast meals with friends',
    type: 'fixed',
    value: 5.0,
    minSpend: 25.0,
    maxDiscount: 5.0,
    validUntil: '2026-10-31T23:59:59Z',
    badge: 'WEEKEND SPECIAL',
    category: 'DISCOUNT',
    icon: '🍔',
    terms: [
      'Designed for group feasts, burgers, and pizza bundles.',
      'Minimum order amount of $25.00.',
      'Flat $5.00 discount applied instantly.',
    ],
  },
];

export class VoucherRepositoryImpl extends IVoucherRepository {
  constructor(
    remoteDataSource = new VoucherRemoteDataSource(),
    localDb = LocalDB
  ) {
    super();
    this.remoteDataSource = remoteDataSource;
    this.localDb = localDb;
  }

  async getAvailableVouchers() {
    try {
      const rawApiList = await this.remoteDataSource.fetchVouchers();
      
      // Combine API items with seeds to ensure rich voucher experience
      const mergedMap = new Map();
      DEFAULT_VOUCHER_SEEDS.forEach((seed) => {
        mergedMap.set(seed.code.toUpperCase(), seed);
      });

      if (Array.isArray(rawApiList)) {
        rawApiList.forEach((apiItem) => {
          const code = (apiItem.code || '').trim().toUpperCase();
          if (code) {
            const existing = mergedMap.get(code) || {};
            mergedMap.set(code, {
              ...existing,
              ...apiItem,
              code,
            });
          }
        });
      }

      const mergedList = Array.from(mergedMap.values());
      this.localDb.setJSON(DBKeys.CACHED_VOUCHERS, mergedList);
      return mergedList.map((item) => VoucherModel.fromJson(item));
    } catch (error) {
      console.warn('⚠️ [VoucherRepo] API load failed, using local cache:', error.message);
      const cached = this.localDb.getJSON(DBKeys.CACHED_VOUCHERS, DEFAULT_VOUCHER_SEEDS);
      return cached.map((item) => VoucherModel.fromJson(item));
    }
  }

  async validateVoucher(code, subtotal = 0) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return VoucherModel.validationResultFromJson({
        valid: false,
        message: 'Please enter a voucher code',
      });
    }

    const numSubtotal = Number(subtotal) || 0;

    // 1. Try remote validation
    try {
      const res = await this.remoteDataSource.validateVoucher(cleanCode, numSubtotal);
      if (res?.valid) {
        return VoucherModel.validationResultFromJson(res);
      }
      if (res?.message && !res.valid) {
        return VoucherModel.validationResultFromJson({
          valid: false,
          code: cleanCode,
          message: res.message,
          minSpend: res.minSpend,
        });
      }
    } catch (err) {
      console.warn('⚠️ [VoucherRepo] Remote validation failed, using local check:', err.message);
    }

    // 2. Fallback to local evaluation
    const vouchers = await this.getAvailableVouchers();
    const match = vouchers.find((v) => v.code === cleanCode);

    if (!match) {
      return VoucherModel.validationResultFromJson({
        valid: false,
        code: cleanCode,
        message: `Voucher "${cleanCode}" is invalid or expired`,
      });
    }

    if (!match.isEligible(numSubtotal)) {
      const needed = match.amountNeeded(numSubtotal);
      return VoucherModel.validationResultFromJson({
        valid: false,
        code: match.code,
        minSpend: match.minSpend,
        message: `Minimum order of $${match.minSpend.toFixed(2)} required (add $${needed.toFixed(2)} more)`,
      });
    }

    const discountAmount = match.calculateDiscount(numSubtotal);
    const finalSubtotal = Math.max(0, Math.round((numSubtotal - discountAmount) * 100) / 100);

    return VoucherModel.validationResultFromJson({
      valid: true,
      code: match.code,
      title: match.title,
      discountType: match.type,
      discountAmount,
      finalSubtotal,
      message: `Voucher "${match.code}" applied! You saved $${discountAmount.toFixed(2)}`,
      minSpend: match.minSpend,
    });
  }
}
