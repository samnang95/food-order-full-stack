import { useState } from 'react';
import { useTranslation } from '../../../core';
import { useGroupOrder } from '../use_group_order';

export function GroupOrderModal() {
  const { t } = useTranslation();
  const {
    isGroupModalOpen,
    closeGroupModal,
    groupOrder,
    currentMember,
    createGroupOrder,
    joinGroupOrder,
    copyInviteLink,
    copiedLink,
    isLoading,
    error,
  } = useGroupOrder();

  const initialUrlCode = typeof window !== 'undefined' && !groupOrder
    ? (new URLSearchParams(window.location.search).get('group') || new URLSearchParams(window.location.search).get('join') || '').toUpperCase()
    : '';

  const [activeTab, setActiveTab] = useState(() => (groupOrder ? 'manage' : initialUrlCode ? 'join' : 'create'));
  const [newTitle, setNewTitle] = useState('Team Feast 🍱');
  const [hostName, setHostName] = useState('');
  const [joinCode, setJoinCode] = useState(() => initialUrlCode);
  const [joinName, setJoinName] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isGroupModalOpen) return null;


  const handleCreate = async (e) => {
    e.preventDefault();
    if (!hostName.trim()) return;
    await createGroupOrder({
      title: newTitle.trim() || 'Team Feast 🍱',
      hostName: hostName.trim(),
    });
    setActiveTab('manage');
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim() || !joinName.trim()) return;
    const res = await joinGroupOrder({
      code: joinCode.trim(),
      memberName: joinName.trim(),
    });
    if (res.success) {
      setActiveTab('manage');
    }
  };

  const handleCopyCode = () => {
    if (!groupOrder?.code) return;
    navigator.clipboard.writeText(groupOrder.code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={closeGroupModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-all transform animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-xl shadow-md shadow-orange-500/30">
              👥
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {t('groupOrder.modalTitle', 'Group Ordering')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('groupOrder.modalSubtitle', 'Order together, share the cart, and split the bill')}
              </p>
            </div>
          </div>
          <button
            onClick={closeGroupModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher if not already in active session */}
        {!groupOrder && (
          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`py-2 px-3 rounded-xl transition ${
                  activeTab === 'create'
                    ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t('groupOrder.startGroup', 'Start New Group')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('join')}
                className={`py-2 px-3 rounded-xl transition ${
                  activeTab === 'join'
                    ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t('groupOrder.joinGroup', 'Join with Code')}
              </button>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* VIEW: Active Group Management */}
          {groupOrder ? (
            <div className="space-y-4">
              {/* Room Code Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 text-center space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  {t('groupOrder.shareCodePrompt', 'Share this Code with Friends')}
                </span>
                <div className="flex items-center justify-center space-x-3">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-widest bg-white dark:bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                    {groupOrder.code}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 transition active:scale-95 text-xs font-bold"
                    title={t('groupOrder.copyCode', 'Copy Code')}
                  >
                    {copiedCode ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>

              {/* Shareable Link Button */}
              <button
                type="button"
                onClick={copyInviteLink}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <span>🔗</span>
                <span>{copiedLink ? t('groupOrder.linkCopied', 'Invite Link Copied!') : t('groupOrder.copyInviteLink', 'Copy Direct Invite Link')}</span>
              </button>

              {/* Active Participants */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {t('groupOrder.participants', 'Participants')} ({groupOrder.members.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {groupOrder.totalItemsCount} {t('common.items', 'items in cart')}
                  </span>
                </div>

                <div className="space-y-2">
                  {groupOrder.members.map((member) => {
                    const memberItems = groupOrder.getItemsForMember(member.id);
                    const memberSubtotal = groupOrder.getMemberSubtotal(member.id);
                    const isMe = currentMember?.id === member.id;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs"
                            style={{ backgroundColor: member.color || '#f97316' }}
                          >
                            {member.initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                              <span>{member.name}</span>
                              {isMe && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                  {t('groupOrder.you', 'You')}
                                </span>
                              )}
                              {member.isHost && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-extrabold">
                                  👑 {t('groupOrder.host', 'Host')}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {memberItems.length === 0
                                ? t('groupOrder.choosingDishes', 'Choosing dishes...')
                                : `${memberItems.reduce((s, it) => s + it.quantity, 0)} dishes`}
                            </span>
                          </div>
                        </div>

                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          ${memberSubtotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : activeTab === 'create' ? (
            /* VIEW: Create New Group Order */
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {t('groupOrder.orderTitleLabel', 'Group Name / Occasion')}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Office Lunch, Friday Burger Feast"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {t('groupOrder.yourName', 'Your Name (Host)')} *
                </label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. Sokha, David, Lisa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition active:scale-98 disabled:opacity-50"
              >
                {isLoading ? t('common.loading', 'Creating Group...') : t('groupOrder.createBtn', 'Create Group Cart & Get Code ➔')}
              </button>
            </form>
          ) : (
            /* VIEW: Join Existing Group Order */
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {t('groupOrder.enterCode', 'Enter 6-Digit Room Code')} *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BC-9281"
                  className="w-full px-3.5 py-2.5 rounded-xl font-mono text-center tracking-widest text-base font-black border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {t('groupOrder.yourName', 'Your Name')} *
                </label>
                <input
                  type="text"
                  required
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Your nickname or name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition active:scale-98 disabled:opacity-50"
              >
                {isLoading ? t('common.loading', 'Joining...') : t('groupOrder.joinBtn', 'Join Group Order ➔')}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={closeGroupModal}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
          >
            {t('common.close', 'Close')}
          </button>
          {groupOrder && (
            <button
              type="button"
              onClick={closeGroupModal}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition"
            >
              {t('groupOrder.startAddingDishes', 'Browse Menu & Add Dishes 🍔')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
