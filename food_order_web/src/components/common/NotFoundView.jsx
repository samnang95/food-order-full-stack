import { Link } from 'react-router-dom';
import { AppRoutes } from '../../routes/app_routes';

export function NotFoundView() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center max-w-md mx-auto my-12 shadow-xs transition-colors">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-extrabold">
        404
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to={AppRoutes.ORDERS}
        className="inline-block bg-slate-900 dark:bg-orange-500 hover:bg-slate-800 dark:hover:bg-orange-600 text-white font-semibold text-xs py-2.5 px-5 rounded-xl transition-colors shadow-xs cursor-pointer"
      >
        ← Return to Orders Board
      </Link>
    </div>
  );
}
