/**
 * Model / State (M) in MVI:
 * Immutable representation of the Vouchers feature state.
 */
export const initialVouchersState = {
  vouchers: [],
  loading: true,
  errorMessage: null,
  selectedCategory: 'ALL',
  searchQuery: '',
  inputCode: '',
  redeemFeedback: null, // { type: 'success' | 'error', message: string }
  redeeming: false,
  selectedTermsVoucher: null,
};

/**
 * Pure selector/helper to filter vouchers
 */
export function computeFilteredVouchers(vouchers = [], selectedCategory = 'ALL', searchQuery = '') {
  return vouchers.filter((v) => {
    const matchesCategory =
      !selectedCategory ||
      selectedCategory === 'ALL' ||
      v.category?.toUpperCase() === selectedCategory.toUpperCase();

    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      v.code?.toLowerCase().includes(q) ||
      v.title?.toLowerCase().includes(q) ||
      v.desc?.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });
}

export function computeEligibleVouchersCount(vouchers = [], subtotal = 0) {
  return vouchers.filter((v) => (Number(subtotal) || 0) >= (Number(v.minSpend) || 0)).length;
}
