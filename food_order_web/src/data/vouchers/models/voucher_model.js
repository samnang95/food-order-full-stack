import { VoucherEntity, VoucherValidationResult } from '../../../domain/vouchers/entities/voucher_entity';

export class VoucherModel {
  static fromJson(json = {}) {
    const code = (json.code || '').trim().toUpperCase();
    
    // Assign sensible metadata defaults for badges, icons, and terms if not explicitly present
    let icon = json.icon || '🎟️';
    let badge = json.badge || '';
    let category = json.category || 'ALL';

    if (code === 'FREESHIP') {
      icon = '🛵';
      badge = 'POPULAR';
      category = 'DELIVERY';
    } else if (code.startsWith('WELCOME') || code.includes('FIRST')) {
      icon = '🎁';
      badge = 'NEW FOODIE';
      category = 'WELCOME';
    } else if (code.includes('NEWYEAR') || code.includes('KH')) {
      icon = '🎉';
      badge = 'FESTIVAL';
      category = 'FESTIVAL';
    } else if (Number(json.value) >= 15 || Number(json.value) >= 5) {
      icon = '🔥';
      badge = 'HOT DEAL';
      category = 'DISCOUNT';
    }

    const defaultTerms = [
      `Valid on all participating BiteCraft restaurant orders in Phnom Penh.`,
      `Minimum spend of $${(Number(json.minSpend) || 0).toFixed(2)} required before taxes and tips.`,
      json.maxDiscount ? `Maximum promotional discount capped at $${Number(json.maxDiscount).toFixed(2)}.` : null,
      `Limit one voucher redemption per order. Cannot be combined with other promo codes.`,
      `Subject to BiteCraft fair use policy and restaurant operating hours.`,
    ].filter(Boolean);

    return new VoucherEntity({
      code,
      title: json.title || `${json.value || 0}${json.type === 'percentage' ? '%' : '$'} OFF`,
      desc: json.desc || `Save on orders over $${Number(json.minSpend || 0).toFixed(2)}`,
      type: json.type === 'percentage' ? 'percentage' : 'fixed',
      value: Number(json.value) || 0,
      minSpend: Number(json.minSpend) || 0,
      maxDiscount: json.maxDiscount !== null && json.maxDiscount !== undefined ? Number(json.maxDiscount) : null,
      validUntil: json.validUntil || '2026-10-31T23:59:59Z',
      badge: json.badge || badge,
      category: json.category || category,
      terms: Array.isArray(json.terms) && json.terms.length > 0 ? json.terms : defaultTerms,
      icon: json.icon || icon,
    });
  }

  static toJson(entity) {
    return {
      code: entity.code,
      title: entity.title,
      desc: entity.desc,
      type: entity.type,
      value: entity.value,
      minSpend: entity.minSpend,
      maxDiscount: entity.maxDiscount,
      validUntil: entity.validUntil,
      badge: entity.badge,
      category: entity.category,
      terms: entity.terms,
      icon: entity.icon,
    };
  }

  static validationResultFromJson(json = {}) {
    return new VoucherValidationResult({
      valid: Boolean(json.valid),
      code: json.code || '',
      title: json.title || '',
      discountType: json.discountType || 'fixed',
      discountAmount: Number(json.discountAmount) || 0,
      finalSubtotal: Number(json.finalSubtotal) || 0,
      message: json.message || '',
      minSpend: Number(json.minSpend) || 0,
    });
  }
}
