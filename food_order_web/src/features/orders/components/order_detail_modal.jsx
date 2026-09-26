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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Order #{shortId}</h2>
              <StatusPill status={status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent Order'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Delivery Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Delivery Address
            </h3>
            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
              {order.deliveryAddress || 'No address provided'}
            </p>
          </div>

          {/* Itemized Order List */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
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
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                        {qty}x
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{name}</div>
                        <div className="text-xs text-slate-400">${price} each</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-900">${itemTotal}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Payment Method</span>
              <span className="font-semibold text-slate-800">
                {paymentMethod === 'KHQR' ? 'ABA KHQR' : paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Status</span>
              <span className="font-semibold text-emerald-600 uppercase text-xs">
                {order.paymentStatus || 'Verified'}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Bill</span>
              <span className="text-orange-600 text-lg">${totalAmount}</span>
            </div>
          </div>

          {/* Status Management */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Update Order Status
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onUpdateStatus(orderId, 'preparing')}
                className={`py-2 px-3 rounded-xl font-semibold border transition-all ${
                  status === 'preparing'
                    ? 'bg-orange-50 border-orange-300 text-orange-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                🍳 Cooking (Preparing)
              </button>
              <button
                onClick={() => onUpdateStatus(orderId, 'on_the_way')}
                className={`py-2 px-3 rounded-xl font-semibold border transition-all ${
                  status === 'on_the_way'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                🛵 Dispatch Driver
              </button>
              <button
                onClick={() => onUpdateStatus(orderId, 'delivered')}
                className={`py-2 px-3 rounded-xl font-semibold border transition-all ${
                  status === 'delivered'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ✅ Mark Delivered
              </button>
              <button
                onClick={() => onUpdateStatus(orderId, 'cancelled')}
                className={`py-2 px-3 rounded-xl font-semibold border transition-all ${
                  status === 'cancelled'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                    : 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50'
                }`}
              >
                ❌ Cancel Order
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-6 rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
