import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../../routes/app_routes';
import { useTranslation } from '../../../core';

function formatRelativeTime(timestamp, t) {
  if (!timestamp) return t?.('notifications.justNow') || 'Just now';
  try {
    const now = Date.now();
    const date = new Date(timestamp).getTime();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return t?.('notifications.justNow') || 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return (t?.('notifications.minutesAgo') || '{mins}m ago').replace('{mins}', diffMin);
    }
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) {
      return (t?.('notifications.hoursAgo') || '{hrs}h ago').replace('{hrs}', diffHr);
    }
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) {
      return (t?.('notifications.daysAgo') || '{days}d ago').replace('{days}', diffDays);
    }
    return new Date(timestamp).toLocaleDateString();
  } catch {
    return t?.('notifications.justNow') || 'Recently';
  }
}

export function NotificationItem({ notification, onMarkAsRead, onRemove, onAction }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id, title, body, type, promoCode, orderId, timestamp, isRead } = notification;

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id);
    }

    if (orderId) {
      onAction?.();
      navigate(AppRoutes.ORDERS);
    } else if (promoCode) {
      onAction?.();
      navigate(AppRoutes.CHECKOUT);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'order':
        return { icon: '📦', bg: 'bg-orange-100 dark:bg-orange-950/60 text-orange-600' };
      case 'promo':
        return { icon: '🎁', bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' };
      default:
        return { icon: '🔔', bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600' };
    }
  };

  const { icon, bg } = getIcon();

  return (
    <div
      onClick={handleClick}
      className={`p-3.5 sm:p-4 rounded-2xl transition-all border cursor-pointer relative group flex items-start space-x-3 ${
        isRead
          ? 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 hover:border-slate-300'
          : 'bg-orange-50/40 dark:bg-orange-950/20 border-orange-200/80 dark:border-orange-900/60 hover:border-orange-400'
      }`}
    >
      {/* Icon Badge */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${bg} flex items-center justify-center text-lg shrink-0 shadow-xs mt-0.5`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center space-x-1.5">
          <h4
            className={`text-xs sm:text-sm font-bold truncate ${
              isRead ? 'text-slate-800 dark:text-slate-200' : 'text-slate-900 dark:text-white'
            }`}
          >
            {title}
          </h4>
          {!isRead && (
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" title="Unread" />
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-words">
          {body}
        </p>

        {/* Action tags (Promo code or order track) */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {promoCode && (
            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60">
              Code: {promoCode}
            </span>
          )}

          {orderId && (
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 flex items-center space-x-1">
              <span>{t('notifications.trackDelivery') || 'Track Live Delivery'}</span>
              <span>→</span>
            </span>
          )}

          <span className="text-[10px] text-slate-400 font-medium">
            {formatRelativeTime(timestamp, t)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.(id);
        }}
        className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 opacity-60 group-hover:opacity-100 transition-opacity p-1"
        title={t('notifications.deleteAlert') || 'Dismiss notification'}
      >
        ✕
      </button>
    </div>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    body: PropTypes.string,
    type: PropTypes.string,
    promoCode: PropTypes.string,
    orderId: PropTypes.string,
    timestamp: PropTypes.string,
    isRead: PropTypes.bool,
  }).isRequired,
  onMarkAsRead: PropTypes.func,
  onRemove: PropTypes.func,
  onAction: PropTypes.func,
};
