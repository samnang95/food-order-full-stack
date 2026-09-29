import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, formatUsd, formatKhr, soundService } from '../../core';
import { AppRoutes } from '../../routes/app_routes';
import { useRewards } from './use_rewards';
import { RewardTierEntity } from '../../domain/rewards/entities/reward_tier_entity';

export function RewardsView() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
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

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'wallet' | 'history' | 'guide'
  const [catalogFilter, setCatalogFilter] = useState('all');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [redeemingId, setRedeemingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedTierPreview, setSelectedTierPreview] = useState(currentTier?.id || 'silver');

  const allTiers = useMemo(() => RewardTierEntity.getTiers(), []);

  // Calculate monetary discount equivalent (100 pts = $1.00 USD)
  const discountEquivalentUsd = (pointsBalance / 100).toFixed(2);
  const discountEquivalentKhr = Math.round((pointsBalance / 100) * 4100);

  // Filter Catalog
  const filteredCatalog = useMemo(() => {
    if (catalogFilter === 'all') return catalog;
    if (catalogFilter === 'free_delivery') {
      return catalog.filter((r) => r.discountType === 'free_delivery');
    }
    if (catalogFilter === 'fixed') {
      return catalog.filter((r) => r.discountType === 'fixed');
    }
    if (catalogFilter === 'percent') {
      return catalog.filter((r) => r.discountType === 'percent');
    }
    return catalog;
  }, [catalog, catalogFilter]);

  // Filter Points History
  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return pointsHistory;
    return pointsHistory.filter((item) => item.type === historyFilter);
  }, [pointsHistory, historyFilter]);

  // Handle Redeem
  const handleRedeem = async (reward) => {
    setRedeemingId(reward.id);
    try {
      await redeemReward(reward);
    } catch {
      // Error handled in store
    } finally {
      setRedeemingId(null);
    }
  };

  // Handle Copy Voucher Code
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    soundService.playPop();
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Handle 1-Click Apply to Checkout
  const handleApplyVoucher = (voucher) => {
    soundService.playSuccess();
    applyVoucherToCheckout(voucher);
    navigate(AppRoutes.CHECKOUT);
  };

  // 7-Day Streak Rewards Definition
  const streakRewards = [
    { day: 1, pts: 10, label: '+10 pts' },
    { day: 2, pts: 15, label: '+15 pts' },
    { day: 3, pts: 20, label: '+20 pts' },
    { day: 4, pts: 25, label: '+25 pts' },
    { day: 5, pts: 30, label: '+30 pts' },
    { day: 6, pts: 40, label: '+40 pts' },
    { day: 7, pts: 100, label: 'JACKPOT +100', isJackpot: true },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>←</span>
            <span>Back</span>
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <span className="text-xl">🪙</span>
              <span>{t('rewards.hubTitle') || 'BitePoints VIP Rewards Hub'}</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {t('rewards.hubSubtitle') || 'Earn points on every bite & redeem exclusive gourmet vouchers'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={AppRoutes.MENU}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm shadow-orange-500/20"
          >
            <span>🍽️</span>
            <span>Order Food & Earn</span>
          </Link>
        </div>
      </div>

      {/* Hero VIP Status Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 border border-amber-500/30 shadow-xl">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Points & Balance */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-xs">
                <span>{currentTier?.icon || '🪙'}</span>
                <span>{currentTier?.name || 'Bronze Foodie'}</span>
              </span>

              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 font-bold text-xs">
                <span>⚡</span>
                <span>{currentTier?.multiplier || 1.0}x Points Multiplier</span>
              </span>

              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-xs">
                <span>🔥</span>
                <span>{streakDays}-Day Streak</span>
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                Available BitePoints Balance
              </p>
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                  {pointsBalance.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                  pts
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center space-x-1.5 pt-1">
                <span>💵 Equivalent Value:</span>
                <span className="font-extrabold text-white">${discountEquivalentUsd} USD</span>
                <span className="text-slate-400">({formatKhr(discountEquivalentKhr)})</span>
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2 flex-wrap gap-y-2">
              {!hasCheckedInToday ? (
                <button
                  type="button"
                  onClick={claimDailyCheckIn}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <span className="text-base">🎁</span>
                  <span>Claim Daily Bonus</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs flex items-center space-x-2">
                  <span>✓</span>
                  <span>Claimed for Today (+50 pts)</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>🎟️</span>
                <span>Redeem Vouchers</span>
              </button>
            </div>
          </div>

          {/* Right Column: Next Tier Progress Card */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Level Progression</span>
              {nextTier ? (
                <span className="font-bold text-amber-300">
                  {progressToNextTier}% to {nextTier.name}
                </span>
              ) : (
                <span className="font-bold text-emerald-400">Max VIP Tier Unlocked 👑</span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 transition-all duration-500 shadow-sm"
                style={{ width: `${progressToNextTier}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{lifetimePoints.toLocaleString()} lifetime pts</span>
              {nextTier && (
                <span>{nextTier.minPoints.toLocaleString()} pts required</span>
              )}
            </div>

            {nextTier && (
              <p className="text-[11px] text-amber-200/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                ⭐ Earn <strong>{(nextTier.minPoints - lifetimePoints).toLocaleString()}</strong> more points to reach{' '}
                <strong className="text-white">{nextTier.name}</strong> and unlock {nextTier.multiplier}x points boosters!
              </p>
            )}
          </div>
        </div>

        {/* Feedback Banners */}
        {streakClaimSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>🎉 Daily streak claimed! Bonus points added to your balance.</span>
            <button type="button" onClick={resetFeedback} className="text-white hover:underline text-xs">✕</button>
          </div>
        )}

        {redeemSuccessVoucher && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>🎟️ Voucher {redeemSuccessVoucher.code} redeemed! It is ready in your wallet.</span>
            <button type="button" onClick={resetFeedback} className="text-white hover:underline text-xs">✕</button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>⚠️ {error}</span>
            <button type="button" onClick={resetFeedback} className="text-white hover:underline text-xs">✕</button>
          </div>
        )}
      </div>

      {/* 7-Day Streak Check-in Tracker */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-9 h-9 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-lg font-black">
              🔥
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                7-Day Daily Check-in Streak
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Log in every day to claim bonus points. Complete Day 7 to unlock the +100 PTS Mega Jackpot!
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-3 py-1 rounded-xl">
              Current Streak: {streakDays} Days
            </span>
          </div>
        </div>

        {/* 7 Day Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
          {streakRewards.map((reward) => {
            const isCompleted = streakDays >= reward.day;
            const isToday = (streakDays + 1 === reward.day && !hasCheckedInToday) || (streakDays === reward.day && hasCheckedInToday);
            const isLocked = streakDays + 1 < reward.day;

            return (
              <div
                key={reward.day}
                className={`p-3.5 rounded-2xl border text-center transition-all relative overflow-hidden flex flex-col items-center justify-between min-h-[110px] ${
                  reward.isJackpot
                    ? 'border-amber-400 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:border-amber-500/60 shadow-xs'
                    : isCompleted
                    ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : isToday
                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 shadow-xs ring-2 ring-orange-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 opacity-75'
                }`}
              >
                {reward.isJackpot && (
                  <span className="absolute top-1.5 right-1.5 text-[8px] font-black uppercase bg-amber-500 text-slate-950 px-1 rounded">
                    Jackpot
                  </span>
                )}

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Day {reward.day}
                </span>

                <div className="my-1.5">
                  {isCompleted ? (
                    <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold mx-auto">
                      ✓
                    </span>
                  ) : reward.isJackpot ? (
                    <span className="text-2xl animate-pulse">👑</span>
                  ) : (
                    <span className="text-xl">🪙</span>
                  )}
                </div>

                <div>
                  <p className={`text-xs font-black ${
                    reward.isJackpot
                      ? 'text-amber-600 dark:text-amber-400'
                      : isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {reward.label}
                  </p>
                  <span className="text-[9px] text-slate-400">
                    {isCompleted ? 'Claimed' : isToday && !hasCheckedInToday ? 'Ready!' : isLocked ? 'Locked' : 'Today'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VIP Tier Progression Roadmap */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-black">
              🏆
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                VIP Tier Status Roadmap
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Climb the ranks from Bronze to Platinum to unlock higher multipliers and VIP concierge perks
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {allTiers.map((tier) => {
            const isCurrent = currentTier?.id === tier.id;
            const isSelected = selectedTierPreview === tier.id;
            const isUnlocked = lifetimePoints >= tier.minPoints;

            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTierPreview(tier.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isCurrent
                    ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-xs'
                    : isSelected
                    ? 'border-amber-400 dark:border-amber-500 bg-slate-50/80 dark:bg-slate-800/50'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-orange-500 text-white font-black text-[9px] uppercase tracking-wider shadow-xs">
                    Current Tier
                  </span>
                )}

                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{tier.icon}</span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {tier.name}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {tier.minPoints === 0 ? 'Entry Level' : `${tier.minPoints.toLocaleString()}+ pts`}
                    </p>
                  </div>
                </div>

                <div className="mb-3 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-orange-600 dark:text-orange-400 flex items-center justify-between">
                  <span>Points Booster</span>
                  <span>{tier.multiplier}x</span>
                </div>

                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  {tier.perks.map((perk, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5">
                      <span className="text-emerald-500 text-[10px]">✓</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">
                    {isUnlocked ? 'Status' : 'Requirement'}
                  </span>
                  <span className={`font-bold ${isUnlocked ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {isUnlocked ? 'Unlocked ✓' : `Need ${(tier.minPoints - lifetimePoints).toLocaleString()} pts`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs for Catalog / Wallet / History / Guide */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>🎟️</span>
          <span>Redeem Vouchers</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {catalog.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'wallet'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>💼</span>
          <span>My Redeemed Wallet</span>
          {redeemedVouchers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
              {redeemedVouchers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>📜</span>
          <span>Points History</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>💡</span>
          <span>How to Earn</span>
        </button>
      </div>

      {/* Tab 1: Voucher Redemption Marketplace (Catalog) */}
      {activeTab === 'catalog' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Catalog Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Deals' },
              { id: 'fixed', label: '$ Value Off' },
              { id: 'percent', label: '% Percentage Off' },
              { id: 'free_delivery', label: 'Free Delivery' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCatalogFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogFilter === f.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map((reward) => {
              const canAfford = pointsBalance >= reward.pointsCost;
              const isRedeeming = redeemingId === reward.id;

              return (
                <div
                  key={reward.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-orange-500/40 hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  {reward.badge && (
                    <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[9px] font-black uppercase tracking-wider">
                      {reward.badge}
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl shadow-2xs">
                      {reward.icon}
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {reward.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {reward.description}
                      </p>
                    </div>

                    {reward.minOrder > 0 && (
                      <p className="text-[10px] text-slate-400 font-medium">
                        Min. order: {formatUsd(reward.minOrder)}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400">Cost:</span>
                      <span className="text-sm font-black text-orange-600 dark:text-orange-400 font-mono ml-1">
                        {reward.pointsCost} pts
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford || isRedeeming}
                      onClick={() => handleRedeem(reward)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                        canAfford
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 active:scale-95 cursor-pointer'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isRedeeming ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : canAfford ? (
                        <span>Redeem Voucher</span>
                      ) : (
                        <span>Need {reward.pointsCost - pointsBalance} more pts</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: My Redeemed Vouchers Wallet */}
      {activeTab === 'wallet' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {redeemedVouchers.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-3 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-5xl block">🎟️</span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                No Redeemed Vouchers Yet
              </h3>
              <p className="text-xs text-slate-400">
                You have not redeemed any vouchers. Convert your available BitePoints into discounts right now!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className="mt-2 px-5 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20 cursor-pointer"
              >
                Browse Rewards Catalog →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redeemedVouchers.map((voucher) => (
                <div
                  key={voucher.id || voucher.code}
                  className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-orange-500/40 dark:border-orange-500/30 p-5 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl shrink-0">
                        {voucher.icon || '🎟️'}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {voucher.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {voucher.discountType === 'percent'
                            ? `${voucher.discountValue}% OFF total order`
                            : voucher.discountType === 'free_delivery'
                            ? 'Free Express Delivery'
                            : `${formatUsd(voucher.discountValue)} instant discount`}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                      Active
                    </span>
                  </div>

                  {/* Promo Code Box */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                        Promo Code
                      </span>
                      <span className="font-mono text-sm font-black text-slate-900 dark:text-white tracking-wider">
                        {voucher.code}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(voucher.code)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-orange-50 text-orange-600 dark:text-orange-300 text-xs font-bold transition-all shadow-2xs border border-slate-200 dark:border-slate-600 cursor-pointer"
                    >
                      {copiedCode === voucher.code ? '✓ Copied!' : 'Copy Code'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      Redeemed {voucher.redeemedAt ? new Date(voucher.redeemedAt).toLocaleDateString() : 'Recently'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleApplyVoucher(voucher)}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors flex items-center space-x-1 shadow-sm shadow-orange-500/20 cursor-pointer"
                    >
                      <span>Apply to Checkout →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Points Transaction History Ledger */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Points Ledger & History
              </h3>
              <p className="text-[11px] text-slate-400">
                Detailed audit of all points earned from deliveries, streaks, and redemptions
              </p>
            </div>

            <div className="flex items-center space-x-1.5">
              {[
                { id: 'all', label: 'All Activities' },
                { id: 'earned', label: 'Earned (+)' },
                { id: 'spent', label: 'Spent (-)' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setHistoryFilter(f.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    historyFilter === f.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No points transactions found for this filter.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredHistory.map((item) => {
                const isEarned = item.type === 'earned';
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-black ${
                        isEarned
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}>
                        {isEarned ? '🪙' : '🎟️'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {new Date(item.date).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <span className={`text-xs font-black font-mono px-2.5 py-1 rounded-xl ${
                      isEarned
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    }`}>
                      {isEarned ? `+${item.points} pts` : `-${item.points} pts`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: How to Earn Points Guide */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {[
            {
              icon: '🍽️',
              title: 'Dine & Order Delivery',
              desc: 'Earn 10 BitePoints for every $1 spent across our entire menu. Points reflect immediately upon order confirmation.',
              perk: '10 pts per $1',
            },
            {
              icon: '🔥',
              title: 'Daily Streak Check-in',
              desc: 'Check in every day to claim bonus points that escalate from +10 pts on Day 1 to a +100 pts jackpot on Day 7.',
              perk: 'Up to +100 pts/wk',
            },
            {
              icon: '⭐',
              title: 'Review Dishes with Photos',
              desc: 'Help other foodies discover top dishes! Submit a rating and photo review to earn +15 bonus points.',
              perk: '+15 pts per review',
            },
            {
              icon: '👥',
              title: 'Group Orders & Split Bill',
              desc: 'Host a group meal with colleagues or friends. All participants earn individual points on their portion of the bill.',
              perk: 'Bonus Group Perks',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-3xl block">{item.icon}</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Reward</span>
                <span className="font-black text-orange-600 dark:text-orange-400">
                  {item.perk}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-orange-500/20">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-black">
            Ready to spend your BitePoints discounts?
          </h3>
          <p className="text-xs sm:text-sm text-white/90">
            Apply your vouchers at checkout and savor Phnom Penh's finest artisan cuisine.
          </p>
        </div>

        <Link
          to={AppRoutes.MENU}
          className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-black text-xs hover:bg-slate-100 transition-colors shadow-md whitespace-nowrap active:scale-95"
        >
          Explore Menu Now →
        </Link>
      </div>
    </div>
  );
}
