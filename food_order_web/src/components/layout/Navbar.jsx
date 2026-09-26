import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AppAssets, useTranslation } from '../../core';
import { AppRoutes } from '../../routes/app_routes';
import { ThemeToggle, LanguageToggle } from '../common';
import { useCart } from '../../features/cart/use_cart';
import { useAuth } from '../../features/auth/use_auth';

export function Navbar() {
  const { t } = useTranslation();
  const { totalCount, openCart } = useCart();
  const { isAuthenticated, user, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
      isActive
        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  const getMobileNavClass = ({ isActive }) =>
    `block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      isActive
        ? 'bg-orange-500 text-white'
        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to={AppRoutes.ROOT} className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0">
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
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                {t('common.appName')}
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-md shrink-0">
                {t('common.location')}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              {t('common.tagline')}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <NavLink to={AppRoutes.ROOT} className={getNavClass} end>
            🏠 {t('navigation.home')}
          </NavLink>
          <NavLink to={AppRoutes.MENU} className={getNavClass}>
            🍔 {t('navigation.menu')}
          </NavLink>
          <NavLink to={AppRoutes.ORDERS} className={getNavClass}>
            📦 {t('navigation.orders')}
          </NavLink>
        </nav>

        {/* Right side controls: Cart, Auth, Language, Theme, Mobile toggle */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative p-2 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/70 border border-orange-200 dark:border-orange-900/60 text-orange-600 dark:text-orange-400 flex items-center space-x-1.5 transition-all active:scale-95 shadow-xs"
            aria-label="Open Cart"
          >
            <span className="text-base leading-none">🛍️</span>
            <span className="text-xs font-black hidden lg:inline">{t('navigation.cart')}</span>
            {totalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-orange-500 text-white animate-pulse">
                {totalCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-500 text-white font-black text-[10px] sm:text-xs flex items-center justify-center uppercase">
                {user?.username?.[0] || 'U'}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline max-w-[80px] truncate">
                {user?.username || 'Foodie'}
              </span>
              <button
                onClick={logout}
                className="text-[11px] text-slate-400 hover:text-rose-500 font-semibold ml-1 hidden sm:inline"
                title="Logout"
              >
                {t('navigation.logOut')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all hidden sm:block"
            >
              {t('navigation.signIn')}
            </button>
          )}

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
        <div className="md:hidden p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2 animate-in slide-in-from-top duration-200">
          <NavLink
            to={AppRoutes.ROOT}
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavClass}
            end
          >
            🏠 {t('navigation.home')}
          </NavLink>
          <NavLink
            to={AppRoutes.MENU}
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavClass}
          >
            🍔 {t('navigation.menu')}
          </NavLink>
          <NavLink
            to={AppRoutes.ORDERS}
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavClass}
          >
            📦 {t('navigation.orders')}
          </NavLink>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center uppercase shadow-sm">
                  {user?.username?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {user?.username || 'Foodie'}
                  </p>
                  <p className="text-[10px] text-slate-400">{user?.email || 'Logged in'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="px-3 py-1.5 text-xs text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
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
  );
}
