import { useState } from 'react';
import PropTypes from 'prop-types';

export function FaqAccordion({
  faqs,
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) {
  const [openIds, setOpenIds] = useState(['faq_delivery_zones', 'faq_missing_items']);
  const [helpfulMap, setHelpfulMap] = useState({});

  const toggleFaq = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleVote = (id, e) => {
    e.stopPropagation();
    if (helpfulMap[id]) return;
    setHelpfulMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Category Pills & Search */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-xl">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search FAQs (e.g. refund, missing item, delivery zone, ABA KHQR)..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:border-orange-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/25'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-3">
        {faqs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
            <span className="text-3xl">🔎</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No matching answers found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try searching with different keywords or submit an inquiry directly to our 24/7 support desk.
            </p>
          </div>
        ) : (
          faqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            const hasVoted = helpfulMap[faq.id];
            const currentVotes = (faq.helpfulVotes || 0) + (hasVoted ? 1 : 0);

            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left space-x-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-black shrink-0">
                      ?
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                      {faq.question}
                    </span>
                  </div>
                  <span
                    className={`text-slate-400 transition-transform duration-200 text-xs shrink-0 ${
                      isOpen ? 'rotate-180 text-orange-500' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-800/20 space-y-3 animate-in fade-in duration-150">
                    <p>{faq.answer}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/40 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-[10px]">
                        {faq.category}
                      </span>

                      <div className="flex items-center space-x-2">
                        <span>Was this helpful?</span>
                        <button
                          type="button"
                          onClick={(e) => handleVote(faq.id, e)}
                          disabled={hasVoted}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all flex items-center space-x-1 ${
                            hasVoted
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 active:scale-95'
                          }`}
                        >
                          <span>👍</span>
                          <span>{currentVotes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

FaqAccordion.propTypes = {
  faqs: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  activeCategory: PropTypes.string.isRequired,
  onSelectCategory: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};
