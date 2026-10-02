import type { Voucher, VoucherType } from '../../../domain/vouchers/entities/voucher';

export interface ApiVoucherDto {
  code: string;
  title: string;
  desc?: string;
  description?: string;
  type: string;
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  isActive?: boolean;
}

export class VoucherModel {
  static fromApi(dto: ApiVoucherDto, index = 0): Voucher {
    return {
      id: `vchr_${dto.code.toLowerCase()}_${index}`,
      code: dto.code.toUpperCase(),
      title: dto.title || dto.code,
      desc: dto.desc || dto.description || 'Promotional coupon discount',
      type: (dto.type === 'percentage' ? 'percentage' : 'fixed') as VoucherType,
      value: Number(dto.value) || 0,
      minSpend: Number(dto.minSpend) || 0,
      maxDiscount: dto.maxDiscount ? Number(dto.maxDiscount) : undefined,
      usageLimit: 500,
      usedCount: Math.floor(Math.random() * 45) + 10,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdAt: new Date().toISOString(),
    };
  }

  static toLocalJson(voucher: Voucher): string {
    return JSON.stringify(voucher);
  }
}
