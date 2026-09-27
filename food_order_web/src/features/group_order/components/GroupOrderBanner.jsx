import { useTranslation } from '../../../core';
import { useGroupOrder } from '../use_group_order';

export function GroupOrderBanner() {
  const { t } = useTranslation();
  const {
    isGroupOrderActive,
    groupOrder,
    currentMember,
    isHost,
    isLocked,
    toggleLockGroup,
    openGroupModal,
    openSplitBillModal,
    leaveGroupOrder,
  } = useGroupOrder();

  if (!isGroupOrderActive || !groupOrder) return null;

  return (
    <aside
      aria-label={t('groupOrder.bannerLabel', 'Group Order Session')}
      className="sticky top-16 z-30 w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-lg backdrop-blur-md border-b border-orange-500/30 transition-all animate-slideDown"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Group Info & Code */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm shadow-inner shrink-0">
            👥
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm tracking-tight truncate max-w-[160px] sm:max-w-xs">
                {groupOrder.title}
              </span>
              <span className="font-mono bg-black/25 px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-wider">
                {groupOrder.code}
              </span>
              {isLocked && (
                <span className="bg-rose-500/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                  <span>🔒</span>
                  <span>{t('groupOrder.lockedBadge', 'Locked')}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-orange-100 flex items-center space-x-1">
              <span>{t('groupOrder.orderingAs', 'Ordering as')}:</span>
              <span className="font-bold underline decoration-white/40">
                {currentMember?.name || 'Member'}
              </span>
              {isHost && <span>(👑 {t('groupOrder.host', 'Host')})</span>}
            </p>
          </div>
        </div>

        {/* Center: Participant Avatars Stack */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex -space-x-2 overflow-hidden py-1">
            {groupOrder.members.map((m) => (
              <div
                key={m.id}
                className="inline-block h-7 w-7 rounded-full ring-2 ring-orange-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs"
                style={{ backgroundColor: m.color || '#f97316' }}
                title={`${m.name} (${groupOrder.getItemsForMember(m.id).length} items)`}
              >
                {m.initials}
              </div>
            ))}
          </div>
          <span className="text-[11px] font-bold text-orange-100">
            {groupOrder.members.length} {t('groupOrder.friends', 'friends')} • {groupOrder.totalItemsCount} {t('common.items', 'items')}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Host Lock Control */}
          {isHost && (
            <button
              type="button"
              onClick={() => toggleLockGroup(!isLocked)}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 text-[11px] ${
                isLocked
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title={isLocked ? 'Unlock cart for friends' : 'Lock cart to prevent additions'}
            >
              <span>{isLocked ? '🔓' : '🔒'}</span>
              <span className="hidden sm:inline">
                {isLocked ? t('groupOrder.unlock', 'Unlock') : t('groupOrder.lock', 'Lock Cart')}
              </span>
            </button>
          )}

          {/* Split Bill Calculator CTA */}
          <button
            type="button"
            onClick={openSplitBillModal}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 text-orange-700 font-extrabold transition-all shadow-sm flex items-center space-x-1.5 active:scale-95 text-[11px]"
          >
            <span>🧾</span>
            <span>{t('groupOrder.splitBillBtn', 'Split Bill')}</span>
          </button>

          {/* Invite More Friends */}
          <button
            type="button"
            onClick={openGroupModal}
            className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition text-[11px] flex items-center space-x-1"
          >
            <span>➕</span>
            <span className="hidden sm:inline">{t('groupOrder.invite', 'Invite')}</span>
          </button>

          {/* Leave / Exit */}
          <button
            type="button"
            onClick={leaveGroupOrder}
            className="px-2.5 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white/90 font-medium transition text-[11px]"
            title={t('groupOrder.leaveGroup', 'Leave Group Order')}
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}
