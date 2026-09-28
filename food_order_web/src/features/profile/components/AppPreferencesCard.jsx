import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, useTheme } from '../../../core';
import { useAuth } from '../../auth/use_auth';
import { useNotifications } from '../../notifications';
import { AppRoutes } from '../../../routes/app_routes';

export function AppPreferencesCard() {
  const { isKhmer, setLanguage, t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { pushPermission, requestPushPermission, sendTestPush } = useNotifications();
  const [testingPush, setTestingPush] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  const handleTestPush = async () => {
    setTestingPush(true);
    try {
      await sendTestPush();
    } catch (err) {
      console.error('Failed to trigger test push:', err);
    } finally {
      setTestingPush(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-black">
            ⚙️
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              {t('profile.preferences') || 'Preferences & Settings'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Customize language, theme, notifications, and account sessions
            </p>
          </div>
        </div>
        <Link
          to={AppRoutes.SETTINGS}
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline shrink-0"
        >
          Open Settings →
        </Link>
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

        {/* Firebase Push Notifications Preference */}
        <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {t('profile.pushNotifications') || 'Push Notifications'}
              </p>
              {pushPermission === 'granted' && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  {t('profile.pushEnabled') || 'Active'}
                </span>
              )}
              {pushPermission === 'denied' && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  {t('profile.pushBlocked') || 'Blocked'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {t('profile.pushNotificationsDesc') ||
                'Receive instant delivery updates and coupons in your browser'}
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {pushPermission === 'granted' ? (
              <button
                type="button"
                onClick={handleTestPush}
                disabled={testingPush}
                className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-950/70 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 font-bold text-xs transition-colors"
              >
                {testingPush ? 'Sending...' : t('profile.testPush') || '🔥 Test Notification'}
              </button>
            ) : pushPermission === 'denied' ? (
              <span className="text-[11px] text-amber-500 font-medium">
                {t('profile.pushEnableInBrowser') || 'Enable in browser settings'}
              </span>
            ) : (
              <button
                type="button"
                onClick={requestPushPermission}
                className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                🔔 {t('profile.enablePush') || 'Enable Push'}
              </button>
            )}
          </div>
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
