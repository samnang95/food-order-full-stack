import { useState } from 'react';
import { useCart } from '../use_cart';
import { formatUsd, formatKhr } from '../../../core';

export function CartDrawer() {
  const {
    items,
    totalCount,
    subtotal,
    deliveryFee,
    discountAmount,
    totalAmount,
    voucherCode,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    openCheckout,
    applyVoucher,
    removeVoucher,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [voucherMsg, setVoucherMsg] = useState(null);

  if (!isCartOpen) return null;

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyVoucher(inputCode);
    setVoucherMsg(res);
  };

  const freeDeliveryThreshold = 25.0;
  const progressToFreeDelivery = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🛍️</span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Your Order
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                {totalCount} items
              </span>
            </div>
            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors text-xs"
              aria-label="Close cart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Free Delivery Bar */}
          {items.length > 0 && (
            <div className="px-4 sm:px-5 py-2 sm:py-2.5 bg-orange-50/60 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-950/40">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>
                  {remainingForFreeDelivery === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      🎉 Free Delivery unlocked!
                    </span>
                  ) : (
                    <>
                      Add <span className="text-orange-600 font-bold">{formatUsd(remainingForFreeDelivery)}</span> more for Free Delivery
                    </>
                  )}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {Math.round(progressToFreeDelivery)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-300"
                  style={{ width: `${progressToFreeDelivery}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-orange-100/60 dark:bg-orange-950/30 flex items-center justify-center text-4xl">
                  🥣
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Your cart is feeling hungry
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Explore our chef-crafted burgers, artisan noodles, and fresh bowls to get started!
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.food.id}
                  className="flex items-center space-x-2.5 sm:space-x-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
                >
                  {/* Food Thumbnail */}
                  <img
                    src={item.food.imageUrl}
                    alt={item.food.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
                    }}
                  />

                  {/* Food Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.food.name}
                    </h4>
                    <div className="flex items-baseline space-x-1.5 mt-0.5">
                      <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                        {formatUsd(item.food.price)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({formatKhr(item.food.price)})
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-[10px] text-slate-500 italic truncate mt-0.5">
                        &quot;{item.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center space-x-1 sm:space-x-1.5 bg-white dark:bg-slate-700/80 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-600 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.food.id, item.quantity - 1)}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 hover:text-orange-600 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center text-xs transition-colors"
                      title="Decrease"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.food.id, item.quantity + 1)}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 hover:text-orange-600 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center text-xs transition-colors"
                      title="Increase"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.food.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 space-y-3 sm:space-y-4">

              {/* Voucher Input */}
              <div>
                {voucherCode ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold">
                      <span>🏷️</span>
                      <span>{voucherCode} applied</span>
                    </div>
                    <button
                      onClick={removeVoucher}
                      className="text-xs text-rose-500 font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyVoucher} className="space-y-1.5">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Voucher code (e.g. WELCOME20)"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase focus:outline-hidden focus:border-orange-500"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {voucherMsg && (
                      <p
                        className={`text-[11px] font-medium ${
                          voucherMsg.success
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-500'
                        }`}
                      >
                        {voucherMsg.message}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatUsd(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">FREE</span>
                    ) : (
                      formatUsd(deliveryFee)
                    )}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span>-{formatUsd(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">Total</span>
                    <span className="block text-[11px] text-slate-400 font-medium">
                      {formatKhr(totalAmount)}
                    </span>
                  </div>
                  <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                    {formatUsd(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={openCheckout}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
