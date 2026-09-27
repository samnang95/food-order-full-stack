import { useTranslation, formatUsd } from '../../../core';
import { useRewards } from '../use_rewards';

export function CheckoutRewardsSelector({ onApplyVoucher, appliedVoucher, subtotal = 0 }) {
  const { t } = useTranslation();
  const {
    pointsBalance,
    redeemedVouchers,
    openRewardsModal,
    activeVoucher,
    applyVoucherToCheckout,
    removeActiveVoucher,
  } = useRewards();

  const currentVoucher = appliedVoucher || activeVoucher;
  const availableVouchers = redeemedVouchers.filter((v) => !v.isUsed);

  const handleSelect = (v) => {
    applyVoucherToCheckout(v);
    if (onApplyVoucher) onApplyVoucher(v);
  };

  const handleRemove = () => {
    removeActiveVoucher();
    if (onApplyVoucher) onApplyVoucher(null);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent border border-amber-500/20 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🪙</span>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {t('rewards.bitePointsDiscount') || 'BitePoints Loyalty Perks'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('rewards.availablePoints') || 'Balance:'}{' '}
              <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                {pointsBalance} pts
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openRewardsModal}
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1 cursor-pointer"
        >
          <span>🎁 {t('rewards.rewardsHub') || 'Rewards Hub'}</span>
          <span>→</span>
        </button>
      </div>

      {/* Currently Applied Voucher */}
      {currentVoucher ? (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-lg">{currentVoucher.icon || '🎟️'}</span>
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {currentVoucher.title}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                Code: {currentVoucher.code} • Savings: {currentVoucher.discountType === 'free_delivery' ? 'Free Delivery' : formatUsd(currentVoucher.discountValue)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            {t('common.remove') || 'Remove'}
          </button>
        </div>
      ) : availableVouchers.length > 0 ? (
        /* Available Redeemed Vouchers Carousel */
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {t('rewards.yourRedeemedVouchers') || 'Your Redeemed Vouchers'} ({availableVouchers.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableVouchers.map((v) => {
              const meetsMin = subtotal >= (v.minOrder || 0);

              return (
                <div
                  key={v.instanceId || v.code}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    meetsMin
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-400'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <span className="text-base">{v.icon || '🎟️'}</span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {v.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Min. order {formatUsd(v.minOrder || 0)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!meetsMin}
                    onClick={() => handleSelect(v)}
                    className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-[11px] shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {t('common.apply') || 'Apply'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty / CTA to Redeem */
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            {t('rewards.redeemPrompt') || 'You have BitePoints ready to convert into meal discounts!'}
          </p>
          <button
            type="button"
            onClick={openRewardsModal}
            className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-orange-600 dark:hover:bg-orange-600 text-white font-bold text-[11px] transition-colors shrink-0 cursor-pointer"
          >
            {t('rewards.redeemVoucher') || 'Redeem'}
          </button>
        </div>
      )}
    </div>
  );
}
