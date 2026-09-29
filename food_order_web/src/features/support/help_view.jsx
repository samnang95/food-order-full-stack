import { useState } from 'react';
import { useSupport } from './use_support';
import { FaqAccordion } from './components/FaqAccordion';
import { SupportTicketList } from './components/SupportTicketList';
import { OrderIssueReportModal } from './components/OrderIssueReportModal';

export function HelpView() {
  const {
    filteredFaqs,
    categories,
    tickets,
    activeCategory,
    searchQuery,
    isReportModalOpen,
    reportOrder,
    setActiveCategory,
    setSearchQuery,
    openReportModal,
    closeReportModal,
    submitTicket,
  } = useSupport();

  const [activeTab, setActiveTab] = useState('faqs'); // 'faqs' | 'tickets'

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Hero Help Center Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white p-6 sm:p-10 shadow-xl shadow-orange-500/15">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider">
            <span>🛡️</span>
            <span>Customer Happiness & Care</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            How can we help you today?
          </h1>

          <p className="text-xs sm:text-sm text-orange-100/90 leading-relaxed">
            Find answers to delivery questions, track courier routes, or report an issue with your meal for instant resolution.
          </p>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 text-7xl opacity-20 hidden md:block select-none pointer-events-none">
          🛵
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Report Issue */}
        <button
          type="button"
          onClick={() => openReportModal()}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left space-y-2 hover:border-red-500/50 hover:shadow-md transition-all group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            🚨
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
              Report Order Issue
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Missing item, cold food, or spill
            </div>
          </div>
        </button>

        {/* Card 2: My Tickets */}
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left space-y-2 hover:border-orange-500/50 hover:shadow-md transition-all group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            🎟️
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center justify-between">
              <span>My Tickets</span>
              {tickets.length > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-orange-500 text-white">
                  {tickets.length}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              View active & resolved reports
            </div>
          </div>
        </button>

        {/* Card 3: Call Hotline */}
        <a
          href="tel:+85523999888"
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left space-y-2 hover:border-emerald-500/50 hover:shadow-md transition-all group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            📞
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              +855 23 999 888
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Hotline 8:00 AM – 11:30 PM
            </div>
          </div>
        </a>

        {/* Card 4: Telegram Support */}
        <a
          href="https://t.me"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left space-y-2 hover:border-blue-500/50 hover:shadow-md transition-all group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            💬
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Telegram Chat
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              @BiteCraftSupport
            </div>
          </div>
        </a>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'faqs'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Help Articles & FAQs
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 ${
            activeTab === 'tickets'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>My Support Tickets</span>
          {tickets.length > 0 && (
            <span
              className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'tickets'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tickets.length}
            </span>
          )}
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'faqs' ? (
        <FaqAccordion
          faqs={filteredFaqs}
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      ) : (
        <SupportTicketList
          tickets={tickets}
          onOpenReportModal={openReportModal}
        />
      )}

      {/* Order Issue Reporting Modal */}
      <OrderIssueReportModal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        initialOrder={reportOrder}
        onSubmitted={async (ticketData) => {
          const res = await submitTicket(ticketData);
          setActiveTab('tickets');
          return res;
        }}
      />
    </div>
  );
}
