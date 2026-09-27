import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDriverTip } from '../use_driver_tip';
import { formatUsd, formatKhr, useTranslation } from '../../../core';

const TIP_PRESETS = [0, 0.5, 1.0, 2.0, 5.0];

export function DriverTipCard({
  tipAmount: controlledTip,
  onTipChange,
  orderId = '',
  showBakongButton = true,
  className = '',
}) {
  const { t } = useTranslation();
  const {
    driver,
    tipAmount: storeTip,
    setTipAmount: setStoreTip,
    openKhqrTipModal,
    generateBakongQr,
  } = useDriverTip();

  const currentTip = controlledTip !== undefined ? controlledTip : storeTip;
  const updateTip = onTipChange || setStoreTip;

  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const handleSelectPreset = (amount) => {
    setIsCustom(false);
    updateTip(amount);
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomValue(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      updateTip(Math.round(parsed * 100) / 100);
    } else {
      updateTip(0);
    }
  };

  const handleOpenBakong = () => {
    const tipToUse = currentTip > 0 ? currentTip : 1.0;
    const payload = generateBakongQr(tipToUse, orderId);
    openKhqrTipModal(payload);
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      {/* Header with Driver Profile Snippet */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={driver?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
              alt={driver?.name}
              className="w-10 h-10 rounded-2xl object-cover border border-amber-500/30 shadow-xs"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120';
              }}
            />
            <span className="absolute -bottom-1 -right-1 text-xs">🛵</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {t('driverTip.tipYourCourier', 'Tip Your Rider')}
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                ⭐ {driver?.rating || 4.96}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {driver?.name || 'Sok Dara'} • {driver?.vehicle || 'Honda Wave 125i'}
            </p>
          </div>
        </div>

        {currentTip > 0 && (
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs">
              +{formatUsd(currentTip)}
            </span>
            <span className="block text-[9px] text-slate-400 font-medium mt-0.5">
              {formatKhr(currentTip)}
            </span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        {t(
          'driverTip.tipGuarantee',
          '100% of your tip goes directly to your rider. Support local express couriers!'
        )}
      </p>

      {/* Preset Pills */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {TIP_PRESETS.map((amount) => {
          const isSelected = !isCustom && currentTip === amount;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => handleSelectPreset(amount)}
              className={`py-2 px-1 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center border ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25 scale-102 ring-2 ring-amber-400/40'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-300'
              }`}
            >
              <span className="leading-tight">
                {amount === 0 ? t('driverTip.noTip', 'No Tip') : formatUsd(amount)}
              </span>
              {amount > 0 && (
                <span
                  className={`text-[8px] font-mono mt-0.5 ${
                    isSelected ? 'text-amber-100 font-bold' : 'text-slate-400'
                  }`}
                >
                  {formatKhr(amount)}
                </span>
              )}
              {amount === 1.0 && (
                <span className="text-[7px] uppercase tracking-wider font-black text-amber-950 dark:text-amber-200 mt-0.5">
                  {t('driverTip.popular', '★ Popular')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Amount & Bakong KHQR Quick Tip Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder={t('driverTip.customTipPlaceholder', 'Custom USD tip amount')}
            value={isCustom ? customValue : ''}
            onFocus={() => setIsCustom(true)}
            onChange={handleCustomChange}
            className={`w-full pl-6 pr-3 py-2 text-xs rounded-xl border transition-all ${
              isCustom
                ? 'bg-white dark:bg-slate-800 border-amber-500 ring-2 ring-amber-400/20 text-slate-900 dark:text-white'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          />
        </div>

        {showBakongButton && (
          <button
            type="button"
            onClick={handleOpenBakong}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white font-bold text-xs shadow-md shadow-rose-600/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-1.5 shrink-0"
          >
            <span>🇰🇭</span>
            <span>{t('driverTip.tipViaBakong', 'Tip via Bakong KHQR')}</span>
          </button>
        )}
      </div>
    </div>
  );
}

DriverTipCard.propTypes = {
  tipAmount: PropTypes.number,
  onTipChange: PropTypes.func,
  orderId: PropTypes.string,
  showBakongButton: PropTypes.bool,
  className: PropTypes.string,
};
