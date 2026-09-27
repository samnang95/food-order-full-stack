import { useNavigate } from 'react-router-dom';
import { useTranslation, formatUsd } from '../../core';
import { AppRoutes } from '../../routes/app_routes';
import { useCart } from '../cart/use_cart';
import { VoucherCard } from './components/VoucherCard';
import { VoucherTermsModal } from './components/VoucherTermsModal';
import { useVouchersStore } from './vouchers_store';
import { VouchersIntent } from './vouchers_intent';

export function VouchersView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    subtotal,
    totalCount,
    voucherCode,
    discountAmount,
    applyVoucher,
    removeVoucher,
    openCart,
  } = useCart();

  const { state, onIntent, filteredVouchers, eligibleCount } = useVouchersStore(subtotal);

  const {
    loading,
    selectedCategory,
    searchQuery,
    inputCode,
    redeemFeedback,
    redeeming,
    selectedTermsVoucher,
  } = state;

  // Handle manual code redemption
  const handleRedeemManual = async (e) => {
    e.preventDefault();
    const code = (inputCode || '').trim().toUpperCase();
    if (!code) return;

    onIntent(VouchersIntent.setRedeeming(true));
    onIntent(VouchersIntent.setRedeemFeedback(null));
    try {
      const res = await applyVoucher(code);
      if (res.success) {
        onIntent(
          VouchersIntent.setRedeemFeedback({
            type: 'success',
            message: res.message || `Code ${code} applied successfully!`,
          })
        );
        onIntent(VouchersIntent.setInputCode(''));
      } else {
        onIntent(
          VouchersIntent.setRedeemFeedback({
            type: 'error',
            message: res.message || 'Invalid or expired voucher code',
          })
        );
      }
    } catch (err) {
      onIntent(
        VouchersIntent.setRedeemFeedback({
          type: 'error',
          message: err.message || 'Failed to validate voucher',
        })
      );
    } finally {
      onIntent(VouchersIntent.setRedeeming(false));
    }
  };

  const handleApplyCardVoucher = async (code) => {
    const res = await applyVoucher(code);
    if (res.success) {
      onIntent(
        VouchersIntent.setRedeemFeedback({
          type: 'success',
          message: res.message || `Voucher ${code} applied to your cart!`,
        })
      );
    } else {
      onIntent(
        VouchersIntent.setRedeemFeedback({
          type: 'error',
          message: res.message || 'Unable to apply voucher',
        })
      );
    }
  };

  const handleAddMoreItems = () => {
    if (totalCount > 0) {
      openCart();
    } else {
      navigate(AppRoutes.MENU);
    }
  };

  const categories = [
    { id: 'ALL', label: t('vouchers.tabAll') || 'All Deals', icon: '🎟️' },
    { id: 'DISCOUNT', label: t('vouchers.tabDiscount') || 'Special Discounts', icon: '🔥' },
    { id: 'DELIVERY', label: t('vouchers.tabDelivery') || 'Free Delivery', icon: '🛵' },
    { id: 'WELCOME', label: t('vouchers.tabWelcome') || 'New Foodie', icon: '🎁' },
    { id: 'FESTIVAL', label: t('vouchers.tabFestival') || 'Festivals', icon: '🎉' },
  ];

  return (
    <div className="space-y-8 sm:space-y-12 pb-12">
      {/* 1. Hero Promotional Showcase */}
      <section className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-orange-500 via-rose-500 to-amber-500 text-white p-6 sm:p-12 shadow-xl shadow-orange-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 sm:w-72 h-60 sm:h-72 rounded-full bg-black/10 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-amber-100 border border-white/25">
            <span>🎟️</span>
            <span>{t('vouchers.heroBadge') || 'Voucher & Promo Center'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {t('vouchers.heroTitle') || 'Delicious Savings on Every Bite'}
          </h1>

          <p className="text-xs sm:text-base text-orange-50/90 leading-relaxed font-medium">
            {t('vouchers.heroSubtitle') ||
              'Unlock exclusive meal discounts, free delivery passes, and festival specials across Phnom Penh.'}
          </p>

          {/* Manual Code Input Bar */}
          <form
            onSubmit={handleRedeemManual}
            className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-xl shadow-orange-950/20 max-w-lg text-slate-800"
          >
            <div className="flex-1 flex items-center pl-2">
              <span className="text-slate-400 text-sm">🎟️</span>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => onIntent(VouchersIntent.setInputCode(e.target.value.toUpperCase()))}
                placeholder={t('vouchers.inputPlaceholder') || 'Enter promo code (e.g. WELCOME20)'}
                className="flex-1 px-3 py-2 text-xs sm:text-sm font-mono uppercase text-slate-900 placeholder-slate-400 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              disabled={redeeming || !inputCode.trim()}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs sm:text-sm transition-colors shadow-md disabled:opacity-50"
            >
              {redeeming ? '...' : t('vouchers.applyButton') || 'Apply Code'}
            </button>
          </form>

          {/* Feedback banner */}
          {redeemFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold inline-flex items-center space-x-2 ${
                redeemFeedback.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30'
                  : 'bg-rose-500/20 text-rose-100 border border-rose-400/30'
              }`}
            >
              <span>{redeemFeedback.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{redeemFeedback.message}</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. Active Cart Qualification Card */}
      {totalCount > 0 && (
        <section className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-lg font-black shrink-0 shadow-xs">
              🛍️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  Cart Subtotal: {formatUsd(subtotal)} ({totalCount} {totalCount === 1 ? 'item' : 'items'})
                </span>
                {voucherCode && (
                  <span className="font-mono text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                    {voucherCode} Applied (-{formatUsd(discountAmount)})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {eligibleCount > 0
                  ? `You qualify for ${eligibleCount} promo ${eligibleCount === 1 ? 'deal' : 'deals'} based on your current cart value.`
                  : 'Add more mouth-watering items to unlock bigger discount tiers.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {voucherCode ? (
              <button
                type="button"
                onClick={() => navigate(AppRoutes.CHECKOUT)}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
              >
                Go to Checkout →
              </button>
            ) : (
              <button
                type="button"
                onClick={openCart}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                View Cart ({totalCount})
              </button>
            )}
          </div>
        </section>
      )}

      {/* 3. Search & Category Filters */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onIntent(VouchersIntent.setCategory(cat.id))}
                  className={`px-3.5 py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                    active
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search in Vouchers */}
          <div className="relative min-w-[220px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onIntent(VouchersIntent.setSearchQuery(e.target.value))}
              placeholder={t('vouchers.searchDeals') || 'Search deals or codes...'}
              className="w-full pl-8 pr-3 py-2 rounded-xl sm:rounded-2xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-orange-500"
            />
          </div>
        </div>

        {/* 4. Vouchers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <span className="text-4xl">🎟️</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('vouchers.noVouchersFound') || 'No vouchers found matching your search'}
            </h3>
            <p className="text-xs text-slate-500">
              {t('vouchers.tryAnotherFilter') || 'Try selecting another tab or reset your search query.'}
            </p>
            <button
              onClick={() => {
                onIntent(VouchersIntent.setCategory('ALL'));
                onIntent(VouchersIntent.setSearchQuery(''));
              }}
              className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
            {filteredVouchers.map((voucher) => (
              <VoucherCard
                key={voucher.code}
                voucher={voucher}
                cartSubtotal={subtotal}
                cartItemCount={totalCount}
                isApplied={voucherCode === voucher.code}
                onApply={handleApplyCardVoucher}
                onRemove={removeVoucher}
                onAddMore={handleAddMoreItems}
                onViewTerms={(v) => onIntent(VouchersIntent.selectTermsVoucher(v))}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. How To Redeem 3-Step Visual Guide */}
      <section className="rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-md mx-auto space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
            {t('vouchers.howItWorksTitle') || 'Simple & Instant'}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('vouchers.howToRedeemHeading') || 'How to Redeem Your Savings'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-black">
              1
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {t('vouchers.step1Title') || 'Browse & Add Food'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('vouchers.step1Desc') ||
                'Explore dishes from top restaurants in Phnom Penh and add them to your cart.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-black">
              2
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {t('vouchers.step2Title') || 'Copy or Tap Apply'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('vouchers.step2Desc') ||
                'Tap Apply on any eligible voucher card or enter your code during checkout.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-black">
              3
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {t('vouchers.step3Title') || 'Fast Doorstep Delivery'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('vouchers.step3Desc') ||
                'Relax while our courier brings your fresh, discounted meal right to your doorstep.'}
            </p>
          </div>
        </div>
      </section>

      {/* Terms & Conditions Modal */}
      {selectedTermsVoucher && (
        <VoucherTermsModal
          voucher={selectedTermsVoucher}
          isApplied={voucherCode === selectedTermsVoucher.code}
          onClose={() => onIntent(VouchersIntent.clearTermsVoucher())}
          onApply={() => handleApplyCardVoucher(selectedTermsVoucher.code)}
        />
      )}
    </div>
  );
}
