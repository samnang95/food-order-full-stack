import { Link } from 'react-router-dom';
import { useCart } from '../cart/use_cart';
import { useAuth } from '../auth/use_auth';
import { useTranslation } from '../../core';
import { AppRoutes } from '../../routes/app_routes';
import {
  DeliveryLocationPicker,
  VoucherSelector,
  PaymentSelector,
  OrderSummaryCard,
  OrderSuccessModal,
  KhqrPaymentModal,
} from './components';
import { CheckoutRewardsSelector } from '../rewards';
import { DeliveryScheduleSelector, useSchedule } from '../schedule';
import { DriverTipCard } from '../driver_tip';
import { useCheckoutStore } from './checkout_store';
import { CheckoutIntent } from './checkout_intent';
import { useGroupOrder } from '../group_order';

export function CheckoutView() {
  const { t } = useTranslation();
  const { currentSchedule } = useSchedule();
  const {
    items,
    subtotal,
    deliveryFee,
    discountAmount,
    tipAmount,
    setTipAmount,
    totalAmount,
    voucherCode,
    appliedVoucher,
    availableVouchers,
    applyVoucher,
    applyCustomVoucher,
    removeVoucher,
    clearCart,
  } = useCart();

  const {
    isGroupOrderActive,
    groupOrder,
    isHost,
    openSplitBillModal,
  } = useGroupOrder();

  const isGroupCheckout = Boolean(isGroupOrderActive && isHost && groupOrder?.items?.length > 0);

  const groupCartItems = (groupOrder?.items || []).map((it) => ({
    food: {
      id: it.foodId,
      name: it.foodName,
      price: it.price,
      imageUrl: it.foodImageUrl,
    },
    quantity: it.quantity,
    notes: it.notes,
    addedBy: {
      id: it.memberId,
      name: it.memberName,
      color: it.memberColor,
    },
  }));

  const effectiveItems = isGroupCheckout ? groupCartItems : items;
  const effectiveSubtotal = isGroupCheckout ? (groupOrder?.totalSubtotal || 0) : subtotal;
  const effectiveTotalAmount = isGroupCheckout
    ? Math.max(0, effectiveSubtotal + deliveryFee + tipAmount - discountAmount)
    : totalAmount;

  const { user, ensureCustomerSession } = useAuth();

  const { state, onIntent, validateForm, buildOrderPayload, executeOrderCreation } =
    useCheckoutStore(user, {
      items: effectiveItems,
      voucherCode,
      tipAmount,
      isGroupOrder: isGroupCheckout,
      groupOrder: isGroupCheckout ? groupOrder : null,
    });

  const {
    customerName,
    customerPhone,
    selectedDistrict,
    streetAddress,
    deliveryNote,
    coordinates,
    paymentMethod,
    submitting,
    errorMsg,
    placedOrder,
    showKhqrModal,
  } = state;

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    if (paymentMethod === 'khqr') {
      onIntent(CheckoutIntent.setShowKhqrModal(true));
      return;
    }

    // Cash on Delivery
    await executeOrderCreation(
      buildOrderPayload({ deliverySchedule: currentSchedule }),
      ensureCustomerSession,
      clearCart
    );
  };

  const handleKhqrSuccess = async (paymentDetails) => {
    const payload = buildOrderPayload({
      paymentStatus: 'completed',
      transactionId: paymentDetails.transactionId,
      deliverySchedule: currentSchedule,
    });
    await executeOrderCreation(payload, ensureCustomerSession, clearCart);
  };

  // If cart is empty and no order just placed, show empty state
  if (effectiveItems.length === 0 && !placedOrder) {

    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center text-4xl mx-auto shadow-inner animate-pulse">
          🛍️
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            You need to add some delicious dishes to your cart before proceeding to checkout.
          </p>
        </div>
        <Link
          to={AppRoutes.MENU}
          className="inline-block px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all"
        >
          {t('home.viewMenu')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-5 sm:p-7 border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl sm:text-3xl">🛵</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('checkout.checkoutTitle')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              ⚡ 25-35 {t('common.mins')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Confirm your delivery pin on Phnom Penh map, apply discounts, and complete your order.
          </p>
        </div>

        <Link
          to={AppRoutes.MENU}
          className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center space-x-1.5 self-start sm:self-auto transition-colors"
        >
          <span>←</span>
          <span>{t('menu.allDishes') || 'Back to Menu'}</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-200">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2-Column Responsive Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Form & Maps (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('auth.username')} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => onIntent(CheckoutIntent.setCustomerName(e.target.value))}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('checkout.phoneNumber')} *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => onIntent(CheckoutIntent.setCustomerPhone(e.target.value))}
                  placeholder="012 345 678"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Timing & Scheduling */}
          <DeliveryScheduleSelector />

          {/* Interactive Delivery Location & Leaflet Map Pin */}
          <DeliveryLocationPicker
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={(d) => onIntent(CheckoutIntent.setSelectedDistrict(d))}
            streetAddress={streetAddress}
            setStreetAddress={(a) => onIntent(CheckoutIntent.setStreetAddress(a))}
            deliveryNote={deliveryNote}
            setDeliveryNote={(n) => onIntent(CheckoutIntent.setDeliveryNote(n))}
            coordinates={coordinates}
            setCoordinates={(c) => onIntent(CheckoutIntent.setCoordinates(c))}
          />

          {/* Payment Method Selector */}
          <PaymentSelector
            paymentMethod={paymentMethod}
            setPaymentMethod={(m) => onIntent(CheckoutIntent.setPaymentMethod(m))}
            totalAmount={totalAmount}
            onOpenKhqrModal={() => {
              if (validateForm()) onIntent(CheckoutIntent.setShowKhqrModal(true));
            }}
          />

          {/* Driver Tip & Compliments Card */}
          <DriverTipCard
            tipAmount={tipAmount}
            onTipChange={setTipAmount}
            showBakongButton={false}
          />
        </div>

        {/* Right Column: Vouchers & Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* BitePoints VIP Loyalty Rewards Selector */}
          <CheckoutRewardsSelector
            subtotal={subtotal}
            appliedVoucher={appliedVoucher}
            onApplyVoucher={(v) => {
              if (v) {
                applyCustomVoucher(v);
              } else {
                removeVoucher();
              }
            }}
          />

          {/* Promo Codes & Vouchers Card */}
          <VoucherSelector
            voucherCode={voucherCode}
            appliedVoucher={appliedVoucher}
            availableVouchers={availableVouchers}
            onApplyVoucher={applyVoucher}
            onRemoveVoucher={removeVoucher}
          />

          {/* Itemized Bill Breakdown & Place Order CTA */}
          <OrderSummaryCard
            items={effectiveItems}
            subtotal={effectiveSubtotal}
            deliveryFee={deliveryFee}
            discountAmount={discountAmount}
            tipAmount={tipAmount}
            totalAmount={effectiveTotalAmount}
            appliedVoucher={appliedVoucher}
            paymentMethod={paymentMethod}
            submitting={submitting}
            onPlaceOrder={handlePlaceOrder}
            isGroupOrder={isGroupCheckout}
            groupOrderInfo={groupOrder}
            onOpenSplitBill={openSplitBillModal}
          />
        </div>
      </div>

      {/* Interactive Bakong KHQR Payment Modal */}
      <KhqrPaymentModal
        isOpen={showKhqrModal}
        onClose={() => onIntent(CheckoutIntent.setShowKhqrModal(false))}
        totalAmount={effectiveTotalAmount}
        onPaymentSuccess={handleKhqrSuccess}
        onCancelPayCash={() => {
          onIntent(CheckoutIntent.setShowKhqrModal(false));
          onIntent(CheckoutIntent.setPaymentMethod('cash'));
        }}
      />


      {/* Order Success Celebration Modal */}
      {placedOrder && (
        <OrderSuccessModal
          order={placedOrder}
          onClose={() => onIntent(CheckoutIntent.setPlacedOrder(null))}
        />
      )}
    </div>
  );
}
