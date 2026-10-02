import type { Voucher, VoucherValidationResult } from '../entities/voucher';

export interface CreateVoucherParams {
  code: string;
  title: string;
  desc: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface UpdateVoucherParams extends Partial<CreateVoucherParams> {
  id: string;
}

export interface VoucherRepository {
  getVouchers(): Promise<Voucher[]>;
  getVoucherById(id: string): Promise<Voucher | null>;
  createVoucher(params: CreateVoucherParams): Promise<Voucher>;
  updateVoucher(params: UpdateVoucherParams): Promise<Voucher>;
  deleteVoucher(id: string): Promise<boolean>;
  toggleVoucherStatus(id: string): Promise<Voucher>;
  validateVoucher(code: string, subtotal: number): Promise<VoucherValidationResult>;
}
