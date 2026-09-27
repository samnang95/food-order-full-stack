import { LoyaltyProfileEntity } from '../../../domain/rewards/entities/loyalty_profile_entity';

export class LoyaltyProfileModel {
  static fromJson(json) {
    if (!json) {
      return new LoyaltyProfileEntity({});
    }
    return new LoyaltyProfileEntity({
      userId: json.userId || 'guest',
      pointsBalance: json.pointsBalance ?? 480,
      lifetimePoints: json.lifetimePoints ?? 1480,
      streakDays: json.streakDays ?? 3,
      lastCheckInDate: json.lastCheckInDate || null,
      pointsHistory: Array.isArray(json.pointsHistory) ? json.pointsHistory : [],
      redeemedVouchers: Array.isArray(json.redeemedVouchers) ? json.redeemedVouchers : [],
    });
  }

  static toJson(entity) {
    if (!entity) return null;
    return {
      userId: entity.userId,
      pointsBalance: entity.pointsBalance,
      lifetimePoints: entity.lifetimePoints,
      streakDays: entity.streakDays,
      lastCheckInDate: entity.lastCheckInDate,
      pointsHistory: entity.pointsHistory,
      redeemedVouchers: entity.redeemedVouchers,
    };
  }
}
