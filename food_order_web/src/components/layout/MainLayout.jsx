import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Outlet Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors duration-200">
        BiteCraft Restaurant Hub • Built with React & MVI (Model-View-Intent) Pattern • Styled with Tailwind CSS v4
      </footer>
    </div>
  );
}
