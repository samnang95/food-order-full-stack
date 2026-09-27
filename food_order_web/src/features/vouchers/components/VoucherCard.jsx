import { useState } from 'react';
import PropTypes from 'prop-types';
import { formatUsd, formatKhr } from '../../../core';

export function VoucherCard({
  voucher,
  cartSubtotal = 0,
  cartItemCount = 0,
  isApplied = false,
  onApply,
  onRemove,
  onAddMore,
  onViewTerms,
}) {
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);

  const isEligible = voucher.isEligible ? voucher.isEligible(cartSubtotal) : cartSubtotal >= voucher.minSpend;
  const amountNeeded = voucher.amountNeeded
    ? voucher.amountNeeded(cartSubtotal)
    : Math.max(0, voucher.minSpend - cartSubtotal);

  const progressPercent = voucher.minSpend > 0
    ? Math.min(100, Math.round((cartSubtotal / voucher.minSpend) * 100))
    : 100;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleApplyClick = async (e) => {
    e.stopPropagation();
    if (isApplied) {
      onRemove?.(voucher.code);
      return;
    }

    if (cartItemCount === 0 || !isEligible) {
      onAddMore?.(voucher);
      return;
    }

    setApplying(true);
    try {
      await onApply(voucher.code);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
        isApplied
          ? 'border-emerald-500/80 ring-2 ring-emerald-500/20'
          : isEligible && cartItemCount > 0
          ? 'border-orange-500/50 hover:border-orange-500'
          : 'border-slate-200/90 dark:border-slate-800'
      }`}
    >
      {/* Decorative Ticket Left and Right Cutout Notches */}
      <div className="absolute -left-3 top-28 w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 z-10 pointer-events-none" />
      <div className="absolute -right-3 top-28 w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 z-10 pointer-events-none" />

      {/* Top Banner & Header */}
      <div className="p-5 sm:p-6 pb-4 space-y-3">
        {/* Category, Badge & Icon Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xl shadow-xs">
              {voucher.icon || '🎟️'}
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                {voucher.category || 'PROMO DEAL'}
              </span>
              <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                {voucher.formattedDiscountLabel || `${voucher.value}% OFF`}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {isApplied ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 animate-pulse">
              <span>✓</span>
              <span>Applied</span>
            </span>
          ) : voucher.badge ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100/80 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 border border-orange-300/40 dark:border-orange-800/40">
              {voucher.badge}
            </span>
          ) : null}
        </div>

        {/* Voucher Title and Description */}
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            {voucher.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {voucher.desc}
          </p>
        </div>
      </div>

      {/* Dashed Ticket Perforation Line */}
      <div className="relative px-6 py-1">
        <div className="border-b border-dashed border-slate-200 dark:border-slate-800" />
      </div>

      {/* Middle & Bottom Section */}
      <div className="p-5 sm:p-6 pt-3 space-y-4">
        {/* Cart Subtotal Meter & Minimum Spend */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-500 dark:text-slate-400">
              Min. spend: {voucher.minSpend > 0 ? formatUsd(voucher.minSpend) : 'Any order'}
            </span>
            {cartSubtotal > 0 && (
              <span
                className={`font-black ${
                  isEligible
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {isEligible ? 'Eligible ✓' : `Need ${formatUsd(amountNeeded)} more`}
              </span>
            )}
          </div>

          {/* Progress Bar (Visible if cart has items) */}
          {cartSubtotal > 0 && voucher.minSpend > 0 && (
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isEligible
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Promo Code & Copy Button */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="pl-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Promo Code
            </span>
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase text-slate-900 dark:text-white">
              {voucher.code}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1 ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
            }`}
          >
            <span>{copied ? '✓ Copied!' : '📋 Copy'}</span>
          </button>
        </div>

        {/* Action Button & Terms Toggle */}
        <div className="space-y-2">
          {isApplied ? (
            <button
              type="button"
              onClick={handleApplyClick}
              className="w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors flex items-center justify-center space-x-1"
            >
              <span>✕ Remove from Cart</span>
            </button>
          ) : isEligible && cartItemCount > 0 ? (
            <button
              type="button"
              disabled={applying}
              onClick={handleApplyClick}
              className="w-full py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>{applying ? 'Applying...' : 'Apply to Order Now'}</span>
              <span>→</span>
            </button>
          ) : cartItemCount > 0 ? (
            <button
              type="button"
              onClick={handleApplyClick}
              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Add {formatUsd(amountNeeded)} ({formatKhr(amountNeeded)}) More</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyClick}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-sm active:scale-98 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Use Deal on Menu</span>
              <span>🍔</span>
            </button>
          )}

          {/* Terms & Conditions link */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">
              Valid until Oct 31, 2026
            </span>
            <button
              type="button"
              onClick={() => onViewTerms(voucher)}
              className="text-[10px] font-bold text-slate-500 hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
            >
              Terms & Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

VoucherCard.propTypes = {
  voucher: PropTypes.object.isRequired,
  cartSubtotal: PropTypes.number,
  cartItemCount: PropTypes.number,
  isApplied: PropTypes.bool,
  onApply: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
  onAddMore: PropTypes.func,
  onViewTerms: PropTypes.func.isRequired,
};
