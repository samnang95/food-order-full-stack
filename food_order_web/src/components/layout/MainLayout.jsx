import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { CartDrawer } from '../../features/cart/components/CartDrawer';
import { CheckoutModal } from '../../features/cart/components/CheckoutModal';
import { AuthModal } from '../../features/auth/components/AuthModal';
import { AppRoutes } from '../../routes/app_routes';
import { AppAssets } from '../../core';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Outlet */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Checkout Modal */}
      <CheckoutModal />

      {/* Authentication Modal */}
      <AuthModal />

      {/* Rich Customer Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-orange-500/20">
                  <img
                    src={AppAssets.images.appIcon}
                    alt="BiteCraft"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  BiteCraft Phnom Penh
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Handcrafted artisan smash burgers, wood-fired pizzas, noodle bowls, and drinks made with fresh ingredients and delivered hot to your doorstep.
              </p>
              <div className="flex items-center space-x-2 pt-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  Bakong KHQR Accepted
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  Cash on Delivery
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <Link to={AppRoutes.ROOT} className="hover:text-orange-500 transition-colors">
                    Home Page
                  </Link>
                </li>
                <li>
                  <Link to={AppRoutes.MENU} className="hover:text-orange-500 transition-colors">
                    Full Food Menu
                  </Link>
                </li>
                <li>
                  <Link to={AppRoutes.ORDERS} className="hover:text-orange-500 transition-colors">
                    Track My Orders
                  </Link>
                </li>
              </ul>
            </div>

            {/* Delivery Hubs */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Serving Phnom Penh
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Boeng Keng Kang (BKK1), Daun Penh, Chamkarmon, Tuol Tom Poung, Toul Kork, 7 Makara, and Riverside.
              </p>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-2">
                ⚡ 25-35 Minutes Delivery Time
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} BiteCraft. Handcrafted food delivery for Cambodia.</p>
            <p>Dual Currency: USD ($) & Khmer Riel (៛) Support</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
