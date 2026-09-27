/**
 * VIP Loyalty Tiers definition and calculation.
 */
export class RewardTierEntity {
  constructor({ id, name, icon, minPoints, multiplier, color, perks }) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.minPoints = minPoints;
    this.multiplier = multiplier;
    this.color = color;
    this.perks = perks;
  }

  static getTiers() {
    return [
      new RewardTierEntity({
        id: 'bronze',
        name: 'Bronze Foodie',
        icon: '🥉',
        minPoints: 0,
        multiplier: 1.0,
        color: 'from-amber-700 to-amber-900',
        perks: ['10 pts per $1 spent', 'Standard delivery support', 'Access to member deals'],
      }),
      new RewardTierEntity({
        id: 'silver',
        name: 'Silver Connoisseur',
        icon: '🥈',
        minPoints: 500,
        multiplier: 1.2,
        color: 'from-slate-400 to-slate-600',
        perks: ['1.2x points booster', '$2 birthday voucher', 'Priority kitchen queue'],
      }),
      new RewardTierEntity({
        id: 'gold',
        name: 'Gold Epicurean',
        icon: '🥇',
        minPoints: 1000,
        multiplier: 1.5,
        color: 'from-amber-400 to-amber-600',
        perks: ['1.5x points booster', 'Free artisan drink perk', 'Express courier priority'],
      }),
      new RewardTierEntity({
        id: 'platinum',
        name: 'Platinum VIP Chef',
        icon: '👑',
        minPoints: 2500,
        multiplier: 2.0,
        color: 'from-violet-500 to-purple-800',
        perks: ['2.0x points booster', 'Unlimited free delivery vouchers', 'Direct VIP concierge'],
      }),
    ];
  }

  static getTierForPoints(points = 0) {
    const tiers = RewardTierEntity.getTiers();
    let current = tiers[0];
    for (const tier of tiers) {
      if (points >= tier.minPoints) {
        current = tier;
      }
    }
    return current;
  }

  static getNextTier(points = 0) {
    const tiers = RewardTierEntity.getTiers();
    for (const tier of tiers) {
      if (points < tier.minPoints) {
        return tier;
      }
    }
    return null; // Top tier reached
  }
}
