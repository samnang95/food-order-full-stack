import PropTypes from 'prop-types';
import { formatUsd } from '../../../core';

export function VoucherTermsModal({ voucher, onClose, onApply, isApplied }) {
  if (!voucher) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl shadow-xs">
              {voucher.icon || '🎟️'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-black tracking-wider uppercase bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-md">
                  {voucher.code}
                </span>
                {voucher.badge && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md">
                    {voucher.badge}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                {voucher.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Min. Order Spend
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {voucher.minSpend > 0 ? formatUsd(voucher.minSpend) : 'No Minimum'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Max. Discount Cap
            </span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {voucher.maxDiscount ? formatUsd(voucher.maxDiscount) : 'No Limit'}
            </span>
          </div>
        </div>

        {/* Terms list */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Terms & Conditions
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {voucher.terms && voucher.terms.length > 0 ? (
              voucher.terms.map((term, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-orange-500 shrink-0 mt-0.5">•</span>
                  <span>{term}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start space-x-2">
                <span className="text-orange-500 shrink-0 mt-0.5">•</span>
                <span>Valid on eligible BiteCraft orders in Phnom Penh.</span>
              </li>
            )}
            <li className="flex items-start space-x-2">
              <span className="text-orange-500 shrink-0 mt-0.5">•</span>
              <span>Valid until October 31, 2026.</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isApplied ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-500/20"
            >
              ✓ Currently Applied to Cart
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onApply();
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-orange-500/20 active:scale-98 transition-all"
            >
              Apply Voucher Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

VoucherTermsModal.propTypes = {
  voucher: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  isApplied: PropTypes.bool,
};
