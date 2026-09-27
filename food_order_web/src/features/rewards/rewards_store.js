import { useReducer, useEffect, useCallback } from 'react';
import { initialRewardsState } from './rewards_state';
import { RewardsIntentType, RewardsIntent } from './rewards_intent';
import { container } from '../../core/di/container';
import { RewardTierEntity } from '../../domain/rewards/entities/reward_tier_entity';

export function rewardsReducer(state, action) {
  switch (action.type) {
    case RewardsIntentType.OPEN_MODAL:
      return { ...state, isOpenModal: true, error: null };

    case RewardsIntentType.CLOSE_MODAL:
      return {
        ...state,
        isOpenModal: false,
        streakClaimSuccess: false,
        redeemSuccessVoucher: null,
      };

    case RewardsIntentType.TOGGLE_MODAL:
      return { ...state, isOpenModal: !state.isOpenModal };

    case RewardsIntentType.LOAD_PROFILE_START:
      return { ...state, isLoading: true, error: null };

    case RewardsIntentType.LOAD_PROFILE_SUCCESS: {
      const p = action.payload;
      if (!p) return state;
      const currentTier = RewardTierEntity.getTierForPoints(p.lifetimePoints);
      const nextTier = RewardTierEntity.getNextTier(p.lifetimePoints);

      return {
        ...state,
        pointsBalance: p.pointsBalance,
        lifetimePoints: p.lifetimePoints,
        streakDays: p.streakDays,
        lastCheckInDate: p.lastCheckInDate,
        currentTier,
        nextTier,
        progressToNextTier: p.progressToNextTier,
        hasCheckedInToday: p.hasCheckedInToday,
        pointsHistory: p.pointsHistory,
        redeemedVouchers: p.redeemedVouchers,
        isLoading: false,
        error: null,
      };
    }

    case RewardsIntentType.LOAD_PROFILE_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case RewardsIntentType.CLAIM_CHECKIN_START:
      return { ...state, isLoading: true, error: null };

    case RewardsIntentType.CLAIM_CHECKIN_SUCCESS: {
      const p = action.payload;
      const currentTier = RewardTierEntity.getTierForPoints(p.lifetimePoints);
      const nextTier = RewardTierEntity.getNextTier(p.lifetimePoints);

      return {
        ...state,
        pointsBalance: p.pointsBalance,
        lifetimePoints: p.lifetimePoints,
        streakDays: p.streakDays,
        lastCheckInDate: p.lastCheckInDate,
        currentTier,
        nextTier,
        progressToNextTier: p.progressToNextTier,
        hasCheckedInToday: true,
        pointsHistory: p.pointsHistory,
        streakClaimSuccess: true,
        isLoading: false,
      };
    }

    case RewardsIntentType.CLAIM_CHECKIN_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case RewardsIntentType.REDEEM_REWARD_START:
      return { ...state, isLoading: true, error: null };

    case RewardsIntentType.REDEEM_REWARD_SUCCESS: {
      const { profile: p, voucher } = action.payload;
      const currentTier = RewardTierEntity.getTierForPoints(p.lifetimePoints);
      const nextTier = RewardTierEntity.getNextTier(p.lifetimePoints);

      return {
        ...state,
        pointsBalance: p.pointsBalance,
        lifetimePoints: p.lifetimePoints,
        currentTier,
        nextTier,
        progressToNextTier: p.progressToNextTier,
        pointsHistory: p.pointsHistory,
        redeemedVouchers: p.redeemedVouchers,
        redeemSuccessVoucher: voucher,
        isLoading: false,
      };
    }

    case RewardsIntentType.REDEEM_REWARD_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case RewardsIntentType.APPLY_VOUCHER_TO_CHECKOUT:
      return { ...state, activeVoucher: action.payload };

    case RewardsIntentType.REMOVE_ACTIVE_VOUCHER:
      return { ...state, activeVoucher: null };

    case RewardsIntentType.EARN_POINTS_SUCCESS: {
      const p = action.payload;
      if (!p) return state;
      const currentTier = RewardTierEntity.getTierForPoints(p.lifetimePoints);
      const nextTier = RewardTierEntity.getNextTier(p.lifetimePoints);

      return {
        ...state,
        pointsBalance: p.pointsBalance,
        lifetimePoints: p.lifetimePoints,
        currentTier,
        nextTier,
        progressToNextTier: p.progressToNextTier,
        pointsHistory: p.pointsHistory,
      };
    }

    case RewardsIntentType.RESET_FEEDBACK:
      return {
        ...state,
        streakClaimSuccess: false,
        redeemSuccessVoucher: null,
        error: null,
      };

    default:
      return state;
  }
}

export function useRewardsStore() {
  const [state, dispatch] = useReducer(rewardsReducer, initialRewardsState);

  // Load loyalty profile via Clean Architecture Use Case on mount
  const refreshProfile = useCallback(async () => {
    try {
      dispatch(RewardsIntent.loadProfileStart());
      const profile = await container.getLoyaltyProfileUseCase.execute();
      dispatch(RewardsIntent.loadProfileSuccess(profile));
    } catch (err) {
      console.error('Failed to load loyalty profile:', err);
      dispatch(RewardsIntent.loadProfileFailure(err.message));
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Claim Daily Streak
  const claimDailyCheckIn = useCallback(async () => {
    try {
      dispatch(RewardsIntent.claimCheckInStart());
      const updated = await container.claimDailyCheckInUseCase.execute();
      dispatch(RewardsIntent.claimCheckInSuccess(updated));
    } catch (err) {
      console.error('Failed to claim daily check-in:', err);
      dispatch(RewardsIntent.claimCheckInFailure(err.message));
    }
  }, []);

  // Redeem Reward
  const redeemReward = useCallback(async (reward) => {
    try {
      dispatch(RewardsIntent.redeemRewardStart());
      const result = await container.redeemRewardUseCase.execute(reward);
      dispatch(RewardsIntent.redeemRewardSuccess(result));
      return result.voucher;
    } catch (err) {
      console.error('Failed to redeem reward:', err);
      dispatch(RewardsIntent.redeemRewardFailure(err.message));
      throw err;
    }
  }, []);

  // Earn points from newly completed order
  const earnPointsFromOrder = useCallback(async (orderId, amount) => {
    try {
      const updated = await container.earnPointsUseCase.execute(orderId, amount);
      if (updated) {
        dispatch(RewardsIntent.earnPointsSuccess(updated));
      }
    } catch (err) {
      console.error('Failed to award points from order:', err);
    }
  }, []);

  const openRewardsModal = useCallback(() => dispatch(RewardsIntent.openModal()), []);
  const closeRewardsModal = useCallback(() => dispatch(RewardsIntent.closeModal()), []);
  const toggleRewardsModal = useCallback(() => dispatch(RewardsIntent.toggleModal()), []);

  const applyVoucherToCheckout = useCallback((voucher) => {
    dispatch(RewardsIntent.applyVoucherToCheckout(voucher));
  }, []);

  const removeActiveVoucher = useCallback(() => {
    dispatch(RewardsIntent.removeActiveVoucher());
  }, []);

  const resetFeedback = useCallback(() => {
    dispatch(RewardsIntent.resetFeedback());
  }, []);

  return {
    ...state,
    openRewardsModal,
    closeRewardsModal,
    toggleRewardsModal,
    claimDailyCheckIn,
    redeemReward,
    earnPointsFromOrder,
    applyVoucherToCheckout,
    removeActiveVoucher,
    resetFeedback,
    refreshProfile,
  };
}
