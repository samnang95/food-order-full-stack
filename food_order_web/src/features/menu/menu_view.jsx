import { Link } from 'react-router-dom';
import { AppRoutes } from '../../routes/app_routes';

export function MenuView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Food Menu Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage restaurant dishes, pricing, inventory availability, and categories.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={AppRoutes.ORDERS}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            ← Back to Orders Board
          </Link>
        </div>
      </div>

      {/* Menu Feature Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
          🍕
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Food Menu Management</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          Ready to be implemented with the MVI pattern (Model-View-Intent) and connected to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-orange-600 font-mono">foodRepository</code> and <code className="bg-slate-100 px-1.5 py-0.5 rounded text-orange-600 font-mono">/foods</code> API.
        </p>
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Data & Domain Layer Ready</span>
        </div>
      </div>
    </div>
  );
}
