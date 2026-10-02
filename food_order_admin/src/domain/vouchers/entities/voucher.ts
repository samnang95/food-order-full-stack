export type VoucherType = 'percentage' | 'fixed';

export interface Voucher {
  id: string;
  code: string;
  title: string;
  desc: string;
  type: VoucherType;
  value: number;
  minSpend: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface VoucherValidationResult {
  valid: boolean;
  code?: string;
  title?: string;
  discountType?: VoucherType;
  discountAmount?: number;
  finalSubtotal?: number;
  message: string;
  minSpend?: number;
}
