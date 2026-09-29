import PropTypes from 'prop-types';

const STATUS_BADGES = {
  OPEN: {
    bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    label: 'Under Review',
    icon: '⏳',
  },
  IN_REVIEW: {
    bg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    label: 'Investigating',
    icon: '🔍',
  },
  RESOLVED: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    label: 'Resolved',
    icon: '✓',
  },
  CLOSED: {
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    label: 'Closed',
    icon: '📁',
  },
};

export function SupportTicketList({ tickets, onOpenReportModal }) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-3xl shadow-md shadow-orange-500/10">
          🎟️
        </div>
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            No Support Tickets Filed Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            If you ever experience a missing item, damaged packaging, or delayed order, you can file a quick report here for instant resolution.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenReportModal()}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:opacity-95 active:scale-95 transition-all"
        >
          <span>🚨</span>
          <span>Report an Order Issue</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Your Submitted Tickets ({tickets.length})
        </h3>
        <button
          type="button"
          onClick={() => onOpenReportModal()}
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1"
        >
          <span>+ Report New Issue</span>
        </button>
      </div>

      <div className="space-y-3">
        {tickets.map((tkt) => {
          const badge = STATUS_BADGES[tkt.status] || STATUS_BADGES.OPEN;
          const createdDate = tkt.createdAt ? new Date(tkt.createdAt).toLocaleString() : 'Recently';

          return (
            <div
              key={tkt.id || tkt._id || tkt.ticketNumber}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 space-y-3 shadow-xs"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {tkt.ticketNumber}
                  </span>
                  {tkt.orderNumber && (
                    <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-md border border-orange-200/60 dark:border-orange-800/60">
                      #{tkt.orderNumber}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-medium">
                    {createdDate}
                  </span>
                </div>

                {/* Status Badge */}
                <div
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              </div>

              {/* Subject & Description */}
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {tkt.subject}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tkt.description}
                </p>
              </div>

              {/* Metadata tags */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">
                  Category: {tkt.category}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">
                  Issue: {tkt.issueType}
                </span>
                {tkt.requestedResolution && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">
                    Requested: {tkt.requestedResolution}
                  </span>
                )}
              </div>

              {/* Resolution Note if Resolved */}
              {tkt.resolutionNote && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-1 text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-[11px] uppercase tracking-wider">
                    <span>✓</span>
                    <span>Support Resolution & Compensation</span>
                  </div>
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                    {tkt.resolutionNote}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

SupportTicketList.propTypes = {
  tickets: PropTypes.array,
  onOpenReportModal: PropTypes.func.isRequired,
};
