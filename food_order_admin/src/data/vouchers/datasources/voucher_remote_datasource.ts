import { apiClient } from '../../../core/services/api_client';
import type { ApiVoucherDto } from '../models/voucher_model';
import type { VoucherValidationResult } from '../../../domain/vouchers/entities/voucher';

export interface ApiVoucherResponse {
  status: string;
  data: ApiVoucherDto[];
}

export interface ApiValidationResponse {
  status: string;
  data?: {
    valid: boolean;
    code: string;
    title: string;
    discountType: 'percentage' | 'fixed';
    discountAmount: number;
    finalSubtotal: number;
    message: string;
  };
  message?: string;
  minSpend?: number;
}

export class VoucherRemoteDataSource {
  async getVouchers(): Promise<ApiVoucherDto[]> {
    const res = await apiClient.get<ApiVoucherResponse>('/vouchers');
    return res.data?.data || [];
  }

  async validateVoucher(code: string, subtotal: number): Promise<VoucherValidationResult> {
    try {
      const res = await apiClient.post<ApiValidationResponse>('/vouchers/validate', {
        code,
        subtotal,
      });

      if (res.data?.data) {
        const d = res.data.data;
        return {
          valid: d.valid,
          code: d.code,
          title: d.title,
          discountType: d.discountType,
          discountAmount: d.discountAmount,
          finalSubtotal: d.finalSubtotal,
          message: d.message,
        };
      }

      return {
        valid: false,
        message: 'Could not validate voucher',
      };
    } catch (err: unknown) {
      const respData = (err as { response?: { data?: ApiValidationResponse } })?.response?.data;
      return {
        valid: false,
        message: respData?.message || 'Voucher validation failed or voucher is invalid',
        minSpend: respData?.minSpend,
      };
    }
  }
}
