import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../use_cart';
import { useAuth } from '../../auth/use_auth';
import { container } from '../../../core/di/container';
import { formatUsd, formatKhr } from '../../../core';
import { AppRoutes } from '../../../routes/app_routes';

const DISTRICTS = [
  'BKK 1',
  'Daun Penh',
  'Chamkarmon',
  'Toul Kork',
  'Tuol Tom Poung',
  '7 Makara',
  'Chroy Changvar',
];

export function CheckoutModal() {
  const {
    items,
    subtotal,
    deliveryFee,
    discountAmount,
    totalAmount,
    voucherCode,
    isCheckoutOpen,
    closeCheckout,
    clearCart,
  } = useCart();

  const { user, ensureCustomerSession } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.username || 'Guest Foodie');
  const [customerPhone, setCustomerPhone] = useState('012 888 999');
  const [selectedDistrict, setSelectedDistrict] = useState('BKK 1');
  const [streetAddress, setStreetAddress] = useState('Street 302, Sangkat Boeng Keng Kang 1');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'khqr'

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!isCheckoutOpen) return null;

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setStreetAddress(`Street 271, Sangkat ${district}, Phnom Penh`);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !streetAddress.trim()) {
      setErrorMsg('Please complete all delivery contact fields.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Ensure user has an authenticated session
      await ensureCustomerSession();

      // 2. Format order payload matching backend orderService expectations
      const fullDeliveryAddress = `${streetAddress}, ${selectedDistrict}, Phnom Penh${
        deliveryNote ? ` (${deliveryNote})` : ''
      }`;

      const orderPayload = {
        items: items.map((i) => ({
          food: i.food.id,
          quantity: i.quantity,
          notes: i.notes || '',
        })),
        deliveryAddress: fullDeliveryAddress,
        paymentMethod: paymentMethod === 'khqr' ? 'bakong_khqr' : 'cash',
        voucherCode: voucherCode || undefined,
      };

      const orderRepo = container.getOrderRepository();
      const created = await orderRepo.createOrder(orderPayload);

      setPlacedOrder(created);
      clearCart();
    } catch (err) {
      console.error('Order creation error:', err);
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackOrder = () => {
    closeCheckout();
    navigate(AppRoutes.ORDERS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {placedOrder ? (
          /* Order Success State */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/20 animate-bounce">
              🎉
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                Order Received!
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
                Thank you, {customerName}!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Your order is confirmed and sent directly to the kitchen.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Order ID:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {placedOrder.orderNumber || `#${placedOrder.id?.slice(-6).toUpperCase()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Estimated Delivery:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  ⚡ 25 - 35 mins
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Payment:</span>
                <span className="font-semibold text-slate-900 dark:text-white uppercase">
                  {paymentMethod === 'khqr' ? 'Bakong KHQR' : 'Cash on Delivery'}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300">Total Paid:</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {formatUsd(totalAmount || placedOrder.totalAmount)} ({formatKhr(totalAmount || placedOrder.totalAmount)})
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleTrackOrder}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
              >
                🛵 Track Order Live
              </button>
              <button
                onClick={closeCheckout}
                className="py-3.5 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handlePlaceOrder}>
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Checkout & Delivery
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Confirm your delivery address in Phnom Penh
                </p>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="012 345 678"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Delivery Location (Phnom Penh)
                </h3>

                {/* Quick District Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    District / Khan
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DISTRICTS.map((district) => (
                      <button
                        key={district}
                        type="button"
                        onClick={() => handleDistrictSelect(district)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selectedDistrict === district
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {district}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Street & House / Condo Number
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="House #12, St 302, Sangkat BKK1"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Notes for Rider (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="e.g. Leave at gate, call when arriving"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  3. Payment Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center space-x-3 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="sr-only"
                    />
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xl">
                      💵
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Cash on Delivery
                      </p>
                      <p className="text-[10px] text-slate-500">Pay cash when rider arrives</p>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center space-x-3 transition-all ${
                      paymentMethod === 'khqr'
                        ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="khqr"
                      checked={paymentMethod === 'khqr'}
                      onChange={() => setPaymentMethod('khqr')}
                      className="sr-only"
                    />
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center text-xl">
                      📱
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Bakong KHQR
                        </p>
                        <span className="text-[9px] px-1.5 py-0.2 bg-red-500 text-white font-extrabold rounded-md">
                          KHQR
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">Scan with any Cambodian bank app</p>
                    </div>
                  </label>
                </div>

                {/* KHQR Preview if selected */}
                {paymentMethod === 'khqr' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/5 to-red-600/10 border border-red-200 dark:border-red-900/60 text-center space-y-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                      Scan to Pay with Bakong
                    </span>
                    <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl shadow-md border border-slate-200 flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://bakong.nbc.org.kh/pay?amount=${totalAmount}`}
                        alt="Bakong KHQR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Amount: {formatUsd(totalAmount)} / {formatKhr(totalAmount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Order Summary ({items.length} items)
                </span>
                <div className="space-y-1">
                  {items.map((i) => (
                    <div key={i.food.id} className="flex justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300">
                        {i.quantity}x {i.food.name}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatUsd(i.food.price * i.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatUsd(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'FREE' : formatUsd(deliveryFee)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount</span>
                      <span>-{formatUsd(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-baseline">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Total Amount</span>
                    <div className="text-right">
                      <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                        {formatUsd(totalAmount)}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        ({formatKhr(totalAmount)})
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center space-x-3">
              <button
                type="button"
                onClick={closeCheckout}
                className="py-3 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <span>Placing Order...</span>
                ) : (
                  <>
                    <span>Place Order</span>
                    <span>•</span>
                    <span>{formatUsd(totalAmount)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
