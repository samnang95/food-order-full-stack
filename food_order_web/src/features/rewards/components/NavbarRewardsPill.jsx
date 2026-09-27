import { useRewards } from '../use_rewards';

export function NavbarRewardsPill() {
  const { currentTier, pointsBalance, openRewardsModal } = useRewards();

  return (
    <button
      type="button"
      onClick={openRewardsModal}
      className="group relative inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/15 hover:from-amber-500/20 hover:to-orange-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-extrabold text-xs transition-all active:scale-95 shadow-2xs cursor-pointer"
      title="BitePoints Loyalty & VIP Rewards"
    >
      <span className="text-sm group-hover:scale-110 transition-transform">
        {currentTier?.icon || '🪙'}
      </span>
      <span className="hidden sm:inline font-bold">
        {currentTier?.name?.split(' ')[0] || 'Silver'}
      </span>
      <span className="text-[10px] opacity-60">•</span>
      <span className="font-mono text-orange-600 dark:text-orange-400 font-black">
        {pointsBalance}
      </span>
      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">pts</span>
    </button>
  );
}
