import PropTypes from 'prop-types';

/**
 * DriverInfoCard — Shows the assigned delivery driver's info
 * with avatar, rating, vehicle details, and contact actions.
 */
export function DriverInfoCard({ tracking, onCallDriver }) {

  if (!tracking?.driverName) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-pulse">
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

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
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
              <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md">
                ★ {tracking.driverRating || '4.9'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              🛵 {tracking.vehicleType || 'Motorbike'} • {tracking.vehiclePlate || 'PP-0000'}
            </p>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex items-center space-x-2">
          <a
            href={`tel:${tracking.driverPhone || '+85512889900'}`}
            onClick={(e) => {
              if (onCallDriver) {
                e.preventDefault();
                onCallDriver(tracking);
              }
            }}
            className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 transition-colors"
            title="Call Driver"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Live ETA + Distance Bar */}
      {tracking.isLive && (
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/15 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">⚡</span>
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
};
