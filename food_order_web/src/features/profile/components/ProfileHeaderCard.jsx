import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../auth/use_auth';
import { useTranslation } from '../../../core';

export function ProfileHeaderCard({ onOpenEditModal }) {
  const { user, uploadAvatar } = useAuth();
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const username = user?.username || 'Guest Foodie';
  const email = user?.email || 'guest@bitecraft.local';
  const initial = (username[0] || 'U').toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
      {/* Decorative gradient background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 relative">
        {/* Avatar with Photo Upload Button */}
        <div className="relative group shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-xl shadow-orange-500/25 border-4 border-white dark:border-slate-800">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>

          {/* Change photo button overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title={t('profile.changePhoto') || 'Change Profile Photo'}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs shadow-lg hover:scale-110 active:scale-95 transition-transform"
          >
            {uploading ? (
              <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              '📷'
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* User Info & Member Badge */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {username}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60">
              👑 Gold Foodie
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
            {email}
          </p>

          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-center sm:justify-start space-x-1.5">
            <span>📍 Phnom Penh, Cambodia</span>
            <span>•</span>
            <span>Member since 2026</span>
          </p>

          <div className="mt-4 flex items-center justify-center sm:justify-start space-x-2">
            <button
              type="button"
              onClick={onOpenEditModal}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center space-x-1.5"
            >
              <span>✏️</span>
              <span>{t('profile.editProfile') || 'Edit Profile'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ProfileHeaderCard.propTypes = {
  onOpenEditModal: PropTypes.func.isRequired,
};
