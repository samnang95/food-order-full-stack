import { ApiClient } from './api_client';

export const FALLBACK_VOUCHERS = [
  {
    code: 'WELCOME10',
    title: '10% OFF',
    desc: '10% off your entire meal order',
    type: 'percentage',
    value: 10,
    minSpend: 5.0,
    maxDiscount: 5.0,
  },
  {
    code: 'FREESHIP',
    title: 'FREE DELIVERY',
    desc: '$1.50 discount on delivery fee',
    type: 'fixed',
    value: 1.5,
    minSpend: 8.0,
    maxDiscount: 1.5,
  },
  {
    code: 'BITECRAFT2',
    title: '$2.00 OFF',
    desc: 'Flat $2 off orders over $10',
    type: 'fixed',
    value: 2.0,
    minSpend: 10.0,
    maxDiscount: 2.0,
  },
  {
    code: 'KHNEWYEAR',
    title: '15% OFF SPECIAL',
    desc: '15% celebration discount up to $6',
    type: 'percentage',
    value: 15,
    minSpend: 12.0,
    maxDiscount: 6.0,
  },
  {
    code: 'WELCOME20',
    title: '20% OFF FIRST ORDER',
    desc: '20% off for newly registered foodies',
    type: 'percentage',
    value: 20,
    minSpend: 10.0,
    maxDiscount: 8.0,
  },
];

export const VoucherService = {
  /**
   * Fetch available promo vouchers from API or fallback
   */
  async getAvailableVouchers() {
    try {
      const response = await ApiClient.get('/vouchers');
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      return FALLBACK_VOUCHERS;
    } catch (err) {
      console.warn('Falling back to local vouchers:', err.message);
      return FALLBACK_VOUCHERS;
    }
  },

  /**
   * Validate voucher with subtotal
   */
  async validateVoucher(code, subtotal = 0) {
    if (!code || typeof code !== 'string') {
      return { valid: false, message: 'Please enter a voucher code' };
    }

    const cleanCode = code.trim().toUpperCase();

    try {
      const response = await ApiClient.post('/vouchers/validate', {
        code: cleanCode,
        subtotal: Number(subtotal) || 0,
      });

      if (response?.data?.valid) {
        return {
          valid: true,
          ...response.data,
        };
      }
    } catch (err) {
      console.warn('API voucher validation failed, trying fallback:', err.message);
    }

    // Local fallback validation
    const voucher = FALLBACK_VOUCHERS.find((v) => v.code === cleanCode);
    if (!voucher) {
      return { valid: false, message: `Voucher "${cleanCode}" is invalid or expired` };
    }

    const numericSubtotal = Number(subtotal) || 0;
    if (numericSubtotal < voucher.minSpend) {
      return {
        valid: false,
        code: voucher.code,
        message: `Minimum order of $${voucher.minSpend.toFixed(2)} required for this voucher (current: $${numericSubtotal.toFixed(2)})`,
        minSpend: voucher.minSpend,
      };
    }

    let calculatedDiscount =
      voucher.type === 'percentage'
        ? (numericSubtotal * voucher.value) / 100
        : voucher.value;

    if (voucher.type === 'percentage' && voucher.maxDiscount && calculatedDiscount > voucher.maxDiscount) {
      calculatedDiscount = voucher.maxDiscount;
    }

    calculatedDiscount = Math.min(calculatedDiscount, numericSubtotal);
    const finalDiscount = Math.round(calculatedDiscount * 100) / 100;

    return {
      valid: true,
      code: voucher.code,
      title: voucher.title,
      discountType: voucher.type,
      discountAmount: finalDiscount,
      finalSubtotal: Math.max(0, Math.round((numericSubtotal - finalDiscount) * 100) / 100),
      message: `Voucher "${voucher.code}" applied! You saved $${finalDiscount.toFixed(2)}`,
    };
  },
};
