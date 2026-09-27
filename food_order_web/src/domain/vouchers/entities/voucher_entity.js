export class VoucherEntity {
  constructor({
    code = '',
    title = '',
    desc = '',
    type = 'fixed', // 'percentage' | 'fixed'
    value = 0,
    minSpend = 0,
    maxDiscount = null,
    validUntil = null,
    badge = '',
    category = 'ALL', // 'ALL' | 'DISCOUNT' | 'DELIVERY' | 'WELCOME' | 'FESTIVAL'
    terms = [],
    icon = '🎟️',
  } = {}) {
    this.code = (code || '').trim().toUpperCase();
    this.title = title;
    this.desc = desc;
    this.type = type;
    this.value = Number(value) || 0;
    this.minSpend = Number(minSpend) || 0;
    this.maxDiscount = maxDiscount !== null && maxDiscount !== undefined ? Number(maxDiscount) : null;
    this.validUntil = validUntil;
    this.badge = badge;
    this.category = category;
    this.terms = Array.isArray(terms) ? terms : [];
    this.icon = icon;
  }

  isEligible(subtotal = 0) {
    return Number(subtotal) >= this.minSpend;
  }

  amountNeeded(subtotal = 0) {
    return Math.max(0, Math.round((this.minSpend - Number(subtotal)) * 100) / 100);
  }

  calculateDiscount(subtotal = 0) {
    const numSubtotal = Number(subtotal) || 0;
    if (!this.isEligible(numSubtotal)) return 0;

    let discount;
    if (this.type === 'percentage') {
      discount = (numSubtotal * this.value) / 100;
      if (this.maxDiscount !== null && discount > this.maxDiscount) {
        discount = this.maxDiscount;
      }
    } else {
      discount = this.value;
    }

    discount = Math.min(discount, numSubtotal);
    return Math.round(discount * 100) / 100;
  }

  get formattedDiscountLabel() {
    if (this.code === 'FREESHIP' || this.category === 'DELIVERY') {
      return 'FREE DELIVERY';
    }
    if (this.type === 'percentage') {
      return `${this.value}% OFF`;
    }
    return `$${this.value.toFixed(2)} OFF`;
  }
}

export class VoucherValidationResult {
  constructor({
    valid = false,
    code = '',
    title = '',
    discountType = 'fixed',
    discountAmount = 0,
    finalSubtotal = 0,
    message = '',
    minSpend = 0,
  } = {}) {
    this.valid = Boolean(valid);
    this.code = code;
    this.title = title;
    this.discountType = discountType;
    this.discountAmount = Number(discountAmount) || 0;
    this.finalSubtotal = Number(finalSubtotal) || 0;
    this.message = message;
    this.minSpend = Number(minSpend) || 0;
  }
}
