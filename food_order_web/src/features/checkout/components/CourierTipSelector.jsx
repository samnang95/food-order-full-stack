import { useState } from 'react';
import PropTypes from 'prop-types';
import { formatUsd } from '../../../core';

const TIP_PRESETS = [0, 0.5, 1.0, 2.0];

export function CourierTipSelector({ tipAmount, onTipChange }) {
  const [customActive, setCustomActive] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const handleSelectPreset = (amount) => {
    setCustomActive(false);
    onTipChange(amount);
  };

  const handleCustomInput = (e) => {
    const val = e.target.value;
    setCustomValue(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      onTipChange(Math.round(parsed * 100) / 100);
    } else {
      onTipChange(0);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-black">
            🛵
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              Tip Your Courier
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              100% of your tip goes directly to the delivery rider
            </p>
          </div>
        </div>
        {tipAmount > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            +{formatUsd(tipAmount)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
        {TIP_PRESETS.map((amount) => {
          const isSelected = !customActive && tipAmount === amount;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => handleSelectPreset(amount)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-102 ring-2 ring-amber-400/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{amount === 0 ? 'No Tip' : formatUsd(amount)}</span>
              {amount === 1.0 && (
                <span className="text-[8px] uppercase tracking-wider font-black text-amber-950 dark:text-amber-200 mt-0.5">
                  Popular
                </span>
              )}
            </button>
          );
        })}

        {/* Custom Tip Button */}
        <button
          type="button"
          onClick={() => {
            setCustomActive(true);
            const parsed = parseFloat(customValue);
            if (!isNaN(parsed) && parsed > 0) {
              onTipChange(parsed);
            }
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
            customActive
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Custom Tip Input if active */}
      {customActive && (
        <div className="pt-2 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">$</span>
            <input
              type="number"
              min="0"
              step="0.5"
              autoFocus
              value={customValue}
              onChange={handleCustomInput}
              placeholder="Enter custom tip amount (e.g. 3.00)"
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

CourierTipSelector.propTypes = {
  tipAmount: PropTypes.number.isRequired,
  onTipChange: PropTypes.func.isRequired,
};
