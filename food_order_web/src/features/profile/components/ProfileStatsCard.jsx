import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { container } from '../../../core/di/container';
import { useFavorites } from '../../favorites';
import { useRewards } from '../../rewards';
import { useTranslation, soundService } from '../../../core';
import { AppRoutes } from '../../../routes/app_routes';

export function ProfileStatsCard() {
  const { t } = useTranslation();
  const { favoritesCount } = useFavorites();
  const { pointsBalance, currentTier, openRewardsModal } = useRewards();
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    container
      .getOrderRepository()
      .getMyOrders()
      .then((orders) => {
        if (isMounted && Array.isArray(orders)) {
          setOrdersCount(orders.length);
        }
      })
      .catch(() => {
        // Ignore if offline
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenRewards = () => {
    soundService.playPop();
    openRewardsModal();
  };

  const handleScrollToInsights = () => {
    soundService.playPop();
    const el = document.getElementById('spending-insights');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tierName = currentTier?.name || 'Bronze Tier';
  const tierIcon = currentTier?.badgeIcon || currentTier?.icon || '🥉';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Orders */}
      <Link
        to={AppRoutes.ORDERS}
        onClick={() => soundService.playPop()}
        className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-orange-500/50 hover:shadow-md transition-all text-center group flex flex-col items-center justify-center"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xl sm:text-2xl shadow-xs group-hover:scale-110 transition-transform">
          📦
        </div>
        <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
          {ordersCount}
        </span>
        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {t('profile.orders') || 'Orders'}
        </span>
      </Link>

      {/* 2. Rewards Points (Interactive Modal Trigger) */}
      <button
        type="button"
        onClick={handleOpenRewards}
        className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all text-center flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl sm:text-2xl shadow-xs group-hover:scale-110 transition-transform">
          {tierIcon}
        </div>
        <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
          {pointsBalance ?? 0}
        </span>
        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {t('profile.points') || 'BitePoints'}
        </span>
        <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 mt-0.5">
          {tierName}
        </span>
      </button>

      {/* 3. Favorites */}
      <Link
        to={AppRoutes.FAVORITES}
        onClick={() => soundService.playPop()}
        className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-rose-500/50 hover:shadow-md transition-all text-center group flex flex-col items-center justify-center"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl sm:text-2xl shadow-xs group-hover:scale-110 transition-transform">
          ❤️
        </div>
        <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
          {favoritesCount}
        </span>
        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {t('profile.favorites') || 'Favorites'}
        </span>
      </Link>

      {/* 4. Spending & Analytics Shortcut */}
      <button
        type="button"
        onClick={handleScrollToInsights}
        className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all text-center group flex flex-col items-center justify-center cursor-pointer"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl sm:text-2xl shadow-xs group-hover:scale-110 transition-transform">
          📊
        </div>
        <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
          Insights
        </span>
        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Spending & Taste
        </span>
      </button>
    </div>
  );
}
