import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { formatUsd, formatKhr, useTranslation } from '../../../core';
import { AppRoutes } from '../../../routes/app_routes';

export function OrderSuccessModal({ order, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!order) return null;

  const handleTrackLive = () => {
    onClose?.();
    navigate(AppRoutes.ORDERS);
  };

  const handleBackToMenu = () => {
    onClose?.();
    navigate(AppRoutes.MENU);
  };

  const orderId = order.orderNumber || (order._id || order.id || '').toString().slice(-6).toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Celebration Badge */}
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/20 animate-bounce">
          🎉
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
            {t('checkout.orderSuccessTitle')}
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            Order #{orderId} Confirmed!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {t('checkout.orderSuccessSubtitle')}
          </p>
        </div>

        {/* Receipt Details Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Order Reference:</span>
            <span className="font-mono font-black text-slate-900 dark:text-white">
              #{orderId}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Estimated Delivery:</span>
            <span className="font-bold text-orange-600 dark:text-orange-400 flex items-center space-x-1">
              <span>⚡</span>
              <span>25 - 35 {t('common.mins')}</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Delivery Address:</span>
            <span className="font-semibold text-slate-900 dark:text-white max-w-[200px] truncate text-right">
              {order.deliveryAddress || 'Boeng Keng Kang 1, Phnom Penh'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Payment Status:</span>
            <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">
              {order.paymentMethod === 'bakong_khqr'
                ? order.paymentStatus === 'completed'
                  ? 'Bakong KHQR (Verified & Paid ✓)'
                  : t('checkout.khqrPending')
                : t('checkout.cashOnDelivery')}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
            <span className="font-bold text-slate-700 dark:text-slate-300">{t('cart.total')}:</span>
            <div className="text-right">
              <span className="font-black text-sm text-slate-900 dark:text-white">
                {formatUsd(order.totalAmount || 0)}
              </span>
              <span className="block text-[10px] text-slate-400">
                {formatKhr(order.totalAmount || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleTrackLive}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center space-x-2"
          >
            <span>🛵 {t('checkout.trackOrder')}</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={handleBackToMenu}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
          >
            {t('checkout.continueBrowsing')}
          </button>
        </div>
      </div>
    </div>
  );
}

OrderSuccessModal.propTypes = {
  order: PropTypes.object,
  onClose: PropTypes.func,
};
