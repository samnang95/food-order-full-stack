import { useState, useEffect } from 'react';
import { useTranslation, formatUsd } from '../../../core';
import { useRewards } from '../use_rewards';
import { RewardTierEntity } from '../../../domain/rewards/entities/reward_tier_entity';

export function RewardsHubModal() {
  const { t } = useTranslation();
  const {
    isOpenModal,
    closeRewardsModal,
    pointsBalance,
    lifetimePoints,
    currentTier,
    nextTier,
    progressToNextTier,
    streakDays,
    hasCheckedInToday,
    catalog,
    pointsHistory,
    redeemedVouchers,
    claimDailyCheckIn,
    redeemReward,
    applyVoucherToCheckout,
    streakClaimSuccess,
    redeemSuccessVoucher,
    error,
    resetFeedback,
  } = useRewards();

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'vouchers' | 'history'
  const [redeemingId, setRedeemingId] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpenModal) {
        closeRewardsModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpenModal, closeRewardsModal]);

  if (!isOpenModal) return null;

  const handleRedeem = async (reward) => {
    setRedeemingId(reward.id);
    try {
      await redeemReward(reward);
    } catch {
      // error handled in store
    } finally {
      setRedeemingId(null);
    }
  };

  const allTiers = RewardTierEntity.getTiers();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xl shadow-md shadow-orange-500/25">
              🪙
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t('rewards.hubTitle') || 'BitePoints VIP Rewards Hub'}
              </h2>
              <p className="text-xs text-slate-400">
                {t('rewards.hubSubtitle') || 'Earn points on every bite & redeem exclusive gourmet vouchers'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeRewardsModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          {/* Feedback Messages */}
          {streakClaimSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-in slide-in-from-top-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎉</span>
                <span className="font-bold">
                  {t('rewards.streakClaimed') || 'Daily bonus claimed! +50 BitePoints added to your balance.'}
                </span>
              </div>
              <button
                type="button"
                onClick={resetFeedback}
                className="font-bold opacity-75 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {redeemSuccessVoucher && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 animate-in slide-in-from-top-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎁</span>
                <div>
                  <span className="font-black">
                    {t('rewards.redeemSuccess') || 'Reward redeemed successfully!'}
                  </span>
                  <p className="text-[11px] font-mono mt-0.5">
                    Code: <strong className="underline">{redeemSuccessVoucher.code}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  applyVoucherToCheckout(redeemSuccessVoucher);
                  resetFeedback();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-2xs"
              >
                {t('rewards.applyNow') || 'Apply to Order'}
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* VIP Tier Showcase Card */}
          <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white shadow-xl overflow-hidden border border-slate-700">
            {/* Background glowing watermark */}
            <div className="absolute -right-6 -bottom-6 text-9xl opacity-10 select-none pointer-events-none">
              {currentTier?.icon || '👑'}
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl sm:text-3xl">{currentTier?.icon}</span>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block">
                      VIP Status
                    </span>
                    <h3 className="text-lg sm:text-xl font-black">{currentTier?.name}</h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">
                    Available Balance
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-orange-400">
                    {pointsBalance}{' '}
                    <span className="text-xs font-sans text-slate-300">BitePoints</span>
                  </div>
                </div>
              </div>

              {/* Progress to Next Tier */}
              {nextTier ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>
                      Progress to {nextTier.icon} {nextTier.name}
                    </span>
                    <span className="font-mono">{progressToNextTier}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-700/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                      style={{ width: `${progressToNextTier}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">
                    {lifetimePoints} / {nextTier.minPoints} lifetime pts needed
                  </p>
                </div>
              ) : (
                <div className="pt-1 text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                  <span>👑</span>
                  <span>You have unlocked the highest Platinum VIP Chef Tier!</span>
                </div>
              )}

              {/* Tier Perks Pills */}
              <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-700/80">
                {currentTier?.perks?.map((perk, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center space-x-1"
                  >
                    <span>✓</span>
                    <span>{perk}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Streak Check-in Roadmap */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent border border-amber-500/20 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔥</span>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {t('rewards.dailyStreakTitle') || 'Daily Check-in Streak'} ({streakDays}/7 Days)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('rewards.dailyStreakDesc') || 'Check in every day to claim bonus points. Day 7 unlocks a 100 pts jackpot!'}
                </p>
              </div>

              <button
                type="button"
                disabled={hasCheckedInToday}
                onClick={claimDailyCheckIn}
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 shrink-0 ${
                  hasCheckedInToday
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-orange-500/25 cursor-pointer animate-pulse'
                }`}
              >
                {hasCheckedInToday
                  ? `✓ ${t('rewards.claimedToday') || 'Claimed Today'}`
                  : `🪙 ${t('rewards.claimBonus') || 'Claim +50 Pts'}`}
              </button>
            </div>

            {/* 7-Day Visual Track */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isClaimed = day <= streakDays;
                const isCurrent = day === streakDays;
                const isJackpot = day === 7;

                return (
                  <div
                    key={day}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isClaimed
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                        : isCurrent && !hasCheckedInToday
                        ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-600 ring-2 ring-orange-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <span className="text-[10px] font-bold block">Day {day}</span>
                    <span className="text-sm sm:text-base my-0.5 block">
                      {isClaimed ? '✓' : isJackpot ? '💎' : '🪙'}
                    </span>
                    <span className="text-[9px] font-mono font-black block">
                      {isJackpot ? '+100' : '+50'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 sm:space-x-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === 'catalog'
                  ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              🎁 {t('rewards.catalogTab') || 'Redeem Rewards'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vouchers')}
              className={`pb-2.5 transition-colors cursor-pointer flex items-center space-x-1 ${
                activeTab === 'vouchers'
                  ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <span>🎟️ {t('rewards.myVouchersTab') || 'My Vouchers'}</span>
              {redeemedVouchers.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-600 font-mono">
                  {redeemedVouchers.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              📜 {t('rewards.historyTab') || 'Points History'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tiers')}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === 'tiers'
                  ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              👑 {t('rewards.allTiersTab') || 'VIP Tiers'}
            </button>
          </div>

          {/* Tab 1: Redeem Rewards Catalog */}
          {activeTab === 'catalog' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {catalog.map((reward) => {
                  const canAfford = pointsBalance >= reward.pointsCost;
                  const isRedeeming = redeemingId === reward.id;

                  return (
                    <div
                      key={reward.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{reward.icon}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400">
                            {reward.badge}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          {reward.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {reward.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="font-mono text-xs font-black text-orange-600 dark:text-orange-400">
                          {reward.pointsCost} pts
                        </span>

                        <button
                          type="button"
                          disabled={!canAfford || isRedeeming}
                          onClick={() => handleRedeem(reward)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                            canAfford
                              ? 'bg-slate-900 dark:bg-orange-500 hover:bg-orange-600 text-white shadow-2xs cursor-pointer'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {isRedeeming
                            ? t('common.loading') || 'Redeeming...'
                            : canAfford
                            ? t('rewards.redeemBtn') || 'Redeem'
                            : t('rewards.needMorePts') || 'Need Points'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: My Vouchers */}
          {activeTab === 'vouchers' && (
            <div className="space-y-3">
              {redeemedVouchers.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <span className="text-4xl block">🎟️</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('rewards.noVouchersYet') || 'No vouchers redeemed yet.'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {t('rewards.redeemFirst') || 'Use your BitePoints to unlock instant discounts above.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {redeemedVouchers.map((v) => (
                    <div
                      key={v.instanceId || v.code}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{v.icon || '🎟️'}</span>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">
                            {v.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Code: <span className="font-bold text-orange-600 dark:text-orange-400">{v.code}</span> • Min order {formatUsd(v.minOrder || 0)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          applyVoucherToCheckout(v);
                          closeRewardsModal();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        {t('common.apply') || 'Use Now'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Points History Log */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {pointsHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  {t('rewards.noHistory') || 'No point transactions logged yet.'}
                </p>
              ) : (
                pointsHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                      <span className="text-[10px] text-slate-400">
                        {item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <span
                      className={`font-mono font-black ${
                        item.points > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.points > 0 ? `+${item.points}` : item.points} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: All VIP Tiers Guide */}
          {activeTab === 'tiers' && (
            <div className="space-y-3">
              {allTiers.map((tier) => {
                const isCurrent = currentTier?.id === tier.id;

                return (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-500 ring-2 ring-orange-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{tier.icon}</span>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          {tier.name}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-500 text-white">
                            Current Tier
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {tier.minPoints}+ pts
                      </span>
                    </div>

                    <div className="space-y-1">
                      {tier.perks.map((p, i) => (
                        <p key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                          <span>✓</span>
                          <span>{p}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={closeRewardsModal}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {t('common.close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
