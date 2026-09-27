import { useTranslation, formatUsd } from '../../../core';
import { useGroupOrder } from '../use_group_order';

export function GroupCartSection() {
  const { t } = useTranslation();
  const {
    groupOrder,
    currentMember,
    isHost,
    isLocked,
    removeItemFromGroup,
    openSplitBillModal,
    openGroupModal,
  } = useGroupOrder();

  if (!groupOrder) return null;

  return (
    <div className="space-y-4">
      {/* Group Cart Header Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="text-xl">👥</span>
          <div>
            <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>{groupOrder.title}</span>
              <span className="font-mono text-[10px] bg-orange-500 text-white px-1.5 py-0.2 rounded-md">
                {groupOrder.code}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {groupOrder.members.length} {t('groupOrder.friends', 'friends ordering')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={openSplitBillModal}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold shadow-2xs hover:bg-slate-100 transition"
          >
            🧾 {t('groupOrder.split', 'Split')}
          </button>
          <button
            type="button"
            onClick={openGroupModal}
            className="px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold shadow-xs transition"
          >
            ➕ {t('groupOrder.invite', 'Invite')}
          </button>
        </div>
      </div>

      {isLocked && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center space-x-2">
          <span>🔒</span>
          <span>{t('groupOrder.cartLockedNote', 'Cart is locked by host. No new dishes can be added.')}</span>
        </div>
      )}

      {/* Disaggregated by Member */}
      {groupOrder.items.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
          <span className="text-2xl block mb-1">🛒</span>
          {t('groupOrder.emptyGroupCart', 'No dishes added to the group cart yet. Browse menu to add dishes!')}
        </div>
      ) : (
        <div className="space-y-3.5">
          {groupOrder.members.map((member) => {
            const memberItems = groupOrder.getItemsForMember(member.id);
            if (memberItems.length === 0) return null;
            const subtotal = groupOrder.getMemberSubtotal(member.id);
            const isMe = currentMember?.id === member.id;

            return (
              <div
                key={member.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 space-y-2.5"
              >
                {/* Member Header */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold shadow-2xs"
                      style={{ backgroundColor: member.color || '#f97316' }}
                    >
                      {member.initials}
                    </div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">
                      {member.name} {isMe && `(${t('groupOrder.you', 'You')})`}
                    </span>
                    {member.isHost && (
                      <span className="text-[9px] bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-md">
                        👑
                      </span>
                    )}
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">
                    {formatUsd(subtotal)}
                  </span>
                </div>

                {/* Member Items */}
                <div className="space-y-2">
                  {memberItems.map((item) => {
                    const canDelete = !isLocked && (isHost || isMe);

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-1 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 px-1 rounded-xl transition"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          {item.foodImageUrl && (
                            <img
                              src={item.foodImageUrl}
                              alt={item.foodName}
                              className="w-8 h-8 rounded-lg object-cover shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="truncate">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                              {item.quantity}x {item.foodName}
                            </p>
                            {item.notes && (
                              <p className="text-[10px] text-slate-400 italic truncate">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                            {formatUsd(item.totalPrice)}
                          </span>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => removeItemFromGroup(item.id)}
                              className="text-slate-400 hover:text-rose-500 transition p-1"
                              title={t('common.remove', 'Remove item')}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
