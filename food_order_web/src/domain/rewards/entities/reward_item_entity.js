/**
 * Domain entity for redeemable BitePoints reward items.
 */
export class RewardItemEntity {
  constructor({
    id,
    title,
    description,
    pointsCost,
    discountValue,
    discountType = 'fixed', // 'fixed' | 'percent' | 'free_delivery'
    minOrder = 0,
    code,
    icon = '🎁',
    badge = 'HOT',
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.pointsCost = pointsCost;
    this.discountValue = discountValue;
    this.discountType = discountType;
    this.minOrder = minOrder;
    this.code = code;
    this.icon = icon;
    this.badge = badge;
  }

  static getDefaultCatalog() {
    return [
      new RewardItemEntity({
        id: 'rew_2usd',
        title: '$2 Instant Voucher',
        description: 'Take $2 off any order above $10 across Phnom Penh',
        pointsCost: 200,
        discountValue: 2,
        discountType: 'fixed',
        minOrder: 10,
        code: 'BITE2OFF',
        icon: '💵',
        badge: 'POPULAR',
      }),
      new RewardItemEntity({
        id: 'rew_freedel',
        title: 'Free Express Delivery',
        description: '100% off delivery fee up to 5km',
        pointsCost: 300,
        discountValue: 1.5,
        discountType: 'free_delivery',
        minOrder: 8,
        code: 'BITEDELIV',
        icon: '🛵',
        badge: 'BEST VALUE',
      }),
      new RewardItemEntity({
        id: 'rew_5usd',
        title: '$5 Gourmet Feast Pass',
        description: '$5 off your total order of $25 or more',
        pointsCost: 500,
        discountValue: 5,
        discountType: 'fixed',
        minOrder: 25,
        code: 'BITE5OFF',
        icon: '🍔',
        badge: 'SAVINGS',
      }),
      new RewardItemEntity({
        id: 'rew_15pct',
        title: '15% Off Total Bill',
        description: 'Enjoy 15% discount on all artisan smash burgers and bowls',
        pointsCost: 750,
        discountValue: 15,
        discountType: 'percent',
        minOrder: 20,
        code: 'BITE15PCT',
        icon: '🍕',
        badge: 'VIP PERK',
      }),
      new RewardItemEntity({
        id: 'rew_10usd',
        title: '$10 Platinum VIP Voucher',
        description: '$10 instant credit for true food connoisseurs',
        pointsCost: 1000,
        discountValue: 10,
        discountType: 'fixed',
        minOrder: 35,
        code: 'BITE10VIP',
        icon: '👑',
        badge: 'EXCLUSIVE',
      }),
    ];
  }
}
