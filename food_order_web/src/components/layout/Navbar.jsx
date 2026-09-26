import { NavLink, Link } from 'react-router-dom';
import { AppConfig, AppAssets } from '../../core';
import { AppRoutes } from '../../routes/app_routes';
import { ThemeToggle } from '../common/ThemeToggle';

export function Navbar() {
  const getNavClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
      isActive
        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to={AppRoutes.ORDERS} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <img
              src={AppAssets.images.appIcon}
              alt="BiteCraft"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                BiteCraft
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 rounded-md">
                Admin Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Restaurant Operations & Kitchen Control
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
          <NavLink to={AppRoutes.ORDERS} className={getNavClass}>
            🍳 Orders Board
          </NavLink>
          <NavLink to={AppRoutes.MENU} className={getNavClass}>
            🍕 Food Menu
          </NavLink>
        </nav>

        {/* Status, Environment indicator & Theme Toggle */}
        <div className="flex items-center space-x-2.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
              AppConfig.isProd
                ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : AppConfig.isStaging
                ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            {AppConfig.env}
          </span>

          <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Connected</span>
          </div>

          {/* Theme Toggle Button */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
