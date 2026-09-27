import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from './use_notifications';
import { useTranslation } from '../../core';
import { AppRoutes } from '../../routes/app_routes';

function formatRelativeTime(timestamp, t) {
  if (!timestamp) return t('notifications.justNow') || 'Just now';
  try {
    const now = Date.now();
    const date = new Date(timestamp).getTime();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return t('notifications.justNow') || 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return (t('notifications.minutesAgo') || '{mins}m ago').replace('{mins}', diffMin);
    }
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) {
      return (t('notifications.hoursAgo') || '{hrs}h ago').replace('{hrs}', diffHr);
    }
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) {
      return (t('notifications.daysAgo') || '{days}d ago').replace('{days}', diffDays);
    }
    return new Date(timestamp).toLocaleDateString();
  } catch {
    return t('notifications.justNow') || 'Just now';
  }
}

export function NotificationsView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    pushPermission,
    requestPushPermission,
    sendTestPush,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'order' | 'promo'
  const [copiedCode, setCopiedCode] = useState(null);

  const orderCount = useMemo(
    () => notifications.filter((n) => n.type === 'order').length,
    [notifications]
  );
  const promoCount = useMemo(
    () => notifications.filter((n) => n.type === 'promo').length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.isRead);
      case 'order':
        return notifications.filter((n) => n.type === 'order');
      case 'promo':
        return notifications.filter((n) => n.type === 'promo');
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    const confirmed = window.confirm(
      t('notifications.clearAllConfirm') || 'Are you sure you want to clear all notifications?'
    );
    if (confirmed) {
      clearAll();
    }
  };

  const getTypeTheme = (type) => {
    switch (type) {
      case 'order':
        return {
          icon: '📦',
          label: t('notifications.orders') || 'Order Tracking',
          bg: 'bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 border-orange-200/60 dark:border-orange-900/60',
        };
      case 'promo':
        return {
          icon: '🎁',
          label: t('notifications.promos') || 'Promotion',
          bg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/60',
        };
      default:
        return {
          icon: '🔔',
          label: 'System Update',
          bg: 'bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/60',
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white p-6 sm:p-8 shadow-xl shadow-orange-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-orange-100 text-xs font-bold uppercase tracking-wider mb-2">
              <Link to={AppRoutes.ROOT} className="hover:underline">
                {t('navigation.home')}
              </Link>
              <span>/</span>
              <span>{t('notifications.title') || 'Notifications'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('notifications.title') || 'Notifications Center'}
            </h1>
            <p className="text-xs sm:text-sm text-orange-100/90 mt-1 max-w-xl leading-relaxed">
              {t('notifications.subtitle') ||
                'Stay updated with real-time order tracking, promo perks, and announcements.'}
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs transition-all active:scale-95 shadow-sm border border-white/20 flex items-center space-x-1.5"
              >
                <span>✓✓</span>
                <span>{t('notifications.markAllRead') || 'Mark All Read'}</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2.5 rounded-2xl bg-black/20 hover:bg-black/30 backdrop-blur-md text-white font-bold text-xs transition-all active:scale-95 shadow-sm border border-white/10 flex items-center space-x-1.5"
              >
                <span>🗑️</span>
                <span>{t('notifications.clearAll') || 'Clear All'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Firebase Push Banner / Test Control */}
      {pushPermission !== 'granted' ? (
        <div className="p-4 rounded-3xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {t('notifications.enablePushTitle') || 'Enable Browser Push Notifications'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('notifications.enablePushDesc') ||
                  'Receive instant order status alerts and vouchers directly on your device via Firebase.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestPushPermission}
            className="px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all self-start sm:self-auto shrink-0"
          >
            🔔 {t('notifications.enablePushBtn') || 'Enable Alerts'}
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-500 text-base font-bold">✓</span>
            <span className="font-bold text-emerald-800 dark:text-emerald-300">
              {t('notifications.pushActive') || 'Firebase Web Push Notifications are active on this browser.'}
            </span>
          </div>
          <button
            type="button"
            onClick={sendTestPush}
            className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-[11px] transition-colors self-start sm:self-auto"
          >
            🔥 {t('notifications.sendTest') || 'Send Test Push'}
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xl">🔔</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {notifications.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold">
            {t('notifications.all') || 'Total Alerts'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xl">📬</span>
            <span
              className={`text-lg sm:text-xl font-black ${
                unreadCount > 0 ? 'text-orange-500' : 'text-slate-900 dark:text-white'
              }`}
            >
              {unreadCount}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold">
            {t('notifications.unread') || 'Unread'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xl">📦</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {orderCount}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold">
            {t('notifications.orders') || 'Orders'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xl">🎁</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {promoCount}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold">
            {t('notifications.promos') || 'Promotions'}
          </p>
        </div>
      </div>

      {/* Filter Tabs Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('notifications.all') || 'All'} ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'unread'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('notifications.unread') || 'Unread'} ({unreadCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'order'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('notifications.orders') || 'Orders'} ({orderCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('promo')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'promo'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('notifications.promos') || 'Promos'} ({promoCount})
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing {filteredNotifications.length} of {notifications.length}
        </span>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
            🔔
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {t('notifications.noNotifications') || 'No notifications yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {t('notifications.noNotificationsDesc') ||
                'You are all caught up! When you place an order or receive special offers, they will appear here.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center space-x-3">
            <Link
              to={AppRoutes.MENU}
              className="px-5 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20 active:scale-95"
            >
              🍔 {t('navigation.menu') || 'Order Food'}
            </Link>
            <Link
              to={AppRoutes.ORDERS}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              📦 {t('navigation.orders') || 'View Orders'}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const theme = getTypeTheme(notif.type);
            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) markAsRead(notif.id);
                }}
                className={`p-4 sm:p-5 rounded-3xl transition-all border relative group flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer ${
                  notif.isRead
                    ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/60 shadow-xs hover:border-orange-400'
                }`}
              >
                {/* Left content with icon & details */}
                <div className="flex items-start space-x-3.5 sm:space-x-4 min-w-0 flex-1">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${theme.bg} border flex items-center justify-center text-xl shrink-0 shadow-xs mt-0.5`}
                  >
                    {theme.icon}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${theme.bg}`}
                      >
                        {theme.label}
                      </span>
                      {!notif.isRead && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>{t('notifications.unread') || 'New'}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {formatRelativeTime(notif.timestamp, t)}
                      </span>
                    </div>

                    <h4
                      className={`text-sm sm:text-base font-bold ${
                        notif.isRead
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-900 dark:text-white font-black'
                      }`}
                    >
                      {notif.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                      {notif.body}
                    </p>

                    {/* Action buttons (Order track, Promo code) */}
                    {(notif.promoCode || notif.orderId) && (
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        {notif.promoCode && (
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 rounded-xl font-mono text-xs font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                              {notif.promoCode}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyCode(notif.promoCode, e)}
                              className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              {copiedCode === notif.promoCode
                                ? `✓ ${t('notifications.codeCopied') || 'Copied!'}`
                                : t('notifications.copyCode') || 'Copy'}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(AppRoutes.CHECKOUT);
                              }}
                              className="px-3 py-1 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                            >
                              {t('notifications.applyPromo') || 'Apply in Checkout →'}
                            </button>
                          </div>
                        )}

                        {notif.orderId && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(AppRoutes.ORDERS);
                            }}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xs transition-all active:scale-95 flex items-center space-x-1.5"
                          >
                            <span>📦</span>
                            <span>{t('notifications.trackDelivery') || 'Track Order Delivery'}</span>
                            <span>→</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right controls: Read toggle & Delete */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {!notif.isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      }}
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      {t('notifications.markAllRead') || 'Mark read'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notif.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-xs font-bold flex items-center space-x-1"
                    title={t('notifications.deleteAlert') || 'Delete'}
                  >
                    <span>🗑️</span>
                    <span className="sm:hidden">{t('notifications.deleteAlert') || 'Delete'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
