import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../use_notifications';
import { NotificationItem } from './NotificationItem';
import { AppRoutes } from '../../../routes/app_routes';
import { useTranslation } from '../../../core';

export function NotificationDropdown() {
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    isDropdownOpen,
    setIsDropdownOpen,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'order' | 'promo'
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen, setIsDropdownOpen]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter((n) => n.type === activeTab);
  }, [notifications, activeTab]);

  if (!isDropdownOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Dropdown Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-base">🔔</span>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            {t('notifications.title') || 'Notifications'}
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-white">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline"
          >
            {t('notifications.markAllRead') || 'Mark all read'}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-3 pt-2.5 pb-1 flex space-x-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t('notifications.all') || 'All'} ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'order'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t('notifications.orders') || 'Orders'} 📦
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('promo')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'promo'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t('notifications.promos') || 'Promos'} 🎁
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto p-3 space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 space-y-1">
            <span className="text-2xl">✨</span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('notifications.noNotifications') || 'No notifications here'}
            </p>
            <p className="text-[11px] text-slate-400">
              {t('notifications.noNotificationsDesc') ||
                'You are all caught up on orders and announcements!'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkAsRead={markAsRead}
              onRemove={removeNotification}
              onAction={() => setIsDropdownOpen(false)}
            />
          ))
        )}
      </div>

      {/* Footer Link */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link
          to={AppRoutes.NOTIFICATIONS}
          onClick={() => setIsDropdownOpen(false)}
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center justify-center space-x-1"
        >
          <span>{t('notifications.viewAll') || 'View All Notifications'}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
