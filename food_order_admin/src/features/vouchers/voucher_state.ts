import type { Voucher, VoucherValidationResult } from '../../domain/vouchers/entities/voucher';

export interface VoucherState {
  vouchers: Voucher[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  typeFilter: 'all' | 'percentage' | 'fixed';
  statusFilter: 'all' | 'active' | 'inactive';
  isModalOpen: boolean;
  editingVoucher: Voucher | null;
  validationSubtotal: number;
  validationCode: string;
  validationResult: VoucherValidationResult | null;
  isValidating: boolean;
  copiedCode: string | null;
}

export const initialVoucherState: VoucherState = {
  vouchers: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  typeFilter: 'all',
  statusFilter: 'all',
  isModalOpen: false,
  editingVoucher: null,
  validationSubtotal: 25.0,
  validationCode: 'WELCOME10',
  validationResult: null,
  isValidating: false,
  copiedCode: null,
};
