import { Link } from 'react-router-dom';
import { AppRoutes } from '../../routes/app_routes';

export function MenuView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Food Menu Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage restaurant dishes, pricing, inventory availability, and categories.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={AppRoutes.ORDERS}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            ← Back to Orders Board
          </Link>
        </div>
      </div>

      {/* Menu Feature Showcase Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center max-w-lg mx-auto my-8 shadow-xs transition-colors">
        <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
          🍕
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Food Menu Management</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Ready to be implemented with the MVI pattern (Model-View-Intent) and connected to <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-orange-600 dark:text-orange-400 font-mono">foodRepository</code> and <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-orange-600 dark:text-orange-400 font-mono">/foods</code> API.
        </p>
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Data & Domain Layer Ready</span>
        </div>
      </div>
    </div>
  );
}
