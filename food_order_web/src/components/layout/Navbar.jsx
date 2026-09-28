import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { container } from '../../core/di/container';
import { AppAssets, useTranslation } from '../../core';
import { AppRoutes, getCategoryDetailRoute } from '../../routes/app_routes';
import { getCategoryIcon } from '../../features/categories';
import { ThemeToggle, LanguageToggle } from '../common';
import { useCart } from '../../features/cart/use_cart';
import { useAuth } from '../../features/auth/use_auth';
import { useFavorites } from '../../features/favorites';
import { useNotifications, NotificationDropdown } from '../../features/notifications';
import { NavbarRewardsPill, useRewards } from '../../features/rewards';
import { useGroupOrder } from '../../features/group_order';
import { useDietary } from '../../features/dietary';

export function Navbar() {
  const { t } = useTranslation();
  const { totalCount, openCart } = useCart();
  const { isAuthenticated, user, openAuthModal, logout } = useAuth();
  const { favoritesCount } = useFavorites();
  const { unreadCount, toggleDropdown } = useNotifications();
  const { currentTier, pointsBalance, openRewardsModal } = useRewards();
  const { isGroupOrderActive, groupOrder, openGroupModal } = useGroupOrder();
  const { preferences, openPreferencesModal } = useDietary();
  const dietaryAlertsCount = (preferences?.activeDiets?.length || 0) + (preferences?.allergensToAvoid?.length || 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesHovered, setCategoriesHovered] = useState(false);
  const [dealsHovered, setDealsHovered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    container.getCategoriesUseCase
      .execute()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setCategories(data.slice(0, 6));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const getNavClass = ({ isActive }) =>
    `group inline-flex items-center justify-center space-x-1.5 whitespace-nowrap px-2.5 py-1.5 xl:px-3 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 ${
      isActive
        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-1 ring-orange-400/40 hover:bg-orange-600'
        : 'text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-slate-700/90 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0'
    }`;

  const getMobileNavClass = ({ isActive }) =>
    `flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      isActive
        ? 'bg-orange-500 text-white'
        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 h-16 sm:h-18 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <Link to={AppRoutes.ROOT} className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0 min-w-max">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform shrink-0">
            <img
              src={AppAssets.images.appIcon}
              alt="BiteCraft"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="shrink-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                {t('common.appName')}
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-md shrink-0">
                {t('common.location')}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden 2xl:block whitespace-nowrap">
              {t('common.tagline')}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-0.5 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
          <NavLink to={AppRoutes.ROOT} className={getNavClass} end>
            <span>{t('navigation.home')}</span>
          </NavLink>

          {/* Categories Tab with Hover Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCategoriesHovered(true)}
            onMouseLeave={() => setCategoriesHovered(false)}
          >
            <NavLink to={AppRoutes.CATEGORIES} className={getNavClass}>
              <span>{t('navigation.categories')}</span>
              <span className="text-[9px] opacity-50 group-hover:opacity-100 transition-opacity">▾</span>
            </NavLink>

            {/* Hover Categories Dropdown Popover */}
            {categoriesHovered && (
              <div className="absolute left-0 top-full pt-2 z-50 w-60 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 space-y-1">
                  <div className="px-2.5 py-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <span>Popular Cuisines</span>
                    <Link
                      to={AppRoutes.CATEGORIES}
                      className="text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      All →
                    </Link>
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id || cat._id || cat.name}
                      to={getCategoryDetailRoute(cat.id || cat._id || cat.name)}
                      className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group/item"
                    >
                      <span className="text-base group-hover/item:scale-110 transition-transform">
                        {getCategoryIcon(cat.name, cat.icon)}
                      </span>
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  ))}
                  <Link
                    to={AppRoutes.CATEGORIES}
                    className="block text-center py-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 rounded-xl transition-colors mt-1"
                  >
                    View All Categories →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <NavLink to={AppRoutes.MENU} className={getNavClass}>
            <span>{t('navigation.menu')}</span>
          </NavLink>

          {/* Deals Tab with Hover Badge Preview */}
          <div
            className="relative"
            onMouseEnter={() => setDealsHovered(true)}
            onMouseLeave={() => setDealsHovered(false)}
          >
            <NavLink to={AppRoutes.VOUCHERS} className={getNavClass}>
              <span>{t('navigation.deals')}</span>
            </NavLink>

            {dealsHovered && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-1 duration-150 pointer-events-none">
                <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg flex items-center space-x-1">
                  <span>🔥</span>
                  <span>Save up to 20% OFF</span>
                </div>
              </div>
            )}
          </div>

          <NavLink to={AppRoutes.ORDERS} className={getNavClass}>
            <span>{t('navigation.orders')}</span>
          </NavLink>

          <NavLink to={AppRoutes.FAVORITES} className={getNavClass}>
            {({ isActive }) => (
              <span className="inline-flex items-center space-x-1.5">
                <span>{t('navigation.favorites')}</span>
                {favoritesCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-black transition-colors ${
                      isActive
                        ? 'bg-white text-orange-600'
                        : 'bg-rose-500 text-white group-hover:scale-105'
                    }`}
                  >
                    {favoritesCount}
                  </span>
                )}
              </span>
            )}
          </NavLink>
        </nav>

        {/* Right side controls: Rewards, Search, Cart, Auth, Language, Theme, Mobile toggle */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 xl:space-x-1.5 2xl:space-x-2 shrink-0">
          {/* BitePoints VIP Rewards Pill */}
          <div className="hidden md:inline-flex shrink-0">
            <NavbarRewardsPill />
          </div>

          {/* Group Order Pill */}
          <button
            type="button"
            onClick={openGroupModal}
            className={`hidden md:inline-flex p-2 sm:px-2.5 py-1.5 2xl:px-3 rounded-xl border items-center space-x-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-95 shrink-0 ${
              isGroupOrderActive
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-sm shadow-orange-500/20'
                : 'bg-slate-100 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400'
            }`}
            title={t('groupOrder.navTooltip', 'Group Order & Split Bill')}
          >
            <span className="text-base leading-none">👥</span>
            {isGroupOrderActive ? (
              <span className="text-xs font-black font-mono">
                {groupOrder?.code}
              </span>
            ) : (
              <span className="text-xs font-bold hidden 2xl:inline">
                {t('groupOrder.groupOrder', 'Group Order')}
              </span>
            )}
            {isGroupOrderActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          {/* Dietary & Allergens Preferences Pill */}
          <button
            type="button"
            onClick={openPreferencesModal}
            className={`hidden md:inline-flex p-2 sm:px-2.5 py-1.5 2xl:px-3 rounded-xl border items-center space-x-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-95 shrink-0 ${
              dietaryAlertsCount > 0
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300'
                : 'bg-slate-100 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400'
            }`}
            title={t('dietary.preferencesTooltip', 'Customize dietary lifestyle & allergen alerts')}
          >
            <span className="text-base leading-none">🥗</span>
            <span className="text-xs font-bold hidden 2xl:inline">
              {t('dietary.dietNav', 'Diet')}
            </span>
            {dietaryAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                {dietaryAlertsCount}
              </span>
            )}
          </button>

          {/* Quick Search Button */}
          <Link
            to={AppRoutes.SEARCH}
            className="p-2 rounded-xl bg-slate-100 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-orange-500/40 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center space-x-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-95 shrink-0"
            aria-label="Search"
            title={t('navigation.search', 'Search')}
          >
            <span className="text-base leading-none">🔍</span>
            <span className="text-xs font-bold hidden 2xl:inline">{t('navigation.search')}</span>
          </Link>

          {/* Notifications Bell Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={toggleDropdown}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-orange-500/40 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center space-x-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-95"
              aria-label="Notifications"
              title={t('navigation.notifications', 'Notifications')}
            >
              <span className="text-base leading-none">🔔</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-orange-500 text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown />
          </div>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative p-2 sm:px-2.5 py-1.5 2xl:px-3 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-950/70 border border-orange-200 dark:border-orange-900/60 hover:border-orange-400 text-orange-600 dark:text-orange-400 flex items-center space-x-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-orange-500/15 active:scale-95 shrink-0"
            aria-label="Open Cart"
            title={t('navigation.cart', 'Cart')}
          >
            <span className="text-base leading-none">🛍️</span>
            <span className="text-xs font-black hidden 2xl:inline">{t('navigation.cart')}</span>
            {totalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-orange-500 text-white animate-pulse">
                {totalCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {isAuthenticated ? (
            <Link
              to={AppRoutes.PROFILE}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700/80 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs shrink-0"
              title={user?.username || 'Profile'}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-orange-500 text-white font-black text-[10px] sm:text-xs flex items-center justify-center uppercase shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  user?.username?.[0] || 'U'
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden 2xl:inline max-w-[80px] truncate">
                {user?.username || 'Foodie'}
              </span>
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all shrink-0 whitespace-nowrap"
            >
              {t('navigation.signIn')}
            </button>
          )}

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Settings Quick Link */}
          <Link
            to={AppRoutes.SETTINGS}
            className="hidden sm:flex p-2 rounded-xl bg-slate-100 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-orange-500/40 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 items-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-95 shrink-0"
            title={t('settings.navTooltip', 'Settings & Preferences')}
            aria-label="Settings"
          >
            <span className="text-base leading-none">⚙️</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>


      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2 animate-in slide-in-from-top duration-200">
          <NavLink
            to={AppRoutes.ROOT}
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavClass}
            end
          >
            {t('navigation.home')}
          </NavLink>
          <NavLink
            to={AppRoutes.SEARCH}
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavClass}
          >
            {t('navigation.search')}
          </NavLink>
          <NavLink
            to={AppRoutes.CATEGORIES}
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavClass}
          >
            {t('navigation.categories')}
          </NavLink>
          <NavLink
            to={AppRoutes.MENU}
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavClass}
          >
            {t('navigation.menu')}
          </NavLink>
          <NavLink
            to={AppRoutes.VOUCHERS}
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavClass}
          >
            {t('navigation.deals')}
          </NavLink>
          <NavLink
            to={AppRoutes.ORDERS}
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavClass}
          >
            {t('navigation.orders')}
          </NavLink>
          <NavLink
            to={AppRoutes.FAVORITES}
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavClass}
          >
            <div className="flex items-center justify-between w-full">
              <span>{t('navigation.favorites')}</span>
              {favoritesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                  {favoritesCount}
                </span>
              )}
            </div>
          </NavLink>

          <NavLink
            to={AppRoutes.NOTIFICATIONS}
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavClass}
          >
            <div className="flex items-center justify-between w-full">
              <span>{t('navigation.notifications') || 'Notifications'}</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white">
                  {unreadCount}
                </span>
              )}
            </div>
          </NavLink>

          {/* Mobile BitePoints Banner */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openRewardsModal();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{currentTier?.icon || '🪙'}</span>
              <span>BitePoints Rewards</span>
            </div>
            <span className="font-mono text-orange-600 dark:text-orange-400 font-black">
              {pointsBalance} pts →
            </span>
          </button>

          {/* Mobile Group Order Button */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openGroupModal();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">👥</span>
              <span>{t('groupOrder.groupOrder', 'Group Order & Split Bill')}</span>
            </div>
            {isGroupOrderActive ? (
              <span className="font-mono bg-orange-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">
                {groupOrder.code}
              </span>
            ) : (
              <span className="text-orange-500">➔</span>
            )}
          </button>

          {/* Mobile Dietary & Allergen Preferences Button */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openPreferencesModal();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">🥗</span>
              <span>{t('dietary.preferencesTitle', 'Dietary & Allergen Safety')}</span>
            </div>
            {dietaryAlertsCount > 0 ? (
              <span className="font-mono bg-amber-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">
                {dietaryAlertsCount} {t('dietary.active', 'active')}
              </span>
            ) : (
              <span className="text-orange-500">➔</span>
            )}
          </button>

          <NavLink
            to={AppRoutes.SETTINGS}
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavClass}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">⚙️</span>
              <span>{t('settings.title', 'Settings & Preferences')}</span>
            </div>
          </NavLink>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 px-2">
              <Link
                to={AppRoutes.PROFILE}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-500 text-white font-black text-xs flex items-center justify-center uppercase shadow-sm shrink-0">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    user?.username?.[0] || 'U'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.username || 'Foodie'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'Logged in'}</p>
                </div>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  {t('navigation.profile')} →
                </span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-2 py-1.5 text-xs text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                {t('navigation.logOut')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('login');
              }}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold text-center"
            >
              {t('navigation.signIn')}
            </button>
          )}
        </div>
      )}

    </header>
      {/* Spacer preserving exact document flow height below fixed appbar */}
      <div className="h-16 sm:h-18 shrink-0" aria-hidden="true" />
    </>
  );
}
