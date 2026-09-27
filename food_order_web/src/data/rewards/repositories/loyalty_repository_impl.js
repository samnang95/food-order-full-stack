import { LoyaltyRepository } from '../../../domain/rewards/repositories/loyalty_repository';
import { LoyaltyLocalDataSource } from '../datasources/loyalty_local_datasource';
import { LoyaltyProfileEntity } from '../../../domain/rewards/entities/loyalty_profile_entity';
import { RewardTierEntity } from '../../../domain/rewards/entities/reward_tier_entity';

export class LoyaltyRepositoryImpl extends LoyaltyRepository {
  constructor(localDataSource = new LoyaltyLocalDataSource()) {
    super();
    this.localDataSource = localDataSource;
  }

  async getProfile() {
    return this.localDataSource.getProfile();
  }

  async claimDailyCheckIn() {
    const profile = this.localDataSource.getProfile();
    const todayStr = new Date().toISOString().split('T')[0];

    if (profile.lastCheckInDate === todayStr) {
      return profile; // already claimed today
    }

    const newStreak = (profile.streakDays % 7) + 1;
    // 7th day is a jackpot 100 pts bonus! Other days are 50 pts
    const earnedPoints = newStreak === 7 ? 100 : 50;

    const newBalance = profile.pointsBalance + earnedPoints;
    const newLifetime = profile.lifetimePoints + earnedPoints;

    const newHistoryItem = {
      id: `tx_${Date.now()}`,
      title: `Day ${newStreak} Streak Daily Bonus ${newStreak === 7 ? '🎉' : '🪙'}`,
      points: earnedPoints,
      type: 'earned',
      date: new Date().toISOString(),
    };

    const updated = new LoyaltyProfileEntity({
      userId: profile.userId,
      pointsBalance: newBalance,
      lifetimePoints: newLifetime,
      streakDays: newStreak,
      lastCheckInDate: todayStr,
      pointsHistory: [newHistoryItem, ...profile.pointsHistory],
      redeemedVouchers: profile.redeemedVouchers,
    });

    this.localDataSource.saveProfile(updated);
    return updated;
  }

  async redeemReward(reward) {
    const profile = this.localDataSource.getProfile();

    if (profile.pointsBalance < reward.pointsCost) {
      throw new Error(`Insufficient BitePoints. You have ${profile.pointsBalance} pts, but this reward costs ${reward.pointsCost} pts.`);
    }

    const newBalance = profile.pointsBalance - reward.pointsCost;

    const voucherInstance = {
      instanceId: `vch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      rewardId: reward.id,
      title: reward.title,
      description: reward.description,
      discountValue: reward.discountValue,
      discountType: reward.discountType,
      minOrder: reward.minOrder,
      code: `${reward.code}-${Math.floor(1000 + Math.random() * 9000)}`,
      icon: reward.icon,
      pointsCost: reward.pointsCost,
      redeemedAt: new Date().toISOString(),
      isUsed: false,
    };

    const newHistoryItem = {
      id: `tx_${Date.now()}`,
      title: `Redeemed ${reward.title}`,
      points: -reward.pointsCost,
      type: 'redeemed',
      date: new Date().toISOString(),
    };

    const updated = new LoyaltyProfileEntity({
      userId: profile.userId,
      pointsBalance: newBalance,
      lifetimePoints: profile.lifetimePoints,
      streakDays: profile.streakDays,
      lastCheckInDate: profile.lastCheckInDate,
      pointsHistory: [newHistoryItem, ...profile.pointsHistory],
      redeemedVouchers: [voucherInstance, ...profile.redeemedVouchers],
    });

    this.localDataSource.saveProfile(updated);
    return { profile: updated, voucher: voucherInstance };
  }

  async earnPointsFromOrder(orderId, orderAmount) {
    const profile = this.localDataSource.getProfile();
    const tier = RewardTierEntity.getTierForPoints(profile.lifetimePoints);

    // Baseline: 10 points per dollar * tier multiplier
    const earnedPoints = Math.max(10, Math.round(Number(orderAmount || 0) * 10 * tier.multiplier));

    const shortId = orderId ? String(orderId).slice(-6).toUpperCase() : 'ORDER';
    const newHistoryItem = {
      id: `tx_${Date.now()}`,
      title: `Earned from Order #${shortId} (${tier.multiplier}x ${tier.name})`,
      points: earnedPoints,
      type: 'earned',
      date: new Date().toISOString(),
    };

    const updated = new LoyaltyProfileEntity({
      userId: profile.userId,
      pointsBalance: profile.pointsBalance + earnedPoints,
      lifetimePoints: profile.lifetimePoints + earnedPoints,
      streakDays: profile.streakDays,
      lastCheckInDate: profile.lastCheckInDate,
      pointsHistory: [newHistoryItem, ...profile.pointsHistory],
      redeemedVouchers: profile.redeemedVouchers,
    });

    this.localDataSource.saveProfile(updated);
    return updated;
  }
}
