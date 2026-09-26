import { Link } from 'react-router-dom';
import { AppRoutes } from '../../routes/app_routes';

export function NotFoundView() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-12 text-center max-w-md mx-auto my-8 sm:my-12 shadow-xs transition-colors">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-extrabold">
        404
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to={AppRoutes.ROOT}
        className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md shadow-orange-500/20 cursor-pointer"
      >
        ← Return to Home
      </Link>
    </div>
  );
}
