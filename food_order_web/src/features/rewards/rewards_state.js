import { RewardItemEntity } from '../../domain/rewards/entities/reward_item_entity';
import { RewardTierEntity } from '../../domain/rewards/entities/reward_tier_entity';

export const initialRewardsState = {
  pointsBalance: 480,
  lifetimePoints: 1480,
  streakDays: 3,
  lastCheckInDate: null,
  currentTier: RewardTierEntity.getTierForPoints(1480),
  nextTier: RewardTierEntity.getNextTier(1480),
  progressToNextTier: 48,
  hasCheckedInToday: false,
  catalog: RewardItemEntity.getDefaultCatalog(),
  pointsHistory: [],
  redeemedVouchers: [],
  activeVoucher: null, // Voucher currently applied to Cart / Checkout
  isOpenModal: false,
  isLoading: false,
  error: null,
  streakClaimSuccess: false,
  redeemSuccessVoucher: null,
};
