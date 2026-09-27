import { useState, useEffect } from 'react';
import { useDriverTip } from '../use_driver_tip';
import { formatUsd, formatKhr, useTranslation } from '../../../core';

function BakongTipQrModalContent() {
  const { t } = useTranslation();
  const {
    bakongPayload,
    driver,
    closeKhqrTipModal,
    submitTip,
  } = useDriverTip();

  const [timeLeft, setTimeLeft] = useState(300);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const amountUsd = bakongPayload?.amountUsd || 1.0;
  const driverName = bakongPayload?.driverName || driver?.name || 'Sok Dara';

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTimer = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const handleConfirmPaid = async () => {
    try {
      await submitTip({
        orderId: `tip_${Date.now()}`,
        amount: amountUsd,
        paymentMethod: 'bakong_khqr',
        compliments: ['friendly_smile'],
        note: 'Tipped via Bakong KHQR',
      });
      setIsConfirmed(true);
      setTimeout(() => {
        setIsConfirmed(false);
        closeKhqrTipModal();
      }, 1000);
    } catch (e) {
      console.warn('Tip submission error:', e);
      closeKhqrTipModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col items-center">
        {/* Official Bakong Red Header */}
        <div className="w-full bg-[#E11D48] text-white p-4 text-center relative shadow-sm">
          <button
            type="button"
            onClick={closeKhqrTipModal}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs font-black transition-colors"
          >
            ✕
          </button>
          <div className="flex items-center justify-center space-x-1.5 font-black text-sm tracking-wider uppercase">
            <span>🇰🇭</span>
            <span>{t('driverTip.bakongKhqrTitle', 'KHQR • Bakong Tip')}</span>
          </div>
          <p className="text-[10px] text-rose-100 font-medium mt-0.5">
            {t('driverTip.nbcStandard', 'National Bank of Cambodia Standard')}
          </p>
        </div>

        {/* QR Body Card */}
        <div className="p-6 w-full flex flex-col items-center space-y-4">
          {/* Driver Recipient Pill */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            <span className="text-sm">🛵</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {driverName} ({t('driverTip.riderRole', 'Rider')})
            </span>
          </div>

          {/* Amount Display */}
          <div className="text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono block">
              {formatUsd(amountUsd)}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">
              ({formatKhr(amountUsd)})
            </span>
          </div>

          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-rose-400 shadow-md flex items-center justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                bakongPayload?.khqrString || 'KHQR_DEMO_TIP'
              )}`}
              alt="Bakong KHQR Tip"
              className="w-44 h-44 object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=180';
              }}
            />
          </div>

          {/* Countdown & Instructions */}
          <div className="text-center space-y-1">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {t('driverTip.scanInstruction', 'Scan with any mobile banking app (ABA, ACLEDA, Canadia, Wing)')}
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
              <span>⏱️ {t('driverTip.expiresIn', 'Expires in')}:</span>
              <span className="text-rose-600 dark:text-rose-400 font-black">{formattedTimer}</span>
            </div>
          </div>

          {/* Action CTA */}
          <button
            type="button"
            onClick={handleConfirmPaid}
            className={`w-full py-3 rounded-2xl text-xs font-black transition-all shadow-md ${
              isConfirmed
                ? 'bg-emerald-500 text-white scale-102'
                : 'bg-[#E11D48] hover:bg-rose-700 text-white shadow-rose-500/25 active:scale-98'
            }`}
          >
            {isConfirmed
              ? t('driverTip.tipConfirmed', '✓ Tip Sent Successfully!')
              : t('driverTip.confirmPaymentDone', 'I Have Scanned & Sent Tip')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BakongTipQrModal() {
  const { isKhqrTipModalOpen } = useDriverTip();

  if (!isKhqrTipModalOpen) return null;

  return <BakongTipQrModalContent />;
}
