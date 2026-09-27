import { useState, useMemo } from 'react';
import { useTranslation } from '../../../core';
import { useSchedule } from '../use_schedule';

function ScheduleModalDialog({
  currentMode,
  currentDate,
  currentTimeSlot,
  currentNote,
  presetTimeSlots,
  saveSchedule,
  closeModal,
  isLoading,
}) {
  const { t } = useTranslation();
  const [selectedMode, setSelectedMode] = useState(currentMode);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedSlot, setSelectedSlot] = useState(currentTimeSlot);
  const [deliveryNote, setDeliveryNote] = useState(currentNote || '');
  const [activeCategory, setActiveCategory] = useState('lunch');

  // Generate 3 date options using useMemo to ensure pure render
  const dateOptions = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    const dayAfter = new Date(today.getTime() + 86400000 * 2);

    const formatDateVal = (d) => d.toISOString().split('T')[0];

    return [
      {
        id: 'today',
        dateVal: formatDateVal(today),
        label: t('schedule.today', 'Today'),
        subLabel: today.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      },
      {
        id: 'tomorrow',
        dateVal: formatDateVal(tomorrow),
        label: t('schedule.tomorrow', 'Tomorrow'),
        subLabel: tomorrow.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      },
      {
        id: 'dayAfter',
        dateVal: formatDateVal(dayAfter),
        label: dayAfter.toLocaleDateString(undefined, { weekday: 'short' }),
        subLabel: dayAfter.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      },
    ];
  }, [t]);

  const filteredSlots = presetTimeSlots.filter((slot) => {
    if (activeCategory === 'all') return true;
    return slot.category === activeCategory;
  });

  const handleConfirm = async () => {
    await saveSchedule({
      mode: selectedMode,
      date: selectedDate,
      timeSlot: selectedSlot,
      note: deliveryNote,
    });
    closeModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-all transform animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/30">
                ⏰
              </div>
              <div>
                <h3
                  id="schedule-modal-title"
                  className="text-xl font-bold text-slate-900 dark:text-white"
                >
                  {t('schedule.modalTitle', 'Delivery Schedule')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('schedule.modalSubtitle', 'Choose your preferred timing for maximum freshness')}
                </p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              aria-label={t('common.close', 'Close')}
            >
              ✕
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setSelectedMode('asap')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                selectedMode === 'asap'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>⚡</span>
              <span>{t('schedule.deliverAsap', 'Deliver ASAP')}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode('scheduled')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                selectedMode === 'scheduled'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>📅</span>
              <span>{t('schedule.scheduleLater', 'Schedule for Later')}</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[68vh] overflow-y-auto custom-scrollbar">
          {selectedMode === 'asap' ? (
            <div className="p-5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-3">
              <div className="text-4xl animate-bounce">⚡🛵💨</div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {t('schedule.asapHeading', 'Express Priority Delivery')}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                {t(
                  'schedule.asapDescription',
                  'Our chefs will start cooking immediately. Your food will arrive piping hot in approximately 25-35 minutes.'
                )}
              </p>
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                <span>⏱️</span>
                <span>{t('schedule.estimatedArrival', 'Est. Arrival: 25 - 35 mins')}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  {t('schedule.selectDate', 'Select Date')}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {dateOptions.map((opt) => {
                    const isSelected = selectedDate === opt.dateVal;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedDate(opt.dateVal)}
                        className={`p-3 rounded-2xl border text-center transition-all duration-200 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold shadow-sm ring-2 ring-amber-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-sm font-semibold">{opt.label}</div>
                        <div className="text-xs opacity-75">{opt.subLabel}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Meal Category Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('schedule.selectTimeSlot', 'Select Time Slot')}
                  </label>
                  <div className="flex items-center space-x-1">
                    {[
                      { id: 'lunch', label: t('schedule.mealLunch', 'Lunch 🍱') },
                      { id: 'afternoon', label: t('schedule.mealTea', 'Tea 🧋') },
                      { id: 'dinner', label: t('schedule.mealDinner', 'Dinner 🍔') },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          activeCategory === cat.id
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {filteredSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.label;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.label)}
                        className={`flex items-center justify-between p-3 rounded-2xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-sm ring-2 ring-amber-500/20 font-bold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <span>{slot.icon}</span>
                          <span>{slot.label}</span>
                        </span>
                        {isSelected && <span className="text-amber-500 font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Delivery Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {t('schedule.deliveryNoteOptional', 'Scheduling Note (Optional)')}
                </label>
                <input
                  type="text"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder={t(
                    'schedule.deliveryNotePlaceholder',
                    'e.g. Please ring doorbell, meeting starts at 12:45 PM'
                  )}
                  maxLength={100}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {t('common.cancel', 'Cancel')}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/25 transition disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{t('schedule.saving', 'Saving...')}</span>
              </>
            ) : (
              <>
                <span>{t('schedule.confirmSchedule', 'Confirm Schedule')}</span>
                <span>➔</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScheduleModal() {
  const {
    isModalOpen,
    closeModal,
    mode,
    date,
    timeSlot,
    note,
    presetTimeSlots,
    saveSchedule,
    isLoading,
  } = useSchedule();

  if (!isModalOpen) return null;

  return (
    <ScheduleModalDialog
      currentMode={mode}
      currentDate={date}
      currentTimeSlot={timeSlot}
      currentNote={note}
      presetTimeSlots={presetTimeSlots}
      saveSchedule={saveSchedule}
      closeModal={closeModal}
      isLoading={isLoading}
    />
  );
}
