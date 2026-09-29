import { useState } from 'react';
import PropTypes from 'prop-types';
import { useOrders } from '../../orders/use_orders';
import { useAuth } from '../../auth/use_auth';

const ISSUE_TYPES = [
  { id: 'Missing Item', label: 'Missing Item / Dish', icon: '❌' },
  { id: 'Damaged / Spilled Packaging', label: 'Damaged / Spilled Packaging', icon: '🥣' },
  { id: 'Significantly Late', label: 'Significantly Late Delivery', icon: '⏳' },
  { id: 'Cold / Wrong Temperature', label: 'Food Arrived Cold', icon: '❄️' },
  { id: 'Incorrect Item', label: 'Wrong Item Delivered', icon: '❓' },
  { id: 'Payment Dispute', label: 'Payment or Double Charge', icon: '💳' },
  { id: 'Other', label: 'Other Special Issue', icon: '📝' },
];

const RESOLUTIONS = [
  {
    id: 'Instant Wallet Refund',
    label: 'Instant Wallet Refund',
    desc: 'Credited directly to your BiteCraft wallet balance',
    icon: '💰',
  },
  {
    id: 'Redelivery',
    label: 'Complimentary Redelivery',
    desc: 'Fresh replacement dish sent with priority rider',
    icon: '🛵',
  },
  {
    id: 'Voucher & Loyalty Points',
    label: 'Voucher + 100 BitePoints',
    desc: 'Discount voucher for your next artisan order',
    icon: '🎁',
  },
  {
    id: 'Support Callback / Explanation',
    label: 'Support Callback',
    desc: 'Senior support specialist will phone you in 10 mins',
    icon: '📞',
  },
];

export function OrderIssueReportModal({ isOpen, onClose, initialOrder = null, onSubmitted }) {
  if (!isOpen) return null;

  return (
    <OrderIssueReportDialog
      onClose={onClose}
      initialOrder={initialOrder}
      onSubmitted={onSubmitted}
    />
  );
}

function OrderIssueReportDialog({ onClose, initialOrder, onSubmitted }) {
  const { orders } = useOrders();
  const { user } = useAuth();

  const [selectedOrderId, setSelectedOrderId] = useState(
    initialOrder?._id || initialOrder?.id || (orders.length > 0 ? (orders[0]._id || orders[0].id) : '')
  );
  const [selectedIssue, setSelectedIssue] = useState('Missing Item');
  const [selectedResolution, setSelectedResolution] = useState('Instant Wallet Refund');
  const [description, setDescription] = useState('');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const activeOrder = orders.find((o) => (o._id || o.id) === selectedOrderId) || initialOrder || orders[0];
  const orderNumber = activeOrder?.orderNumber || (activeOrder ? (activeOrder._id || activeOrder.id || '').toString().slice(-6).toUpperCase() : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        orderId: activeOrder?._id || activeOrder?.id || '',
        orderNumber: orderNumber || 'BC-ORDER',
        category: 'Order Issue',
        issueType: selectedIssue,
        subject: `${selectedIssue} reported on #${orderNumber || 'Order'}`,
        description: description.trim(),
        requestedResolution: selectedResolution,
        customerName: user?.username || 'BiteCraft Foodie',
        customerPhone: customerPhone.trim(),
        customerEmail: user?.email || '',
        priority: 'HIGH',
      };

      const ticket = await onSubmitted(payload);
      setSubmittedTicket(ticket);
    } catch (err) {
      console.error('Failed to submit order issue ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-500/10 via-orange-500/5 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-500 to-orange-500 text-white flex items-center justify-center text-xl shadow-md shadow-orange-500/25">
              🚨
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Report an Order Issue
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Fast-track resolution reviewed by kitchen & dispatch team
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        {submittedTicket ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 animate-bounce">
              ✓
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Ticket #{submittedTicket.ticketNumber || 'BC-TKT'} Received!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Our customer care manager is reviewing your report. Average resolution time is <strong className="text-orange-600 dark:text-orange-400 font-bold">5 to 10 minutes</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left text-xs space-y-1.5 max-w-xs mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Order:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">#{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Issue:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedIssue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Resolution:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedResolution}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              Done & View Ticket
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {/* 1. Select Order */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                1. Select Affected Order
              </label>
              {orders.length > 0 ? (
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-orange-500"
                >
                  {orders.map((ord) => {
                    const id = ord._id || ord.id;
                    const num = ord.orderNumber || (id ? id.toString().slice(-6).toUpperCase() : 'ORDER');
                    const total = ord.totalAmount ? `$${Number(ord.totalAmount).toFixed(2)}` : '';
                    return (
                      <option key={id} value={id}>
                        Order #{num} • {total} • {ord.status || 'Active'}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                  Order #{orderNumber || 'Recent Order'}
                </div>
              )}
            </div>

            {/* 2. Select Issue Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                2. What went wrong?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_TYPES.map((issue) => {
                  const active = selectedIssue === issue.id;
                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => setSelectedIssue(issue.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                        active
                          ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-bold shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs'
                      }`}
                    >
                      <span className="text-base">{issue.icon}</span>
                      <span className="text-xs truncate">{issue.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Desired Resolution */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                3. Preferred Resolution
              </label>
              <div className="space-y-1.5">
                {RESOLUTIONS.map((res) => {
                  const active = selectedResolution === res.id;
                  return (
                    <div
                      key={res.id}
                      onClick={() => setSelectedResolution(res.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        active
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-base">{res.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {res.label}
                          </div>
                          <div className="text-[10px] text-slate-400">{res.desc}</div>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                          active
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {active && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                4. Problem Details
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Please describe which item was missing or what was wrong with the meal/packaging..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 resize-none"
              />
            </div>

            {/* Optional Phone */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Contact Phone for Dispatch Team (Optional)
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+855 12 345 678"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !description.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 active:scale-95 transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <span>🚨</span>
                <span>{submitting ? 'Submitting Report...' : 'Submit Issue Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

OrderIssueReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialOrder: PropTypes.object,
  onSubmitted: PropTypes.func.isRequired,
};

OrderIssueReportDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  initialOrder: PropTypes.object,
  onSubmitted: PropTypes.func.isRequired,
};
