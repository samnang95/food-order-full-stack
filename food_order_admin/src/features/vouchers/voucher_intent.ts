import type { CreateVoucherParams, UpdateVoucherParams } from '../../domain/vouchers/repositories/voucher_repository';
import type { Voucher } from '../../domain/vouchers/entities/voucher';

export type VoucherIntent =
  | { type: 'LOAD_VOUCHERS' }
  | { type: 'CREATE_VOUCHER'; payload: CreateVoucherParams }
  | { type: 'UPDATE_VOUCHER'; payload: UpdateVoucherParams }
  | { type: 'DELETE_VOUCHER'; payload: string }
  | { type: 'TOGGLE_STATUS'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_TYPE_FILTER'; payload: 'all' | 'percentage' | 'fixed' }
  | { type: 'SET_STATUS_FILTER'; payload: 'all' | 'active' | 'inactive' }
  | { type: 'OPEN_CREATE_MODAL' }
  | { type: 'OPEN_EDIT_MODAL'; payload: Voucher }
  | { type: 'CLOSE_MODAL' }
  | { type: 'VALIDATE_VOUCHER'; payload: { code: string; subtotal: number } }
  | { type: 'COPY_CODE'; payload: string }
  | { type: 'CLEAR_ERROR' };
