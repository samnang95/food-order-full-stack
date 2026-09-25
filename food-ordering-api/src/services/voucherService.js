/**
 * Pre-configured promotional vouchers for BiteCraft
 */
const VOUCHERS = [
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
    value: 1.50,
    minSpend: 8.0,
    maxDiscount: 1.50,
  },
  {
    code: 'BITECRAFT2',
    title: '$2.00 OFF',
    desc: 'Flat $2 off orders over $10',
    type: 'fixed',
    value: 2.00,
    minSpend: 10.0,
    maxDiscount: 2.00,
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
];

const voucherService = {
  /**
   * Return list of available vouchers for customers to view
   */
  getAvailableVouchers: () => {
    return VOUCHERS.map(v => ({
      code: v.code,
      title: v.title,
      desc: v.desc,
      minSpend: v.minSpend,
      type: v.type,
      value: v.value,
    }));
  },

  /**
   * Validate and calculate discount for a given voucher code and subtotal
   */
  validateVoucher: (code, subtotal = 0) => {
    if (!code || typeof code !== 'string') {
      return { valid: false, message: 'Please enter a voucher code' };
    }

    const cleanCode = code.trim().toUpperCase();
    const voucher = VOUCHERS.find(v => v.code === cleanCode);

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

    let discountAmount = 0;
    if (voucher.type === 'percentage') {
      discountAmount = (numericSubtotal * voucher.value) / 100;
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else {
      discountAmount = voucher.value;
    }

    // Ensure discount does not exceed subtotal
    discountAmount = Math.min(discountAmount, numericSubtotal);
    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      valid: true,
      code: voucher.code,
      title: voucher.title,
      discountType: voucher.type,
      discountAmount,
      finalSubtotal: Math.max(0, Math.round((numericSubtotal - discountAmount) * 100) / 100),
      message: `Voucher "${voucher.code}" applied! You saved $${discountAmount.toFixed(2)}`,
    };
  },
};

module.exports = voucherService;
