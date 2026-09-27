import { RewardTierEntity } from './reward_tier_entity';

export class LoyaltyProfileEntity {
  constructor({
    userId = 'guest',
    pointsBalance = 480,
    lifetimePoints = 1480,
    streakDays = 3,
    lastCheckInDate = null,
    pointsHistory = [],
    redeemedVouchers = [],
  }) {
    this.userId = userId;
    this.pointsBalance = Number(pointsBalance) || 0;
    this.lifetimePoints = Number(lifetimePoints) || 0;
    this.streakDays = Number(streakDays) || 0;
    this.lastCheckInDate = lastCheckInDate;
    this.pointsHistory = Array.isArray(pointsHistory) ? pointsHistory : [];
    this.redeemedVouchers = Array.isArray(redeemedVouchers) ? redeemedVouchers : [];
    this.currentTier = RewardTierEntity.getTierForPoints(this.lifetimePoints);
    this.nextTier = RewardTierEntity.getNextTier(this.lifetimePoints);
  }

  get progressToNextTier() {
    if (!this.nextTier) return 100;
    const currentMin = this.currentTier.minPoints;
    const nextMin = this.nextTier.minPoints;
    const earnedInCurrentTier = this.lifetimePoints - currentMin;
    const totalNeededInCurrentTier = nextMin - currentMin;
    return Math.min(100, Math.round((earnedInCurrentTier / totalNeededInCurrentTier) * 100));
  }

  get hasCheckedInToday() {
    if (!this.lastCheckInDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return this.lastCheckInDate === todayStr;
  }
}
