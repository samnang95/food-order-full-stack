import { useTranslation } from '../../../core';
import { useSchedule } from '../use_schedule';

export function DeliveryScheduleSelector({ compact = false }) {
  const { t } = useTranslation();
  const { mode, currentSchedule, openModal, setMode, saveSchedule } = useSchedule();

  const isAsap = mode === 'asap';

  const handleQuickToggle = async (newMode) => {
    if (newMode === 'asap') {
      await saveSchedule({ mode: 'asap' });
    } else {
      // If switching to scheduled, open the picker modal directly
      setMode('scheduled');
      openModal();
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-base">{isAsap ? '⚡' : '📅'}</span>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-100">
              {currentSchedule.getFormattedSchedule(t)}
            </div>
            {currentSchedule.note && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                "{currentSchedule.note}"
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] shadow-sm transition"
        >
          {t('common.change', 'Change')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 shadow-sm transition-all hover:border-amber-500/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-bold">
            {isAsap ? '⚡' : '📅'}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {t('schedule.deliveryTiming', 'Delivery Timing')}
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {currentSchedule.getFormattedSchedule(t)}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/25 transition active:scale-95"
        >
          {t('common.change', 'Change')}
        </button>
      </div>

      {/* Mode Quick Toggle Pills */}
      <div className="grid grid-cols-2 gap-2 mt-3 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs">
        <button
          type="button"
          onClick={() => handleQuickToggle('asap')}
          className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
            isAsap
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>⚡</span>
          <span>{t('schedule.deliverAsapShort', 'Deliver ASAP')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickToggle('scheduled')}
          className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
            !isAsap
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>📅</span>
          <span>{t('schedule.scheduleLaterShort', 'Schedule for Later')}</span>
        </button>
      </div>

      {currentSchedule.note && (
        <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center space-x-1.5">
          <span className="text-amber-500 font-bold">📝</span>
          <span className="truncate">{currentSchedule.note}</span>
        </div>
      )}
    </div>
  );
}
