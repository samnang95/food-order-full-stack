import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../use_notifications';
import { AppRoutes } from '../../../routes/app_routes';
import { useTranslation } from '../../../core';

export function NotificationToast() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeToast, dismissToast } = useNotifications();

  if (!activeToast) return null;

  const handleClick = () => {
    dismissToast();
    if (activeToast.orderId) {
      navigate(AppRoutes.ORDERS);
    } else if (activeToast.promoCode) {
      navigate(AppRoutes.CHECKOUT);
    }
  };

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
      <div
        onClick={handleClick}
        className="p-4 rounded-2xl bg-slate-900/95 text-white shadow-2xl border border-slate-700 backdrop-blur-md cursor-pointer hover:bg-slate-900 transition-all flex items-start space-x-3 group relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-orange-500 to-amber-500" />

        <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-xl shrink-0 mt-0.5">
          {activeToast.type === 'order' ? '📦' : activeToast.type === 'promo' ? '🎁' : '🔔'}
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2 py-0.2 rounded-md">
              {t('notifications.liveAlert') || 'Live Update'}
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-white mt-1 truncate">
            {activeToast.title}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
            {activeToast.body}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dismissToast();
          }}
          className="text-slate-400 hover:text-white p-1 text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
