import { StatusPill } from './status_pill';

export function OrderCard({ order, onSelect, onUpdateStatus }) {
  const orderId = order._id || order.id || 'N/A';
  const shortId = orderId.length > 6 ? orderId.substring(orderId.length - 6).toUpperCase() : orderId;
  const status = (order.status || 'pending').toLowerCase();
  const totalAmount = Number(order.totalAmount || 0).toFixed(2);
  const paymentMethod = (order.paymentMethod || 'cash').toUpperCase();
  const itemCount = Array.isArray(order.items) ? order.items.length : 0;

  // Format creation time
  let timeStr = 'Just now';
  if (order.createdAt) {
    const diff = Math.floor((new Date() - new Date(order.createdAt)) / 60000);
    if (diff > 0 && diff < 60) timeStr = `${diff}m ago`;
    else if (diff >= 60) timeStr = `${Math.floor(diff / 60)}h ago`;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">#{shortId}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">• {timeStr}</span>
          </div>
          <StatusPill status={status} />
        </div>

        {/* Customer & Address snippet */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Delivery Details
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
            {order.deliveryAddress || 'Standard Delivery Address'}
          </p>
        </div>

        {/* Items Summary */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 mb-4 border border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Items Ordered</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{itemCount} items</span>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
            {Array.isArray(order.items)
              ? order.items
                  .map((it) => `${it.quantity || 1}x ${it.foodName || it.food?.name || 'Dish'}`)
                  .join(', ')
              : 'No item summary'}
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 mb-4">
          <div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Total Amount</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">${totalAmount}</div>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">
            {paymentMethod === 'KHQR' ? 'ABA KHQR' : paymentMethod}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelect(order)}
            className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-98 text-slate-700 dark:text-slate-200 font-semibold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer"
          >
            Details
          </button>

          {status === 'pending' && (
            <button
              onClick={() => onUpdateStatus(orderId, 'preparing')}
              className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-semibold text-xs py-2 px-3 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Accept Order
            </button>
          )}

          {status === 'confirmed' && (
            <button
              onClick={() => onUpdateStatus(orderId, 'preparing')}
              className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-semibold text-xs py-2 px-3 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Start Cooking
            </button>
          )}

          {status === 'preparing' && (
            <button
              onClick={() => onUpdateStatus(orderId, 'on_the_way')}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-semibold text-xs py-2 px-3 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Dispatch Driver
            </button>
          )}

          {status === 'on_the_way' && (
            <button
              onClick={() => onUpdateStatus(orderId, 'delivered')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-semibold text-xs py-2 px-3 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Mark Delivered
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
