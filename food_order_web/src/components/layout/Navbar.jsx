import { NavLink, Link } from 'react-router-dom';
import { AppConfig, AppAssets } from '../../core';
import { AppRoutes } from '../../routes/app_routes';

export function Navbar() {
  const getNavClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
      isActive
        ? 'bg-white text-slate-900 shadow-xs'
        : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
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
              <span className="text-lg font-bold tracking-tight text-slate-900">BiteCraft</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase bg-orange-100 text-orange-700 rounded-md">
                Admin Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Restaurant Operations & Kitchen Control</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <NavLink to={AppRoutes.ORDERS} className={getNavClass}>
            🍳 Orders Board
          </NavLink>
          <NavLink to={AppRoutes.MENU} className={getNavClass}>
            🍕 Food Menu
          </NavLink>
        </nav>

        {/* Status & Environment indicator */}
        <div className="flex items-center space-x-2.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
              AppConfig.isProd
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : AppConfig.isStaging
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-amber-100 text-amber-700 border-amber-200'
            }`}
          >
            {AppConfig.env}
          </span>
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
}
