import { useState } from 'react';
import { useAuth } from '../auth/use_auth';
import { useTranslation } from '../../core';
import {
  ProfileHeaderCard,
  ProfileStatsCard,
  SavedAddressesCard,
  AccountSecurityCard,
  AppPreferencesCard,
  EditProfileModal,
} from './components';

export function ProfileView() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { t } = useTranslation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-5 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center text-4xl mx-auto shadow-inner animate-pulse">
          👤
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {t('auth.welcomeBack')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {t('auth.welcomeSubtitle')}
          </p>
        </div>
        <div className="pt-2 flex flex-col space-y-2">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all"
          >
            {t('navigation.signIn')}
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            {t('auth.createAccount')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Profile Header Hero */}
      <ProfileHeaderCard onOpenEditModal={() => setIsEditModalOpen(true)} />

      {/* Customer Quick Stats (Orders, Points, Favorites) */}
      <ProfileStatsCard />

      {/* Main Grid: Addresses, Security & Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Saved Addresses (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <SavedAddressesCard />
        </div>

        {/* Right Column: Security & Preferences (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <AccountSecurityCard />
          <AppPreferencesCard />
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
