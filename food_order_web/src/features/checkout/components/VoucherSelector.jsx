import { useState } from 'react';
import PropTypes from 'prop-types';
import { formatUsd, formatKhr } from '../../../core';

export function VoucherSelector({
  appliedVoucher,
  availableVouchers = [],
  onApplyVoucher,
  onRemoveVoucher,
}) {
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  const handleApply = async (codeToApply) => {
    const code = (codeToApply || inputCode).trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    setFeedback(null);
    try {
      const res = await onApplyVoucher(code);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setInputCode('');
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to apply voucher' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm font-black">
            🎟️
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              Promo Code & Vouchers
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Apply a promo code to discount your meal
            </p>
          </div>
        </div>
      </div>

      {/* Applied Voucher Card */}
      {appliedVoucher ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/25 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm font-black shadow-sm">
              ✓
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono text-xs font-black tracking-wider uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                  {appliedVoucher.code}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {appliedVoucher.title}
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                You saved {formatUsd(appliedVoucher.discountAmount)} ({formatKhr(appliedVoucher.discountAmount)})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onRemoveVoucher();
              setFeedback(null);
            }}
            className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        /* Voucher Input Field */
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApply();
                }
              }}
              placeholder="Enter promo code (e.g. WELCOME10)"
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm uppercase font-mono rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
            <button
              type="button"
              disabled={loading || !inputCode.trim()}
              onClick={() => handleApply()}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              {loading ? '...' : 'Apply'}
            </button>
          </div>

          {/* Feedback message */}
          {feedback && (
            <p
              className={`text-[11px] font-semibold ${
                feedback.type === 'success'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {feedback.message}
            </p>
          )}
        </div>
      )}

      {/* Available Vouchers Quick Tap */}
      {availableVouchers.length > 0 && !appliedVoucher && (
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Tap to apply active promo vouchers
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableVouchers.map((v) => (
              <div
                key={v.code}
                onClick={() => handleApply(v.code)}
                className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-orange-500/50 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/80 px-1.5 py-0.2 rounded-md">
                      {v.code}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {v.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {v.desc || `Min spend $${v.minSpend}`}
                  </p>
                </div>
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-700 group-hover:bg-orange-500 group-hover:text-white text-slate-700 dark:text-slate-200 shadow-xs transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

VoucherSelector.propTypes = {
  voucherCode: PropTypes.string,
  appliedVoucher: PropTypes.object,
  availableVouchers: PropTypes.array,
  onApplyVoucher: PropTypes.func.isRequired,
  onRemoveVoucher: PropTypes.func.isRequired,
};
