import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { container } from '../../../core/di/container';
import { formatUsd, formatKhr, useTranslation, soundService } from '../../../core';
import { AppRoutes } from '../../../routes/app_routes';
import { useCart } from '../../cart/use_cart';

export function SpendingInsightsCard() {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // 'all' | '30d' | 'year'
  const [hoveredBar, setHoveredBar] = useState(null);
  const [reorderedId, setReorderedId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    container.getOrderAnalyticsUseCase
      .execute()
      .then((data) => {
        if (isMounted) {
          setAnalytics(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('[SpendingInsightsCard] Error loading order analytics:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter calculations based on time range
  const displayMetrics = useMemo(() => {
    if (!analytics) return null;

    let { totalSpent, totalSavings, totalOrders, deliveredCount, averageOrderValue, monthlySpending, topDishes, habits } = analytics;

    if (timeRange === '30d' && Array.isArray(monthlySpending) && monthlySpending.length > 0) {
      const currentMonth = monthlySpending[monthlySpending.length - 1];
      const monthSpent = currentMonth?.spent || 0;
      const monthOrders = currentMonth?.orders || 0;
      return {
        totalSpent: monthSpent,
        totalSavings: Number((totalSavings * (monthOrders / Math.max(1, totalOrders))).toFixed(2)),
        totalOrders: monthOrders,
        deliveredCount: monthOrders,
        averageOrderValue: monthOrders > 0 ? Number((monthSpent / monthOrders).toFixed(2)) : 0,
        monthlySpending: monthlySpending.slice(-2),
        topDishes,
        habits,
      };
    }

    return {
      totalSpent,
      totalSavings,
      totalOrders,
      deliveredCount,
      averageOrderValue,
      monthlySpending: monthlySpending || [],
      topDishes: topDishes || [],
      habits: habits || {},
    };
  }, [analytics, timeRange]);

  const handleQuickReorder = (dish) => {
    if (!dish) return;
    soundService.playPop();
    addItem(
      {
        id: dish.foodId || `dish_${dish.name.toLowerCase().replace(/\s+/g, '_')}`,
        name: dish.name,
        price: dish.totalSpent && dish.quantity ? Number((dish.totalSpent / dish.quantity).toFixed(2)) : 5.0,
        imageUrl: dish.imageUrl || '',
      },
      1
    );
    setReorderedId(dish.name);
    setTimeout(() => setReorderedId(null), 1800);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs animate-pulse space-y-6">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
          ))}
        </div>
        <div className="h-44 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
      </div>
    );
  }

  const isEmpty = !displayMetrics || displayMetrics.totalOrders === 0;

  return (
    <div
      id="spending-insights"
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors"
    >
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-2xl shadow-md shadow-orange-500/20 shrink-0">
            📊
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('profile.spendingInsightsTitle', 'Spending & Taste Insights')}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('profile.spendingInsightsSubtitle', 'Track your food spending trends, voucher savings & dining habits')}
            </p>
          </div>
        </div>

        {/* Time Window Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80 self-start sm:self-auto">
          {[
            { id: 'all', label: 'All Time' },
            { id: '30d', label: 'Last 30 Days' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundService.playPop();
                setTimeRange(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === tab.id
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="py-12 text-center max-w-sm mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
            🍽️
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              No orders to analyze yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Once you place orders with BiteCraft, your monthly spendings, favorite dishes, and coupon savings will automatically appear here!
            </p>
          </div>
          <Link
            to={AppRoutes.MENU}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
          >
            <span>Explore Menu</span>
            <span>→</span>
          </Link>
        </div>
      ) : (
        <div className="pt-6 space-y-8 relative z-10">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Total Spent */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 transition-all hover:border-orange-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Spent
                </span>
                <span className="text-base">💳</span>
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {formatUsd(displayMetrics.totalSpent)}
                </span>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                  ≈ {formatKhr(displayMetrics.totalSpent * 4100)}
                </p>
              </div>
            </div>

            {/* 2. Voucher Savings */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-900/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Voucher Savings
                </span>
                <span className="text-base">🏷️</span>
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {displayMetrics.totalSavings > 0 ? `-${formatUsd(displayMetrics.totalSavings)}` : '$0.00'}
                </span>
                <p className="text-[11px] font-semibold text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 flex items-center space-x-1">
                  <span>🔥 Smart Savings</span>
                </p>
              </div>
            </div>

            {/* 3. Orders Completed */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 transition-all hover:border-orange-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Orders Delivered
                </span>
                <span className="text-base">📦</span>
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {displayMetrics.deliveredCount}
                </span>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                  of {displayMetrics.totalOrders} total placed
                </p>
              </div>
            </div>

            {/* 4. Average Order Value */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 transition-all hover:border-orange-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Avg. Order Value
                </span>
                <span className="text-base">📈</span>
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {formatUsd(displayMetrics.averageOrderValue)}
                </span>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                  per delivery
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Spending Trend Bar Chart (Pure SVG) */}
          {displayMetrics.monthlySpending.length > 0 && (
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl p-5 sm:p-6 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>Monthly Spending Trend</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      (Last 6 Months)
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hover over bars to inspect spend & order volume
                  </p>
                </div>

                {hoveredBar && (
                  <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in duration-150">
                    <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                      {hoveredBar.month} {hoveredBar.year}: {formatUsd(hoveredBar.spent)} ({hoveredBar.orders} orders)
                    </span>
                  </div>
                )}
              </div>

              {/* Responsive SVG Bar Chart */}
              <div className="h-44 sm:h-52 w-full pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="barPeakGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ea580c" stopOpacity="1" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline lines */}
                  <line x1="0" y1="120" x2="600" y2="120" stroke="currentColor" strokeDasharray="4 4" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <line x1="0" y1="60" x2="600" y2="60" stroke="currentColor" strokeDasharray="4 4" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <line x1="0" y1="0" x2="600" y2="0" stroke="currentColor" strokeDasharray="4 4" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />

                  {/* Bars */}
                  {displayMetrics.monthlySpending.map((item, idx) => {
                    const totalBars = displayMetrics.monthlySpending.length;
                    const maxVal = Math.max(...displayMetrics.monthlySpending.map((m) => m.spent), 20);
                    const barHeight = Math.max(10, (item.spent / maxVal) * 110);
                    const barWidth = 44;
                    const slotWidth = 600 / totalBars;
                    const x = idx * slotWidth + (slotWidth - barWidth) / 2;
                    const y = 120 - barHeight;

                    const isHovered = hoveredBar?.key === item.key;

                    return (
                      <g
                        key={item.key}
                        className="cursor-pointer transition-transform duration-200"
                        onMouseEnter={() => setHoveredBar(item)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {/* Bar Body */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx="8"
                          fill={item.isPeak ? 'url(#barPeakGradient)' : 'url(#barGradient)'}
                          className={`transition-all duration-200 ${
                            isHovered ? 'filter drop-shadow(0 4px 8px rgba(249,115,22,0.4)) opacity-100' : 'opacity-85'
                          }`}
                        />

                        {/* Peak Month Badge on top */}
                        {item.isPeak && item.spent > 0 && (
                          <text
                            x={x + barWidth / 2}
                            y={Math.max(12, y - 8)}
                            textAnchor="middle"
                            className="fill-orange-600 dark:fill-orange-400 text-[10px] font-black"
                          >
                            ⭐ Peak
                          </text>
                        )}

                        {/* Amount Value */}
                        {item.spent > 0 && (
                          <text
                            x={x + barWidth / 2}
                            y={Math.min(112, y + 16)}
                            textAnchor="middle"
                            className="fill-white text-[10px] font-extrabold"
                          >
                            ${Math.round(item.spent)}
                          </text>
                        )}

                        {/* Month Label below baseline */}
                        <text
                          x={x + barWidth / 2}
                          y="142"
                          textAnchor="middle"
                          className="fill-slate-500 dark:fill-slate-400 text-[11px] font-bold"
                        >
                          {item.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* Bottom Split: Top Dishes & Dining Habits */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Top Favorite Dishes (7 cols) */}
            <div className="lg:col-span-7 bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl p-5 sm:p-6 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>Top Favorite Dishes</span>
                    <span className="text-xs">🏆</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your most reordered food items on BiteCraft
                  </p>
                </div>
              </div>

              {displayMetrics.topDishes.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Order more dishes to unlock your top favorites ranking!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {displayMetrics.topDishes.map((dish, rank) => {
                    const isReordered = reorderedId === dish.name;
                    return (
                      <div
                        key={dish.name}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-3.5 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-orange-500/40 transition-colors"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              rank === 0
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 ring-1 ring-amber-400/50'
                                : rank === 1
                                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400'
                            }`}
                          >
                            #{rank + 1}
                          </span>
                          {dish.imageUrl ? (
                            <img
                              src={dish.imageUrl}
                              alt={dish.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center text-lg shrink-0">
                              🍜
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {dish.name}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                              {dish.quantity}x ordered • Total spent {formatUsd(dish.totalSpent)}
                            </p>
                          </div>
                        </div>

                        {/* Quick Reorder Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickReorder(dish)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shrink-0 ${
                            isReordered
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs shadow-orange-500/20 active:scale-95'
                          }`}
                        >
                          <span>{isReordered ? '✓ Added' : '+ Add'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Dining Habits & Savings Tip (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Habits Card */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl p-5 sm:p-6 border border-slate-200/60 dark:border-slate-800 space-y-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Dining Habits</span>
                  <span className="text-xs">✨</span>
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">⏰</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Peak Time Slot
                      </span>
                    </div>
                    <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                      {displayMetrics.habits?.topTimeSlot || 'Dinner (18:00 - 21:00)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">📅</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Favorite Day
                      </span>
                    </div>
                    <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                      {displayMetrics.habits?.topDay || 'Friday'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">💳</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Payment Choice
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {displayMetrics.habits?.preferredPayment || 'Bakong KHQR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings Advice Card */}
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-orange-500/5 rounded-3xl p-5 border border-amber-200/60 dark:border-amber-900/40">
                <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-1.5">
                  <span>💡 Foodie Tip</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Want to increase your savings? Check out available promo codes in the Deals tab before checking out to get up to 20% discount on orders over $15!
                </p>
                <div className="pt-3">
                  <Link
                    to={AppRoutes.VOUCHERS}
                    className="inline-flex items-center space-x-1.5 text-xs font-black text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    <span>Browse Active Deals</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
