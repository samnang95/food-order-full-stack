import { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * TrackingTimeline — Premium vertical stepper showing delivery progress
 * with animated pulse on current step and completion checkmarks.
 */
export function TrackingTimeline({ timeline = [] }) {

  const steps = useMemo(() => {
    if (timeline.length > 0) return timeline;
    // Fallback minimal timeline
    return [
      { key: 'pending', label: 'Order Placed', icon: '📝', isCompleted: false, isCurrent: true },
      { key: 'preparing', label: 'Preparing', icon: '🍳', isCompleted: false, isCurrent: false },
      { key: 'out_for_delivery', label: 'On the Way', icon: '🛵', isCompleted: false, isCurrent: false },
      { key: 'delivered', label: 'Delivered', icon: '🎉', isCompleted: false, isCurrent: false },
    ];
  }, [timeline]);

  return (
    <div className="space-y-0">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.key} className="flex items-stretch">
            {/* Left: Icon + Connector Line */}
            <div className="flex flex-col items-center mr-4 relative">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-all duration-500 ${
                  step.isCurrent
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110 ring-4 ring-orange-500/20'
                    : step.isCompleted
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {step.isCompleted ? '✓' : step.icon}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="w-0.5 flex-1 min-h-[28px] my-1">
                  <div
                    className={`w-full h-full rounded-full transition-all duration-700 ${
                      step.isCompleted
                        ? 'bg-emerald-400 dark:bg-emerald-500'
                        : step.isCurrent
                        ? 'bg-gradient-to-b from-orange-500 to-slate-200 dark:to-slate-700'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Right: Label + Time */}
            <div className={`pb-5 pt-2 flex-1 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex items-center justify-between">
                <h4
                  className={`text-xs font-bold transition-colors ${
                    step.isCurrent
                      ? 'text-orange-600 dark:text-orange-400'
                      : step.isCompleted
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.label}
                </h4>
                {step.isCurrent && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 animate-pulse">
                    In Progress
                  </span>
                )}
              </div>

              {step.timestamp && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(step.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

TrackingTimeline.propTypes = {
  timeline: PropTypes.array,
  status: PropTypes.string,
};
