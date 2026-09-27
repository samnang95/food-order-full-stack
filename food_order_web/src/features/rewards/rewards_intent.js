/**
 * Rewards & Loyalty MVI Intent Types and Action Creators.
 */
export const RewardsIntentType = {
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  LOAD_PROFILE_START: 'LOAD_PROFILE_START',
  LOAD_PROFILE_SUCCESS: 'LOAD_PROFILE_SUCCESS',
  LOAD_PROFILE_FAILURE: 'LOAD_PROFILE_FAILURE',
  CLAIM_CHECKIN_START: 'CLAIM_CHECKIN_START',
  CLAIM_CHECKIN_SUCCESS: 'CLAIM_CHECKIN_SUCCESS',
  CLAIM_CHECKIN_FAILURE: 'CLAIM_CHECKIN_FAILURE',
  REDEEM_REWARD_START: 'REDEEM_REWARD_START',
  REDEEM_REWARD_SUCCESS: 'REDEEM_REWARD_SUCCESS',
  REDEEM_REWARD_FAILURE: 'REDEEM_REWARD_FAILURE',
  APPLY_VOUCHER_TO_CHECKOUT: 'APPLY_VOUCHER_TO_CHECKOUT',
  REMOVE_ACTIVE_VOUCHER: 'REMOVE_ACTIVE_VOUCHER',
  EARN_POINTS_SUCCESS: 'EARN_POINTS_SUCCESS',
  RESET_FEEDBACK: 'RESET_FEEDBACK',
};

export const RewardsIntent = {
  openModal: () => ({ type: RewardsIntentType.OPEN_MODAL }),
  closeModal: () => ({ type: RewardsIntentType.CLOSE_MODAL }),
  toggleModal: () => ({ type: RewardsIntentType.TOGGLE_MODAL }),
  loadProfileStart: () => ({ type: RewardsIntentType.LOAD_PROFILE_START }),
  loadProfileSuccess: (profile) => ({
    type: RewardsIntentType.LOAD_PROFILE_SUCCESS,
    payload: profile,
  }),
  loadProfileFailure: (error) => ({
    type: RewardsIntentType.LOAD_PROFILE_FAILURE,
    payload: error,
  }),
  claimCheckInStart: () => ({ type: RewardsIntentType.CLAIM_CHECKIN_START }),
  claimCheckInSuccess: (profile) => ({
    type: RewardsIntentType.CLAIM_CHECKIN_SUCCESS,
    payload: profile,
  }),
  claimCheckInFailure: (error) => ({
    type: RewardsIntentType.CLAIM_CHECKIN_FAILURE,
    payload: error,
  }),
  redeemRewardStart: () => ({ type: RewardsIntentType.REDEEM_REWARD_START }),
  redeemRewardSuccess: ({ profile, voucher }) => ({
    type: RewardsIntentType.REDEEM_REWARD_SUCCESS,
    payload: { profile, voucher },
  }),
  redeemRewardFailure: (error) => ({
    type: RewardsIntentType.REDEEM_REWARD_FAILURE,
    payload: error,
  }),
  applyVoucherToCheckout: (voucher) => ({
    type: RewardsIntentType.APPLY_VOUCHER_TO_CHECKOUT,
    payload: voucher,
  }),
  removeActiveVoucher: () => ({ type: RewardsIntentType.REMOVE_ACTIVE_VOUCHER }),
  earnPointsSuccess: (profile) => ({
    type: RewardsIntentType.EARN_POINTS_SUCCESS,
    payload: profile,
  }),
  resetFeedback: () => ({ type: RewardsIntentType.RESET_FEEDBACK }),
};
