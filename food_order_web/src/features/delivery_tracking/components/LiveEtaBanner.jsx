import { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * LiveEtaBanner — Prominent gradient banner displaying real-time ETA
 * with animated progress bar and distance indicator.
 */
export function LiveEtaBanner({ tracking }) {
  // Calculate progress percentage from ETA
  const progress = useMemo(() => {
    if (!tracking?.estimatedMinutes) return 50;
    const maxEta = 40; // Assume 40min is 0% progress
    const pct = Math.max(0, Math.min(100, ((maxEta - tracking.estimatedMinutes) / maxEta) * 100));
    return Math.round(pct);
  }, [tracking?.estimatedMinutes]);

  const statusMessage = useMemo(() => {
    if (!tracking) return 'Loading...';
    const status = tracking.status;
    if (status === 'delivered') return '🎉 Delivered! Enjoy your meal';
    if (status === 'cancelled') return '❌ Order cancelled';
    if (status === 'nearby') return '📍 Driver is almost at your location!';
    if (status === 'out_for_delivery') return '🛵 Your order is on the way!';
    if (status === 'picked_up') return '📦 Driver picked up your order';
    if (status === 'ready') return '✅ Your food is ready for pickup';
    if (status === 'preparing') return '🍳 Your food is being prepared';
    if (status === 'confirmed') return '✅ Restaurant confirmed your order';
    return '📝 Order placed, waiting for confirmation';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking?.status]);

  if (!tracking) return null;

  const isDelivered = tracking.status === 'delivered';
  const isCancelled = tracking.status === 'cancelled';

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-500 ${
        isDelivered
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400/30 shadow-emerald-500/20'
          : isCancelled
          ? 'bg-gradient-to-r from-rose-500 to-rose-600 border-rose-400/30 shadow-rose-500/20'
          : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 border-orange-400/30 shadow-orange-500/20'
      }`}
    >
      {/* Animated background pattern */}
      {!isDelivered && !isCancelled && (
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)',
              animation: 'slide 3s linear infinite',
            }}
          />
        </div>
      )}

      <div className="relative p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Status + ETA */}
          <div className="space-y-1.5">
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">
              Live Delivery Status
            </p>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {statusMessage}
            </h2>
          </div>

          {/* Right: ETA Circle */}
          {!isDelivered && !isCancelled && tracking.estimatedMinutes && (
            <div className="flex items-center space-x-4 self-start sm:self-auto">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex flex-col items-center justify-center border border-white/30 shadow-inner">
                <span className="text-2xl font-black text-white leading-none">
                  {tracking.estimatedMinutes}
                </span>
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                  min
                </span>
              </div>
              {tracking.formattedDistance && (
                <div className="text-center">
                  <p className="text-xs font-bold text-white/80">
                    {tracking.formattedDistance}
                  </p>
                  <p className="text-[9px] text-white/60 uppercase tracking-wider">
                    away
                  </p>
                </div>
              )}
            </div>
          )}

          {isDelivered && (
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 self-start sm:self-auto">
              <span className="text-3xl">✓</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {!isDelivered && !isCancelled && (
          <div className="mt-4">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[9px] font-bold text-white/60">
              <span>Picked up</span>
              <span>On the way</span>
              <span>Arriving</span>
            </div>
          </div>
        )}
      </div>

      {/* Sliding animation keyframes injected via style tag */}
      <style>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(40px); }
        }
      `}</style>
    </div>
  );
}

LiveEtaBanner.propTypes = {
  tracking: PropTypes.object,
};
