/**
 * Intent (I) in MVI:
 * Plain actions representing user intents and vouchers events.
 */
export const VouchersIntentType = {
  LOAD_START: 'VOUCHERS/LOAD_START',
  LOAD_SUCCESS: 'VOUCHERS/LOAD_SUCCESS',
  LOAD_ERROR: 'VOUCHERS/LOAD_ERROR',

  SET_CATEGORY: 'VOUCHERS/SET_CATEGORY',
  SET_SEARCH_QUERY: 'VOUCHERS/SET_SEARCH_QUERY',
  SET_INPUT_CODE: 'VOUCHERS/SET_INPUT_CODE',

  SET_REDEEM_FEEDBACK: 'VOUCHERS/SET_REDEEM_FEEDBACK',
  SET_REDEEMING: 'VOUCHERS/SET_REDEEMING',

  SELECT_TERMS_VOUCHER: 'VOUCHERS/SELECT_TERMS_VOUCHER',
  CLEAR_TERMS_VOUCHER: 'VOUCHERS/CLEAR_TERMS_VOUCHER',
};

export const VouchersIntent = {
  setCategory: (category) => ({
    type: VouchersIntentType.SET_CATEGORY,
    payload: category,
  }),

  setSearchQuery: (query) => ({
    type: VouchersIntentType.SET_SEARCH_QUERY,
    payload: query,
  }),

  setInputCode: (code) => ({
    type: VouchersIntentType.SET_INPUT_CODE,
    payload: code,
  }),

  setRedeemFeedback: (feedback) => ({
    type: VouchersIntentType.SET_REDEEM_FEEDBACK,
    payload: feedback,
  }),

  setRedeeming: (isRedeeming) => ({
    type: VouchersIntentType.SET_REDEEMING,
    payload: isRedeeming,
  }),

  selectTermsVoucher: (voucher) => ({
    type: VouchersIntentType.SELECT_TERMS_VOUCHER,
    payload: voucher,
  }),

  clearTermsVoucher: () => ({
    type: VouchersIntentType.CLEAR_TERMS_VOUCHER,
  }),
};
