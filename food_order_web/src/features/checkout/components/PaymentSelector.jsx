import PropTypes from 'prop-types';
import { formatUsd, formatKhr, useTranslation } from '../../../core';

export function PaymentSelector({
  paymentMethod,
  setPaymentMethod,
  totalAmount,
  onOpenKhqrModal,
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center space-x-2.5">
        <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-black">
          2
        </span>
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            {t('checkout.paymentMethod')}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Choose how you would like to settle your bill
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Cash On Delivery */}
        <label
          className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer flex items-center space-x-3 transition-all ${
            paymentMethod === 'cash'
              ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-xs'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="cash"
            checked={paymentMethod === 'cash'}
            onChange={() => setPaymentMethod('cash')}
            className="sr-only"
          />
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xl shrink-0 shadow-xs">
            💵
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {t('checkout.cashOnDelivery')}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t('checkout.cashOnDeliveryDesc')}
            </p>
          </div>
        </label>

        {/* Bakong KHQR */}
        <label
          className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer flex items-center space-x-3 transition-all ${
            paymentMethod === 'khqr'
              ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-xs'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="khqr"
            checked={paymentMethod === 'khqr'}
            onChange={() => setPaymentMethod('khqr')}
            className="sr-only"
          />
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center text-xl shrink-0 shadow-xs">
            📱
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Bakong KHQR
              </p>
              <span className="text-[9px] px-1.5 py-0.2 bg-red-600 text-white font-black rounded-md tracking-wider">
                KHQR
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Scan from any Cambodian bank app
            </p>
          </div>
        </label>
      </div>

      {/* Bakong KHQR Dynamic Preview */}
      {paymentMethod === 'khqr' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-500/5 via-rose-500/5 to-transparent border border-red-200 dark:border-red-900/50 text-center space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">
              National Bank of Cambodia
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Bakong Universal QR
            </span>
          </div>

          <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://bakong.nbc.org.kh/pay?amount=${totalAmount}&currency=USD`}
              alt="Bakong KHQR"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white">
              Scan to Pay: {formatUsd(totalAmount)}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ({formatKhr(totalAmount)}) • Supported by ABA, Wing, Acleda, Canadia & 30+ banks
            </p>

            {onOpenKhqrModal && (
              <button
                type="button"
                onClick={onOpenKhqrModal}
                className="mt-3 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E11900] to-red-600 hover:from-[#C21500] hover:to-red-700 text-white text-xs font-black shadow-md shadow-red-500/20 active:scale-95 transition-all"
              >
                <span>📱</span>
                <span>{t('checkout.openKhqr')}</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

PaymentSelector.propTypes = {
  paymentMethod: PropTypes.string.isRequired,
  setPaymentMethod: PropTypes.func.isRequired,
  totalAmount: PropTypes.number.isRequired,
  onOpenKhqrModal: PropTypes.func,
};
