import { useState } from 'react';
import { useTranslation, formatUsd, formatKhr } from '../../../core';
import { useGroupOrder } from '../use_group_order';
import { useCart } from '../../cart';

export function SplitBillModal() {
  const { t } = useTranslation();
  const { isSplitBillModalOpen, closeSplitBillModal, groupOrder } = useGroupOrder();
  const { deliveryFee, discountAmount, tipAmount } = useCart();
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isSplitBillModalOpen || !groupOrder) return null;

  const breakdown = groupOrder.getSplitBillBreakdown({
    deliveryFee: Number(deliveryFee) || 0,
    discountAmount: Number(discountAmount) || 0,
    tipAmount: Number(tipAmount) || 0,
    exchangeRate: 4100,
  });

  const handleCopySummary = () => {
    let text = `🧾 Split Bill: ${groupOrder.title} (${groupOrder.code})\n`;
    text += `Total: ${formatUsd(breakdown.totalFinalUsd)} (${formatKhr(breakdown.totalFinalUsd)})\n`;
    text += `----------------------------------------\n`;

    breakdown.memberShares.forEach((share) => {
      text += `👤 ${share.memberName}: ${share.formattedTotalUsd} (${share.formattedTotalKhr})\n`;
      share.items.forEach((item) => {
        text += `   • ${item.quantity}x ${item.foodName} ($${item.totalPrice.toFixed(2)})\n`;
      });
      if (share.deliveryShare > 0) {
        text += `   + Delivery share: $${share.deliveryShare.toFixed(2)}\n`;
      }
      if (share.discountShare > 0) {
        text += `   - Discount: -$${share.discountShare.toFixed(2)}\n`;
      }
      text += `\n`;
    });

    text += `🙏 Pay host via Bakong KHQR / Cash. Enjoy your meal! 🍱`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 3000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={closeSplitBillModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-all transform animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-xl shadow-md shadow-orange-500/30">
              🧾
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {t('groupOrder.splitBillTitle', 'Split Bill Calculator')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {groupOrder.title} • {groupOrder.members.length} {t('groupOrder.membersCount', 'participants')}
              </p>
            </div>
          </div>
          <button
            onClick={closeSplitBillModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Group Grand Total Banner */}
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('groupOrder.grandTotal', 'Group Total (All Taxes & Fees)')}
            </span>
            <div className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400">
              {formatUsd(breakdown.totalFinalUsd)}
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {formatKhr(breakdown.totalFinalUsd)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition flex items-center space-x-1.5"
          >
            <span>📋</span>
            <span>{copiedSummary ? t('groupOrder.copied', 'Copied to Clipboard!') : t('groupOrder.copySplitText', 'Copy Split Summary')}</span>
          </button>
        </div>

        {/* Member Breakdown Cards */}
        <div className="p-6 space-y-3.5 max-h-[58vh] overflow-y-auto custom-scrollbar">
          {breakdown.memberShares.map((share) => (
            <div
              key={share.memberId}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs"
                    style={{ backgroundColor: share.memberColor || '#f97316' }}
                  >
                    {share.memberName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span>{share.memberName}</span>
                      {share.isHost && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-black">
                          👑 Host
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {share.itemsCount} dishes ordered
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {share.formattedTotalUsd}
                  </div>
                  <div className="text-[11px] font-bold text-slate-400">
                    {share.formattedTotalKhr}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {share.items.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No dishes added yet.</p>
                ) : (
                  share.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-[11px]">
                      <span className="truncate pr-2">
                        {item.quantity}x {item.foodName}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 shrink-0">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Fees & Discounts Shared */}
              {(share.deliveryShare > 0 || share.discountShare > 0 || share.tipShare > 0) && (
                <div className="pt-1.5 border-t border-dashed border-slate-100 dark:border-slate-700/60 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
                  {share.deliveryShare > 0 && (
                    <span>Delivery share: +${share.deliveryShare.toFixed(2)}</span>
                  )}
                  {share.discountShare > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Discount: -${share.discountShare.toFixed(2)}
                    </span>
                  )}
                  {share.tipShare > 0 && (
                    <span>Tip share: +${share.tipShare.toFixed(2)}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={closeSplitBillModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {t('common.done', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
}
