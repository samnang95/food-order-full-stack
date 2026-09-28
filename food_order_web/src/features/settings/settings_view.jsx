import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useTheme,
  ThemeMode,
  useTranslation,
  soundService,
  ApiClient,
  LocalDB,
  DBKeys,
} from '../../core';
import { useAuth } from '../auth/use_auth';
import { AppRoutes } from '../../routes/app_routes';

export function SettingsView() {
  const { theme, setTheme, isDark } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const { user } = useAuth();

  // Sound & Notifications state
  const [soundEnabled, setSoundEnabled] = useState(() => soundService.isSoundEnabled());
  const [hapticsEnabled, setHapticsEnabled] = useState(() =>
    LocalDB.getBool('bitecraft_haptics_enabled', true)
  );
  const [soundPlaying, setSoundPlaying] = useState(false);

  // Currency Display Preference
  const [currencyMode, setCurrencyMode] = useState(() =>
    LocalDB.getString('bitecraft_currency_mode', 'dual')
  );

  // Password Change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Cache & Storage state
  const [cacheCleared, setCacheCleared] = useState(false);

  // Toggle Sound
  const handleToggleSound = (enabled) => {
    setSoundEnabled(enabled);
    soundService.setSoundEnabled(enabled);
    if (enabled) {
      soundService.playPop();
    }
  };

  // Test Sound Chime
  const handleTestSound = () => {
    setSoundPlaying(true);
    soundService.playSuccess();
    setTimeout(() => setSoundPlaying(false), 500);
  };

  // Toggle Haptics
  const handleToggleHaptics = (enabled) => {
    setHapticsEnabled(enabled);
    LocalDB.setBool('bitecraft_haptics_enabled', enabled);
    if (enabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Change Currency Mode
  const handleCurrencyChange = (mode) => {
    setCurrencyMode(mode);
    LocalDB.setString('bitecraft_currency_mode', mode);
    soundService.playPop();
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!oldPassword || !newPassword) {
      setPwError('Please fill in both current and new password');
      return;
    }

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New password and confirm password do not match');
      return;
    }

    setPwLoading(true);
    try {
      await ApiClient.put('/users/profile/password', {
        oldPassword,
        newPassword,
      });
      setPwSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      soundService.playSuccess();
    } catch (err) {
      setPwError(err.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setPwLoading(false);
    }
  };

  // Clear Cache Handler
  const handleClearCache = () => {
    LocalDB.remove(DBKeys.SEARCH_HISTORY);
    LocalDB.remove(DBKeys.CACHED_FOODS);
    LocalDB.remove(DBKeys.CACHED_CATEGORIES);
    LocalDB.remove(DBKeys.CACHED_VOUCHERS);
    setCacheCleared(true);
    soundService.playPop();
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 sm:p-8 border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-3xl sm:text-4xl">⚙️</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('settings.title', 'Settings & Preferences')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('settings.subtitle', 'Customize your BiteCraft interface, notifications, sound effects, and security.')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={AppRoutes.PROFILE}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors shadow-2xs"
          >
            👤 {t('navigation.profile', 'Profile')}
          </Link>
          <Link
            to={AppRoutes.ROOT}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/20"
          >
            🏠 {t('navigation.home', 'Home')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Appearance & Theme */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🎨</span>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {t('settings.appearance', 'Appearance & Theme')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose your preferred theme mode or sync automatically with your operating system.
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {/* Light Mode */}
            <button
              type="button"
              id="settings-theme-light"
              onClick={() => {
                setTheme(ThemeMode.LIGHT);
                soundService.playPop();
              }}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                theme === ThemeMode.LIGHT
                  ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-sm font-black'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 font-bold'
              }`}
            >
              <span className="text-2xl">☀️</span>
              <span className="text-xs">Light</span>
            </button>

            {/* Dark Mode */}
            <button
              type="button"
              id="settings-theme-dark"
              onClick={() => {
                setTheme(ThemeMode.DARK);
                soundService.playPop();
              }}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                theme === ThemeMode.DARK
                  ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-sm font-black'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 font-bold'
              }`}
            >
              <span className="text-2xl">🌙</span>
              <span className="text-xs">Dark</span>
            </button>

            {/* System Sync */}
            <button
              type="button"
              id="settings-theme-system"
              onClick={() => {
                setTheme(ThemeMode.SYSTEM);
                soundService.playPop();
              }}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                theme === ThemeMode.SYSTEM
                  ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-sm font-black'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 font-bold'
              }`}
            >
              <span className="text-2xl">💻</span>
              <span className="text-xs">System</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
            <span>Current Active:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {isDark ? 'Dark Mode (Active)' : 'Light Mode (Active)'}
            </span>
          </div>
        </div>

        {/* Section 2: Language & Regional */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🌐</span>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {t('settings.languageRegional', 'Language & Regional')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch between English and Khmer, and adjust your preferred currency pricing display.
          </p>

          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Interface Language
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="settings-lang-en"
                  onClick={() => {
                    setLanguage('en');
                    soundService.playPop();
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center space-x-3 transition-all ${
                    language === 'en'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold'
                  }`}
                >
                  <span className="text-xl">🇬🇧</span>
                  <div>
                    <div className="text-xs">English</div>
                    <div className="text-[10px] opacity-60">Default</div>
                  </div>
                </button>

                <button
                  type="button"
                  id="settings-lang-km"
                  onClick={() => {
                    setLanguage('km');
                    soundService.playPop();
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center space-x-3 transition-all ${
                    language === 'km'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold'
                  }`}
                >
                  <span className="text-xl">🇰🇭</span>
                  <div>
                    <div className="text-xs">ភាសាខ្មែរ</div>
                    <div className="text-[10px] opacity-60">Khmer</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Currency Formatting
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'dual', label: 'Dual ($ & ៛)' },
                  { key: 'usd', label: 'USD ($)' },
                  { key: 'khr', label: 'KHR (៛)' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleCurrencyChange(item.key)}
                    className={`py-2 px-2.5 rounded-xl border text-center text-xs transition-all ${
                      currencyMode === item.key
                        ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Sound & Audio Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🔊</span>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {t('settings.soundAlerts', 'Sound & Audio Alerts')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enjoy pleasant audio chimes on cart interactions and live driver status updates.
          </p>

          <div className="space-y-4 pt-1">
            {/* Toggle Sound */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Audio Chimes
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cart actions & order status chimes
                </div>
              </div>
              <button
                type="button"
                id="toggle-sound-effects"
                onClick={() => handleToggleSound(!soundEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  soundEnabled ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Test Chime Button */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Preview notification chime:
              </span>
              <button
                type="button"
                id="test-sound-btn"
                onClick={handleTestSound}
                disabled={!soundEnabled || soundPlaying}
                className="px-3.5 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-bold hover:bg-orange-100 transition-colors disabled:opacity-50 flex items-center space-x-1.5"
              >
                <span>{soundPlaying ? '🎶' : '🔊'}</span>
                <span>{soundPlaying ? 'Playing...' : 'Test Sound'}</span>
              </button>
            </div>

            {/* Mobile Haptic Feedback */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Haptic Feedback
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Subtle vibration on mobile tap
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleHaptics(!hapticsEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  hapticsEnabled ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Account & Password Security */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🔒</span>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {t('settings.security', 'Account Security')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your account password to keep your BiteCraft profile secure.
          </p>

          {pwSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              ✓ {pwSuccess}
            </div>
          )}

          {pwError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
              ⚠️ {pwError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="settings-old-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                New Password (min 6 chars)
              </label>
              <input
                type="password"
                id="settings-new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="settings-confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
              />
            </div>

            <button
              type="submit"
              id="settings-submit-password"
              disabled={pwLoading}
              className="w-full mt-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
            >
              {pwLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Section 5: Data, Storage & App Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🧹</span>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Storage & Local Cache
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
            Clear temporary cached dish categories, vouchers, and search queries stored on this browser without logging out.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {cacheCleared && (
            <span className="text-xs font-bold text-emerald-500 animate-in fade-in">
              ✓ Cache Cleared!
            </span>
          )}
          <button
            type="button"
            id="settings-clear-cache-btn"
            onClick={handleClearCache}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Clear Browser Cache
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
        <div>BiteCraft Food Ordering Web Platform • Version 1.4.2 Production</div>
        <div>Connected User: <span className="font-semibold text-slate-600 dark:text-slate-300">{user?.username || 'Guest Foodie'}</span></div>
      </div>
    </div>
  );
}
