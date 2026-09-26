import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { OrdersView } from './features/orders/orders_view';

export default function App() {
  const [activeRoute, setActiveRoute] = useState('orders');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <Navbar activeRoute={activeRoute} onRouteChange={setActiveRoute} />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeRoute === 'orders' && <OrdersView />}
        {activeRoute === 'menu' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🍕
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Food Menu Feature</h3>
            <p className="text-xs text-slate-500 mb-4">
              Next MVI feature: Add, edit dishes, update prices, and organize categories.
            </p>
            <button
              onClick={() => setActiveRoute('orders')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-colors"
            >
              ← Back to Orders Board
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        BiteCraft Restaurant Hub • Built with React & MVI (Model-View-Intent) Pattern • Styled with Tailwind CSS v4
      </footer>
    </div>
  );
}
