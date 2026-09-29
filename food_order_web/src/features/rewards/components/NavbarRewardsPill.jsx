import { Link } from 'react-router-dom';
import { useRewards } from '../use_rewards';
import { AppRoutes } from '../../../routes/app_routes';
import { soundService } from '../../../core';

export function NavbarRewardsPill() {
  const { currentTier, pointsBalance } = useRewards();

  return (
    <Link
      to={AppRoutes.REWARDS}
      onClick={() => soundService.playPop()}
      className="group relative inline-flex items-center space-x-1.5 px-2.5 py-1.5 2xl:px-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/15 hover:from-amber-500/20 hover:to-orange-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-extrabold text-xs transition-all active:scale-95 shadow-2xs cursor-pointer shrink-0"
      title={`BitePoints VIP: ${currentTier?.name || 'Silver'} • ${pointsBalance} pts`}
    >
      <span className="text-sm group-hover:scale-110 transition-transform">
        {currentTier?.icon || '🪙'}
      </span>
      <span className="hidden 2xl:inline font-bold">
        {currentTier?.name?.split(' ')[0] || 'Silver'}
      </span>
      <span className="text-[10px] opacity-60 hidden 2xl:inline">•</span>
      <span className="font-mono text-orange-600 dark:text-orange-400 font-black">
        {pointsBalance}
      </span>
      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">pts</span>
    </Link>
  );
}
