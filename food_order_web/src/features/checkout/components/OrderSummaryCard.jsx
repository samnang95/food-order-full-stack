import PropTypes from 'prop-types';
import { formatUsd, formatKhr, useTranslation } from '../../../core';

export function OrderSummaryCard({
  items = [],
  subtotal,
  deliveryFee,
  discountAmount,
  tipAmount,
  totalAmount,
  appliedVoucher,
  paymentMethod = 'cash',
  submitting,
  onPlaceOrder,
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 sticky top-24">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
          {t('checkout.orderSummary')}
        </h3>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
          {items.length} {t('common.items')}
        </span>
      </div>

      {/* Itemized Food List */}
      <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
        {items.map((item) => (
          <div key={item.food.id} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start space-x-2.5 min-w-0">
              <span className="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                {item.quantity}×
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {item.food.name}
                </p>
                {item.notes && (
                  <p className="text-[10px] text-slate-400 italic truncate">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>
            <span className="font-black text-slate-900 dark:text-white shrink-0">
              {formatUsd((Number(item.food.price) || 0) * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Bill Breakdown */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>{t('cart.subtotal')}</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {formatUsd(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>{t('cart.deliveryFee')}</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {deliveryFee === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {t('cart.free')}
              </span>
            ) : (
              formatUsd(deliveryFee)
            )}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="flex items-center space-x-1">
              <span>🎟️</span>
              <span>{appliedVoucher ? `${appliedVoucher.code} Discount` : t('cart.discount')}</span>
            </span>
            <span>-{formatUsd(discountAmount)}</span>
          </div>
        )}

        {tipAmount > 0 && (
          <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
            <span className="flex items-center space-x-1">
              <span>🛵</span>
              <span>Courier Tip</span>
            </span>
            <span>+{formatUsd(tipAmount)}</span>
          </div>
        )}

        {/* Total Highlight */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-baseline justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              {t('cart.total')}
            </span>
            <span className="block text-[11px] text-slate-400 font-medium">
              {formatKhr(totalAmount)}
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 tracking-tight">
            {formatUsd(totalAmount)}
          </span>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        type="button"
        disabled={submitting || items.length === 0}
        onClick={onPlaceOrder}
        className={`w-full py-4 px-6 rounded-2xl text-white font-black text-sm shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 ${
          paymentMethod === 'khqr'
            ? 'bg-gradient-to-r from-[#E11900] via-red-600 to-orange-500 hover:from-[#C21500] hover:to-orange-600 shadow-red-500/25 hover:shadow-red-500/35'
            : 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30 hover:shadow-orange-500/40'
        }`}
      >
        {submitting ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{t('checkout.placingOrder')}</span>
          </span>
        ) : (
          <>
            <span>{paymentMethod === 'khqr' ? `📱 ${t('checkout.payWithKhqr')}` : t('checkout.placeOrder')}</span>
            <span>•</span>
            <span>{formatUsd(totalAmount)}</span>
          </>
        )}
      </button>

      <p className="text-[10px] text-center text-slate-400 leading-tight">
        By placing your order, you agree to BiteCraft delivery terms & conditions.
      </p>
    </div>
  );
}

OrderSummaryCard.propTypes = {
  items: PropTypes.array.isRequired,
  subtotal: PropTypes.number.isRequired,
  deliveryFee: PropTypes.number.isRequired,
  discountAmount: PropTypes.number.isRequired,
  tipAmount: PropTypes.number.isRequired,
  totalAmount: PropTypes.number.isRequired,
  appliedVoucher: PropTypes.object,
  paymentMethod: PropTypes.string,
  submitting: PropTypes.bool,
  onPlaceOrder: PropTypes.func.isRequired,
};
