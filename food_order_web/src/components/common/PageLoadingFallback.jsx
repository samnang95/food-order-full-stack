import { AppAssets } from '../../core';

/**
 * PageLoadingFallback — Sleek animated branded loading state for route suspense.
 */
export function PageLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Glowing pulse aura */}
        <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500/30 to-amber-500/20 blur-xl animate-pulse" />

        {/* Spinning gradient ring */}
        <div className="w-16 h-16 rounded-full border-3 border-orange-500/20 border-t-orange-500 animate-spin" />

        {/* Central BiteCraft icon */}
        <div className="absolute w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-orange-500/20 bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center">
          <img
            src={AppAssets.images.appIcon}
            alt="BiteCraft"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      <div className="mt-5 text-center space-y-1">
        <p className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
          BiteCraft
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Loading tasty details...
        </p>
      </div>
    </div>
  );
}
