import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../cart/use_cart';
import { useAuth } from '../auth/use_auth';
import { container } from '../../core/di/container';
import { useTranslation } from '../../core';
import { AppRoutes } from '../../routes/app_routes';
import {
  DeliveryLocationPicker,
  CourierTipSelector,
  VoucherSelector,
  PaymentSelector,
  OrderSummaryCard,
  OrderSuccessModal,
  KhqrPaymentModal,
} from './components';

export function CheckoutView() {
  const { t } = useTranslation();
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
    removeVoucher,
    clearCart,
  } = useCart();

  const { user, ensureCustomerSession } = useAuth();

  const [customerName, setCustomerName] = useState(user?.username || 'Guest Foodie');
  const [customerPhone, setCustomerPhone] = useState('012 888 999');
  const [selectedDistrict, setSelectedDistrict] = useState('BKK 1');
  const [streetAddress, setStreetAddress] = useState('Building 45, Street 302, Sangkat Boeng Keng Kang 1');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [coordinates, setCoordinates] = useState([11.551, 104.925]);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'khqr'

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showKhqrModal, setShowKhqrModal] = useState(false);

  const validateForm = () => {
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Your cart is empty. Please select food items from the menu.');
      return false;
    }

    if (!customerName.trim() || !customerPhone.trim() || !streetAddress.trim()) {
      setErrorMsg('Please complete all contact and delivery address fields.');
      return false;
    }

    return true;
  };

  const buildOrderPayload = (extraPaymentInfo = {}) => {
    const fullDeliveryAddress = `${streetAddress}, ${selectedDistrict}, Phnom Penh${
      deliveryNote ? ` (${deliveryNote})` : ''
    }`;

    return {
      items: items.map((i) => ({
        food: i.food.id,
        quantity: i.quantity,
        notes: i.notes || '',
      })),
      deliveryAddress: fullDeliveryAddress,
      deliveryLocation: {
        lat: coordinates ? coordinates[0] : 11.551,
        lng: coordinates ? coordinates[1] : 104.925,
      },
      paymentMethod: paymentMethod === 'khqr' ? 'bakong_khqr' : 'cash',
      paymentStatus:
        extraPaymentInfo.paymentStatus || (paymentMethod === 'khqr' ? 'completed' : 'pending'),
      paymentRef: extraPaymentInfo.transactionId || undefined,
      voucherCode: voucherCode || undefined,
      tipAmount: tipAmount || 0,
    };
  };

  const executeOrderCreation = async (orderPayload) => {
    setSubmitting(true);
    try {
      await ensureCustomerSession();
      const created = await container.createOrderUseCase.execute(orderPayload);
      setPlacedOrder(created);
      clearCart();
      setShowKhqrModal(false);
    } catch (err) {
      console.error('Order creation error:', err);
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    if (paymentMethod === 'khqr') {
      setShowKhqrModal(true);
      return;
    }

    // Cash on Delivery
    await executeOrderCreation(buildOrderPayload());
  };

  const handleKhqrSuccess = async (paymentDetails) => {
    const payload = buildOrderPayload({
      paymentStatus: 'completed',
      transactionId: paymentDetails.transactionId,
    });
    await executeOrderCreation(payload);
  };

  // If cart is empty and no order just placed, show empty state
  if (items.length === 0 && !placedOrder) {
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
                  onChange={(e) => setCustomerName(e.target.value)}
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
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="012 345 678"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Interactive Delivery Location & Leaflet Map Pin */}
          <DeliveryLocationPicker
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            streetAddress={streetAddress}
            setStreetAddress={setStreetAddress}
            deliveryNote={deliveryNote}
            setDeliveryNote={setDeliveryNote}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
          />

          {/* Payment Method Selector */}
          <PaymentSelector
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            totalAmount={totalAmount}
            onOpenKhqrModal={() => {
              if (validateForm()) setShowKhqrModal(true);
            }}
          />

          {/* Courier Tip Card */}
          <CourierTipSelector
            tipAmount={tipAmount}
            onTipChange={setTipAmount}
          />
        </div>

        {/* Right Column: Vouchers & Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
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
            items={items}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            discountAmount={discountAmount}
            tipAmount={tipAmount}
            totalAmount={totalAmount}
            appliedVoucher={appliedVoucher}
            paymentMethod={paymentMethod}
            submitting={submitting}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>

      {/* Interactive Bakong KHQR Payment Modal */}
      <KhqrPaymentModal
        isOpen={showKhqrModal}
        onClose={() => setShowKhqrModal(false)}
        totalAmount={totalAmount}
        onPaymentSuccess={handleKhqrSuccess}
        onCancelPayCash={() => {
          setShowKhqrModal(false);
          setPaymentMethod('cash');
        }}
      />

      {/* Order Success Celebration Modal */}
      {placedOrder && (
        <OrderSuccessModal
          order={placedOrder}
          onClose={() => setPlacedOrder(null)}
        />
      )}
    </div>
  );
}
