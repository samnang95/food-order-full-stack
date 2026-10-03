import { useState } from 'react';
import PropTypes from 'prop-types';
import { soundService } from '../../../core';

export function DriverInfoCard({ tracking, onCallDriver, onChatDriver, unreadCount = 0 }) {
  const [selectedTip, setSelectedTip] = useState(null);
  const [tipSuccessMessage, setTipSuccessMessage] = useState(null);

  if (!tracking?.driverName) {
    return (
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-36" />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">
          Looking for a nearby rider...
        </p>
      </div>
    );
  }

  const handleAddTip = (amount) => {
    setSelectedTip(amount);
    soundService.playSuccess();
    setTipSuccessMessage(`$${amount.toFixed(2)} tip added for ${tracking.driverName}! Thank you.`);
    setTimeout(() => {
      setTipSuccessMessage(null);
    }, 4500);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          {/* Driver Avatar */}
          <div className="relative">
            <img
              src={tracking.driverAvatar}
              alt={tracking.driverName}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-orange-500 shadow-md"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120';
              }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </div>

          {/* Driver Info */}
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {tracking.driverName}
              </h4>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <span>★</span>
                <span>{tracking.driverRating || '4.95'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              🛵 {tracking.vehicleType || 'Motorbike'} • <span className="font-mono">{tracking.vehiclePlate || 'PP-0000'}</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ✓ Verified Courier
              </span>
            </div>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {onChatDriver && (
            <button
              type="button"
              onClick={onChatDriver}
              className="relative p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 transition flex items-center space-x-1.5 cursor-pointer border border-orange-500/20 shadow-xs"
              title="Chat with Driver"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs font-bold hidden sm:inline">Message</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* In-app HD Audio Call */}
          <button
            type="button"
            onClick={() => onCallDriver && onCallDriver(tracking)}
            className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 transition flex items-center space-x-1.5 cursor-pointer border border-emerald-500/20 shadow-xs"
            title="Call Driver via In-App HD Audio"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-xs font-bold hidden sm:inline">Call</span>
          </button>
        </div>
      </div>

      {/* Driver Tipping Quick Bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            Show appreciation with a tip for {tracking.driverName}:
          </span>
          {selectedTip && (
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              Tip: ${selectedTip.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[0.5, 1.0, 2.0, 3.0].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleAddTip(amount)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedTip === amount
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              +${amount.toFixed(2)}
            </button>
          ))}
        </div>

        {tipSuccessMessage && (
          <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <span>🎉</span>
            <span>{tipSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Live ETA + Distance Bar */}
      {tracking.isLive && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/15 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚡</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Estimated Arrival
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {tracking.formattedEta || '~ 25 min'}
              </p>
            </div>
          </div>

          {tracking.formattedDistance && (
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Distance
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {tracking.formattedDistance}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

DriverInfoCard.propTypes = {
  tracking: PropTypes.object,
  onCallDriver: PropTypes.func,
  onChatDriver: PropTypes.func,
  unreadCount: PropTypes.number,
};
