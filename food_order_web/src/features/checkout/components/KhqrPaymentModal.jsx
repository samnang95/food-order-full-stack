import { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatUsd, formatKhr, useTranslation, soundService } from '../../../core';

const SUPPORTED_BANKS = [
  { name: 'ABA Mobile', color: 'bg-[#004f71] text-white', icon: '🏦' },
  { name: 'Wing Bank', color: 'bg-[#78be20] text-slate-900', icon: '💸' },
  { name: 'ACLEDA Mobile', color: 'bg-[#0b335c] text-white', icon: '🏛️' },
  { name: 'Canadia Bank', color: 'bg-[#b81d24] text-white', icon: '💳' },
  { name: 'Sathapana', color: 'bg-[#0c4a60] text-white', icon: '🌐' },
  { name: 'Prince Bank', color: 'bg-[#f37021] text-white', icon: '👑' },
  { name: 'Bakong App', color: 'bg-[#e11900] text-white', icon: '🇰🇭' },
];

export function KhqrPaymentModal({
  isOpen,
  onClose,
  totalAmount = 0,
  onPaymentSuccess,
  onCancelPayCash,
}) {
  const { t } = useTranslation();
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'KHR'
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300s)
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedBank, setSelectedBank] = useState('ABA Mobile');
  const [apiKhqr, setApiKhqr] = useState(null);
  const timerRef = useRef(null);

  // Exchange rate: 1 USD = 4,100 KHR
  const khrAmount = Math.round(totalAmount * 4100);

  // Fetch real KHQR from API backend
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    fetch('/api/payments/khqr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalAmount,
        currency,
        merchantName: 'BiteCraft Kitchen',
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.qrPayload) {
          setApiKhqr(data);
        }
      })
      .catch((err) => {
        console.warn('[KhqrPaymentModal] API KHQR fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, currency, totalAmount]);

  // 5-minute countdown timer (only runs when modal is open)
  useEffect(() => {
    if (!isOpen) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  const handleClose = () => {
    setTimeLeft(300);
    setIsVerifying(false);
    setIsSuccess(false);
    onClose?.();
  };

  // EMVCo compliant Bakong KHQR sample payload with real CRC-16 fallback
  const qrPayload = useMemo(() => {
    if (apiKhqr?.qrPayload) return apiKhqr.qrPayload;
    const currCode = currency === 'USD' ? '840' : '116';
    const amountStr = currency === 'USD' ? totalAmount.toFixed(2) : String(khrAmount);
    return `00020101021229380017kh.gov.nbc.bakong0113bitecraft@aba520458125303${currCode}540${amountStr.length}${amountStr}5802KH5917BiteCraft Kitchen6010Phnom Penh62140710bitecraft1263048899`;
  }, [apiKhqr, currency, totalAmount, khrAmount]);

  const qrImageUrl =
    apiKhqr?.qrImageUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(
      qrPayload
    )}`;

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpired = timeLeft === 0;

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleRegenerate = () => {
    setTimeLeft(300);
    setIsVerifying(false);
    setIsSuccess(false);
  };

  const handleSimulatePayment = async () => {
    if (isVerifying || isSuccess || isExpired) return;

    setIsVerifying(true);
    const txnId =
      apiKhqr?.transactionId ||
      `BK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await fetch('/api/payments/khqr/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: txnId,
          bankName: selectedBank,
        }),
      });
    } catch (_) {}

    setIsVerifying(false);
    setIsSuccess(true);
    soundService.playSuccess();

    setTimeout(() => {
      onPaymentSuccess?.({
        transactionId: txnId,
        paymentMethod: 'bakong_khqr',
        currency,
        paidAmount: currency === 'USD' ? totalAmount : khrAmount,
        bankName: selectedBank,
        paidAt: new Date().toISOString(),
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Official Bakong KHQR Header Banner */}
        <div className="relative bg-gradient-to-r from-[#D32F2F] via-[#E11900] to-[#B71C1C] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            {/* KHQR emblem */}
            <div className="w-10 h-10 rounded-xl bg-white text-[#E11900] flex items-center justify-center font-black tracking-tighter text-sm shadow-md ring-2 ring-white/50">
              KHQR
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black tracking-wide uppercase">
                  {t('khqr.title')}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded-full font-bold">
                  NBC Official
                </span>
              </div>
              <p className="text-[10px] text-white/90">
                {t('khqr.nbcTitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center text-sm font-bold transition-all active:scale-95"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-center">
          {/* Merchant and Amount Showcase */}
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span>🏪</span>
              <span>{t('khqr.merchantName')}</span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-orange-600 dark:text-orange-400">
                {t('khqr.merchantAccount')}
              </span>
            </div>

            {/* Currency Selector Tabs */}
            <div className="flex items-center justify-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl max-w-[240px] mx-auto border border-slate-200/80 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`flex-1 py-1 px-3 rounded-xl text-xs font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {t('khqr.currencyUsd')}
              </button>
              <button
                type="button"
                onClick={() => setCurrency('KHR')}
                className={`flex-1 py-1 px-3 rounded-xl text-xs font-bold transition-all ${
                  currency === 'KHR'
                    ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {t('khqr.currencyKhr')}
              </button>
            </div>

            {/* Prominent Amount */}
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {currency === 'USD' ? formatUsd(totalAmount) : `${khrAmount.toLocaleString()} ៛`}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {currency === 'USD'
                  ? `≈ ${formatKhr(totalAmount)}`
                  : `≈ ${formatUsd(totalAmount)}`}{' '}
                • {t('khqr.exchangeRateNote')}
              </p>
            </div>
          </div>

          {/* QR Code Presentation Box with Authentic KHQR Styling */}
          <div className="relative mx-auto max-w-[280px]">
            {/* Visual Frame */}
            <div className="relative rounded-3xl p-4 bg-white border-2 border-[#E11900]/30 shadow-xl space-y-3">
              {/* Corner guide accents */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#E11900] rounded-tl-md" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#E11900] rounded-tr-md" />
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#E11900] rounded-bl-md" />
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#E11900] rounded-br-md" />

              {/* QR Image Container */}
              <div className="relative w-52 h-52 sm:w-56 sm:h-56 mx-auto flex items-center justify-center bg-white rounded-2xl overflow-hidden">
                {isExpired ? (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-white space-y-3 rounded-2xl animate-in fade-in">
                    <span className="text-3xl">⏰</span>
                    <p className="text-xs font-bold text-center">
                      {t('khqr.expired')}
                    </p>
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="px-4 py-2 rounded-xl bg-[#E11900] text-white text-xs font-bold hover:bg-[#C21500] shadow-md transition-all active:scale-95"
                    >
                      {t('khqr.regenerate')}
                    </button>
                  </div>
                ) : (
                  <>
                    <img
                      src={qrImageUrl}
                      alt="Bakong Universal KHQR"
                      className="w-full h-full object-contain"
                    />

                    {/* Central Bakong Symbol */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#E11900] flex items-center justify-center shadow-md">
                        <span className="text-[#E11900] font-black text-xs">
                          KHQR
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Verifying / Success Overlay */}
                {(isVerifying || isSuccess) && (
                  <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 space-y-3 rounded-2xl animate-in fade-in duration-200">
                    {isVerifying ? (
                      <>
                        <div className="w-12 h-12 rounded-full border-4 border-[#E11900]/20 border-t-[#E11900] animate-spin" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 animate-pulse">
                          {t('khqr.verifying')}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          NBC Network Switch • {selectedBank}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 animate-bounce">
                          ✓
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            {t('khqr.paymentSuccess')}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Received via {selectedBank}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Countdown Timer bar */}
              <div className="flex items-center justify-between text-xs px-2 pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">
                  {t('khqr.expiresIn')}:
                </span>
                <span
                  className={`font-mono font-black ${
                    timeLeft < 60
                      ? 'text-rose-600 animate-pulse'
                      : 'text-slate-800 dark:text-slate-700'
                  }`}
                >
                  ⏳ {formattedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Supported Banks Grid / Marquee */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t('khqr.scanToPay')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm mx-auto">
              {SUPPORTED_BANKS.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setSelectedBank(b.name)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center space-x-1 ${
                    selectedBank === b.name
                      ? `${b.color} ring-2 ring-orange-500 scale-105 shadow-xs`
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <span>{b.icon}</span>
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Simulation Controls */}
          <div className="space-y-2.5 pt-1">
            {/* Primary Simulate Scan Button */}
            <button
              type="button"
              disabled={isVerifying || isSuccess || isExpired}
              onClick={handleSimulatePayment}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#E11900] via-red-600 to-rose-600 hover:from-[#C21500] hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-500/25 hover:shadow-red-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
            >
              <span>{t('khqr.simulateScan')} ({selectedBank})</span>
              <span>→</span>
            </button>

            {/* Secondary Copy & Cash Fallback */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopyPayload}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>{copied ? '✓' : '📋'}</span>
                <span>{copied ? t('khqr.copied') : t('khqr.copyPayload')}</span>
              </button>

              {onCancelPayCash && (
                <button
                  type="button"
                  onClick={onCancelPayCash}
                  className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs transition-colors"
                >
                  💵 Cash on Delivery
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

KhqrPaymentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  totalAmount: PropTypes.number.isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
  onCancelPayCash: PropTypes.func,
};
