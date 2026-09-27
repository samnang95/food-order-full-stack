import { useTranslation } from '../../../core';
import { useSchedule } from '../use_schedule';
import { useCart } from '../../cart';

export function QuickReorderButton({ order, size = 'md', className = '' }) {
  const { t } = useTranslation();
  const { quickReorder, reorderLoadingOrderId, reorderSuccessResult } = useSchedule();
  const cartStore = useCart();

  if (!order || !order.items || order.items.length === 0) return null;

  const orderId = order.id || order.orderNumber;
  const isLoading = reorderLoadingOrderId === orderId;
  const isRecentSuccess =
    reorderSuccessResult && reorderSuccessResult.orderId === orderId;

  const handleReorder = async (e) => {
    e.stopPropagation();
    if (isLoading) return;
    await quickReorder(order, cartStore);
  };

  const totalItemsCount = order.items.reduce(
    (acc, it) => acc + (it.quantity || 1),
    0
  );

  if (size === 'sm') {
    return (
      <button
        type="button"
        disabled={isLoading}
        onClick={handleReorder}
        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-60 ${
          isRecentSuccess
            ? 'bg-emerald-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-500/30'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20'
        } ${className}`}
        title={t('schedule.reorderTooltip', 'Add all items to cart instantly')}
      >
        {isLoading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{t('schedule.adding', 'Adding...')}</span>
          </>
        ) : isRecentSuccess ? (
          <>
            <span>✓</span>
            <span>{t('schedule.reorderSuccess', 'Added!')}</span>
          </>
        ) : (
          <>
            <span>🔁</span>
            <span>{t('schedule.reorderBtn', 'Reorder')}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleReorder}
      className={`w-full py-3 px-4 rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-200 shadow-md active:scale-[0.98] disabled:opacity-60 flex items-center justify-center space-x-2 ${
        isRecentSuccess
          ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/40'
          : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/30'
      } ${className}`}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{t('schedule.reorderingItems', 'Adding items to cart...')}</span>
        </>
      ) : isRecentSuccess ? (
        <>
          <span className="text-lg">✓</span>
          <span>
            {t(
              'schedule.reorderSuccessWithCount',
              'Added {{count}} items to cart!',
              { count: totalItemsCount }
            )}
          </span>
        </>
      ) : (
        <>
          <span className="text-lg">⚡🔁</span>
          <span>
            {t('schedule.oneClickReorder', '1-Click Quick Reorder ({{count}} items)', {
              count: totalItemsCount,
            })}
          </span>
        </>
      )}
    </button>
  );
}
