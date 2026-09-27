import { useTranslation, useTheme } from '../../../core';
import { useAuth } from '../../auth/use_auth';

export function AppPreferencesCard() {
  const { isKhmer, setLanguage, t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center space-x-2.5">
        <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-black">
          ⚙️
        </span>
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            {t('profile.preferences') || 'Preferences & Settings'}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Customize language, theme, and account sessions
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {/* Language Preference */}
        <div className="py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {t('profile.language') || 'Language'}
            </p>
            <p className="text-[11px] text-slate-400">Select application display language</p>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                !isKhmer
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('km')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                isKhmer
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🇰🇭 ខ្មែរ
            </button>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {t('profile.darkMode') || 'Dark Mode'}
            </p>
            <p className="text-[11px] text-slate-400">Switch between light and dark visual mode</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center space-x-1.5 text-xs font-bold"
          >
            <span>{isDark ? '🌙 Dark' : '☀️ Light'}</span>
          </button>
        </div>

        {/* Sign Out */}
        <div className="pt-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {t('profile.signOut') || 'Sign Out'}
            </p>
            <p className="text-[11px] text-slate-400">Log out of your current device session</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors"
          >
            {t('profile.signOut') || 'Log Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
