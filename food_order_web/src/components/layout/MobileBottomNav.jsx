import { NavLink } from 'react-router-dom';
import { AppRoutes } from '../../routes/app_routes';
import { useCart } from '../../features/cart/use_cart';
import { useFavorites } from '../../features/favorites';
import { useTranslation } from '../../core';

export function MobileBottomNav() {
  const { t } = useTranslation();
  const { totalCount, openCart } = useCart();
  const { favoritesCount } = useFavorites();

  const getLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 py-1.5 transition-all active:scale-95 ${
      isActive
        ? 'text-orange-600 dark:text-orange-400 font-bold'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1 flex items-center justify-around transition-colors">
      {/* 1. Home */}
      <NavLink to={AppRoutes.ROOT} className={getLinkClass} end>
        <span className="text-lg leading-tight">🏠</span>
        <span className="text-[10px] tracking-tight mt-0.5">{t('navigation.home')}</span>
      </NavLink>

      {/* 2. Menu */}
      <NavLink to={AppRoutes.MENU} className={getLinkClass}>
        <span className="text-lg leading-tight">🍔</span>
        <span className="text-[10px] tracking-tight mt-0.5">{t('navigation.menu')}</span>
      </NavLink>

      {/* 3. Floating Cart Action */}
      <button
        onClick={openCart}
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-600 dark:text-slate-300 relative transition-transform active:scale-95"
        aria-label="View Cart"
      >
        <div className="relative">
          <div className="w-10 h-10 -mt-5 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-lg shadow-lg shadow-orange-500/30">
            🛍️
          </div>
          {totalCount > 0 && (
            <span className="absolute -top-6 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
              {totalCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mt-1">
          {t('navigation.cart')}
        </span>
      </button>

      {/* 4. Favorites */}
      <NavLink to={AppRoutes.FAVORITES} className={getLinkClass}>
        <div className="relative">
          <span className="text-lg leading-tight">❤️</span>
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
              {favoritesCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">{t('navigation.favorites')}</span>
      </NavLink>

      {/* 5. Orders */}
      <NavLink to={AppRoutes.ORDERS} className={getLinkClass}>
        <span className="text-lg leading-tight">📦</span>
        <span className="text-[10px] tracking-tight mt-0.5">{t('navigation.orders')}</span>
      </NavLink>
    </nav>
  );
}
