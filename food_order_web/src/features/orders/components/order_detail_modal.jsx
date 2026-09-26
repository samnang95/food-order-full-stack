import { StatusPill } from './status_pill';

export function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  if (!order) return null;

  const orderId = order._id || order.id || 'N/A';
  const shortId = orderId.length > 6 ? orderId.substring(orderId.length - 6).toUpperCase() : orderId;
  const status = (order.status || 'pending').toLowerCase();
  const totalAmount = Number(order.totalAmount || 0).toFixed(2);
  const paymentMethod = (order.paymentMethod || 'cash').toUpperCase();
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 transition-colors">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Order #{shortId}</h2>
              <StatusPill status={status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent Order'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Delivery Info */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Delivery Address
            </h3>
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
              {order.deliveryAddress || 'No address provided'}
            </p>
          </div>

          {/* Itemized Order List */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Order Items ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((item, idx) => {
                const name = item.foodName || item.food?.name || 'Dish Item';
                const qty = item.quantity || 1;
                const price = Number(item.price || item.food?.price || 0).toFixed(2);
                const itemTotal = (qty * (item.price || item.food?.price || 0)).toFixed(2);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 font-bold text-xs flex items-center justify-center">
                        {qty}x
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{name}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">${price} each</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">${itemTotal}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Payment Method</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {paymentMethod === 'KHQR' ? 'ABA KHQR' : paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Payment Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase text-xs">
                {order.paymentStatus || 'Verified'}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
              <span>Total Bill</span>
              <span className="text-orange-600 dark:text-orange-400 text-lg">${totalAmount}</span>
            </div>
          </div>

          {/* Status Management */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Update Order Status
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onUpdateStatus(orderId, 'preparing')}
                className={`py-2 px-3 rounded-xl font-semibold border transition-all cursor-pointer ${
                  status === 'preparing'
                    ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-300 font-bold'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                🍳 Cooking (Preparing)
              </button>
              <button
                onClick={() => onUpdateStatus(orderId, 'on_the_way')}
                className={`py-2 px-3 rounded-xl font-semibold border transition-all cursor-pointer ${
                  status === 'on_the_way'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                🛵 Dispatch Driver
              </button>
              <button
                onClick={() => onUpdateStatus(orderId, 'delivered')}
                className={`py-2 px-3 rounded-xl font-semibold border transition-all cursor-pointer ${
                  status === 'delivered'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                ✅ Mark Delivered
              </button>
              <button
                onClick={() => onUpdateStatus(orderId, 'cancelled')}
                className={`py-2 px-3 rounded-xl font-semibold border transition-all cursor-pointer ${
                  status === 'cancelled'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
              >
                ❌ Cancel Order
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 dark:bg-orange-500 hover:bg-slate-800 dark:hover:bg-orange-600 text-white font-semibold text-xs py-2.5 px-6 rounded-xl transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
