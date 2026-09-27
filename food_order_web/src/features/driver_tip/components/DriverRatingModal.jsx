import { useState } from 'react';
import { useDriverTip } from '../use_driver_tip';
import { DRIVER_COMPLIMENTS } from '../../../domain/driver_tip/entities/driver_entity';
import { formatUsd, formatKhr, useTranslation } from '../../../core';

const COMPLIMENT_CONFIG = [
  { id: DRIVER_COMPLIMENTS.SUPER_FAST, icon: '⚡', labelKey: 'driverTip.superFast' },
  { id: DRIVER_COMPLIMENTS.CAREFUL_HANDLING, icon: '🛵', labelKey: 'driverTip.carefulHandling' },
  { id: DRIVER_COMPLIMENTS.FRIENDLY_SMILE, icon: '😊', labelKey: 'driverTip.friendlySmile' },
  { id: DRIVER_COMPLIMENTS.FOLLOWED_NOTES, icon: '📍', labelKey: 'driverTip.followedNotes' },
  { id: DRIVER_COMPLIMENTS.WEATHER_HERO, icon: '🛡️', labelKey: 'driverTip.weatherHero' },
];

const TIP_OPTIONS = [0, 1.0, 2.0, 5.0];

function DriverRatingModalContent() {
  const { t } = useTranslation();
  const {
    driver,
    activeOrderId,
    closeRatingModal,
    submitFeedback,
    openKhqrTipModal,
    generateBakongQr,
  } = useDriverTip();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedCompliments, setSelectedCompliments] = useState([
    DRIVER_COMPLIMENTS.SUPER_FAST,
    DRIVER_COMPLIMENTS.FRIENDLY_SMILE,
  ]);
  const [selectedTip, setSelectedTip] = useState(1.0);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleToggleCompliment = (compId) => {
    setSelectedCompliments((prev) =>
      prev.includes(compId) ? prev.filter((c) => c !== compId) : [...prev, compId]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitFeedback({
        orderId: activeOrderId || `order_${Date.now()}`,
        rating,
        compliments: selectedCompliments,
        reviewText: reviewNote,
        tipAmount: selectedTip,
      });

      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        closeRatingModal();
      }, 1200);
    } catch (e) {
      console.warn('Feedback submission failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayViaBakong = () => {
    const payload = generateBakongQr(selectedTip || 1.0, activeOrderId || `order_${Date.now()}`);
    closeRatingModal();
    openKhqrTipModal(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 text-center relative bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent">
          <button
            type="button"
            onClick={closeRatingModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>

          <div className="relative inline-block mx-auto mb-2">
            <img
              src={driver?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160'}
              alt={driver?.name}
              className="w-16 h-16 rounded-3xl object-cover border-2 border-amber-500 shadow-md shadow-amber-500/20"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160';
              }}
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs">
              🛵
            </span>
          </div>

          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {t('driverTip.rateYourDelivery', 'How was your delivery with {{name}}?', {
              name: driver?.name || 'Sok Dara',
            })}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {driver?.vehicle || 'Honda Wave 125i'} • {driver?.plateNumber || 'Phnom Penh 1AC-9281'}
          </p>

          {/* Interactive 5-Star Rating */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoverRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-hidden"
                >
                  <span
                    className={`text-3xl ${
                      active ? 'text-amber-400 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  >
                    ★
                  </span>
                </button>
              );
            })}
          </div>
          <span className="inline-block mt-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            {rating === 5
              ? t('driverTip.ratingExcellent', 'Excellent & Smooth! 🌟')
              : rating === 4
              ? t('driverTip.ratingGreat', 'Very Good! 👍')
              : rating === 3
              ? t('driverTip.ratingGood', 'Good delivery 🙂')
              : t('driverTip.ratingAverage', 'Could be improved 🛠️')}
          </span>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Compliments Badges */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              {t('driverTip.sendCompliment', 'Send a Compliment Badge')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {COMPLIMENT_CONFIG.map((comp) => {
                const isSelected = selectedCompliments.includes(comp.id);
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => handleToggleCompliment(comp.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 border ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/25 scale-102'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                    }`}
                  >
                    <span>{comp.icon}</span>
                    <span>{t(comp.labelKey, comp.id)}</span>
                    {isSelected && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add a Tip */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('driverTip.addTip', 'Add a Rider Tip')}
              </h4>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                100% {t('driverTip.goesToCourier', 'goes to courier')}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {TIP_OPTIONS.map((amount) => {
                const isSelected = selectedTip === amount;
                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setSelectedTip(amount)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs scale-102 ring-2 ring-amber-400/30'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                    }`}
                  >
                    <span className="block font-black">
                      {amount === 0 ? t('driverTip.noTip', 'No Tip') : formatUsd(amount)}
                    </span>
                    {amount > 0 && (
                      <span className="block text-[8px] font-mono opacity-80">
                        {formatKhr(amount)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedTip > 0 && (
              <button
                type="button"
                onClick={handlePayViaBakong}
                className="w-full mt-2.5 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm hover:opacity-95 transition-opacity"
              >
                <span>🇰🇭</span>
                <span>{t('driverTip.tipWithBakong', 'Scan & Tip with Bakong KHQR')}</span>
              </button>
            )}
          </div>

          {/* Thank You Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {t('driverTip.thankYouNote', 'Leave a Thank You Note (Optional)')}
            </label>
            <textarea
              rows={2}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={t(
                'driverTip.notePlaceholder',
                'e.g. Thanks for bringing the food while it was raining! Super fast!'
              )}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            type="button"
            onClick={closeRatingModal}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t('common.cancel', 'Skip')}
          </button>

          <button
            type="button"
            disabled={isSubmitting || isDone}
            onClick={handleSubmit}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-md ${
              isDone
                ? 'bg-emerald-500 text-white scale-102'
                : 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-amber-500/25'
            }`}
          >
            {isDone
              ? t('driverTip.feedbackSubmitted', '✓ Thank You!')
              : isSubmitting
              ? t('driverTip.submitting', 'Submitting...')
              : t('driverTip.submitReviewAndTip', 'Submit Review & Tip')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DriverRatingModal() {
  const { isRatingModalOpen } = useDriverTip();

  if (!isRatingModalOpen) return null;

  return <DriverRatingModalContent />;
}
