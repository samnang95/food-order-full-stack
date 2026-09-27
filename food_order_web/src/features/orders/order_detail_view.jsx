import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { container } from '../../core/di/container';
import { socketService } from '../../core/services/socket_service';
import { formatUsd, formatKhr, useTranslation, AppAssets } from '../../core';
import { AppRoutes } from '../../routes/app_routes';
import { DeliveryMapCard } from './components';
import { OrderRatingModal, useReviews } from '../reviews';
import { InvoiceModal, useInvoiceStore } from '../invoices';
import {
  DriverChatButton,
  DriverChatDrawer,
  DeliveryInstructionsCard,
  useDriverChatStore,
} from '../chat';
import { QuickReorderButton } from '../schedule';

const STATUS_STEPS = [
  { key: 'pending', labelKey: 'orders.statusPending', icon: '📝' },
  { key: 'preparing', labelKey: 'orders.statusPreparing', icon: '🍳' },
  { key: 'out_for_delivery', labelKey: 'orders.statusOnTheWay', icon: '🛵' },
  { key: 'delivered', labelKey: 'orders.statusDelivered', icon: '🎉' },
];

export function OrderDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverLoc, setDriverLoc] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const { getReviewForOrder } = useReviews();
  const existingReview = id ? getReviewForOrder(id) : null;

  const {
    invoice,
    isOpen: isInvoiceOpen,
    openInvoice,
    closeInvoice,
    triggerPrint,
    copyInvoiceNumber,
    copiedRef,
  } = useInvoiceStore();

  const {
    driver: chatDriver,
    messages: chatMessages,
    isOpen: isChatOpen,
    unreadCount: chatUnreadCount,
    isDriverTyping,
    driverTypingName,
    deliveryInstruction,
    openChat,
    closeChat,
    sendMessage: sendChatMessage,
    sendPreset: sendChatPreset,
    saveDeliveryInstruction,
  } = useDriverChatStore(order);

  // Fetch Order Details via Clean Architecture Use Case
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadOrder() {
      try {
        setLoading(true);
        const orderData = await container.getOrderByIdUseCase.execute(id);
        if (isMounted) {
          setOrder(orderData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading order detail:', err);
          setError(err.message || 'Unable to retrieve order details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Real-time socket room subscription
  useEffect(() => {
    if (!id) return;

    socketService.joinOrderRoom(id);

    const unsubStatus = socketService.onOrderStatusChanged(({ orderId, status }) => {
      if (orderId === id) {
        setOrder((prev) => (prev ? { ...prev, status: status.toLowerCase() } : prev));
      }
    });

    const unsubDriver = socketService.onDriverLocation((loc) => {
      setDriverLoc(loc);
    });

    return () => {
      socketService.leaveOrderRoom(id);
      unsubStatus?.();
      unsubDriver?.();
    };
  }, [id]);

  // Copy direct receipt link to clipboard
  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger formal tax invoice preview and print
  const handlePrint = () => {
    if (order) openInvoice(order);
  };

  // Handle Order Cancellation
  const handleCancelOrder = async () => {
    if (!order || order.status !== 'pending') return;
    const confirmed = window.confirm(
      t('orders.cancelConfirm') || 'Are you sure you want to cancel this order?'
    );
    if (!confirmed) return;

    try {
      const orderRepo = container.getOrderRepository();
      await orderRepo.cancelOrder(order.id || id, 'Customer cancelled via receipt view');
      setOrder((prev) => (prev ? { ...prev, status: 'cancelled' } : prev));
    } catch (err) {
      alert(err.message || 'Could not cancel order.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          {t('common.loading') || 'Loading order details & invoice...'}
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-4xl">🧾</span>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          {t('orders.orderNotFound') || 'Order Receipt Not Found'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {error || 'We could not locate this order ID in your history or the network.'}
        </p>
        <Link
          to={AppRoutes.ORDERS}
          className="inline-block px-5 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
        >
          ← {t('orders.backToOrders') || 'Back to My Orders'}
        </Link>
      </div>
    );
  }

  const orderNumber = order.orderNumber || `#${(order.id || id).slice(-6).toUpperCase()}`;
  const status = (order.status || 'pending').toLowerCase();
  const isDelivered = status === 'delivered';
  const isCancelled = status === 'cancelled';
  const isPending = status === 'pending';
  const isLive = !isDelivered && !isCancelled;

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  const activeStepIdx = currentStepIdx >= 0 ? currentStepIdx : isDelivered ? 3 : 0;

  // Calculate fees breakdown
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsSubtotal = items.reduce(
    (acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );
  const deliveryFee = order.deliveryFee !== undefined ? Number(order.deliveryFee) : 1.5;
  const discountAmount = Number(order.discount || 0);
  const tipAmount = Number(order.tip || 0);
  const totalAmount = Number(order.totalAmount || itemsSubtotal + deliveryFee - discountAmount + tipAmount);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(AppRoutes.ORDERS)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center space-x-1"
          >
            <span>←</span>
            <span>{t('orders.backToOrders') || 'Orders'}</span>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {orderNumber}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isDelivered
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : isCancelled
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 animate-pulse'
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent Order'}
            </p>
          </div>
        </div>

        {/* Actions: Print, Copy Link, Quick Reorder */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center space-x-1.5"
            title="Copy Receipt Link"
          >
            <span>🔗</span>
            <span>{copied ? 'Copied!' : t('orders.copyLink') || 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity flex items-center space-x-1.5 shadow-xs"
          >
            <span>📄</span>
            <span>{t('invoices.viewInvoice') || 'Tax Invoice'}</span>
          </button>

          <QuickReorderButton order={order} size="sm" />

          {isDelivered && (
            <button
              type="button"
              onClick={() => setShowRatingModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center space-x-1.5"
            >
              <span>⭐</span>
              <span>{existingReview ? 'Update Review' : t('reviews.rateOrder')}</span>
            </button>
          )}

          {isPending && (
            <button
              type="button"
              onClick={handleCancelOrder}
              className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors"
            >
              {t('orders.cancelOrder') || 'Cancel'}
            </button>
          )}
        </div>
      </div>

      {/* Delivery Schedule Timing Banner */}
      {order.deliverySchedule && (
        <div className="no-print p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
              {order.deliverySchedule.mode === 'scheduled' ? '📅' : '⚡'}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {t('schedule.deliveryTiming', 'Delivery Timing')}
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {order.deliverySchedule.mode === 'scheduled'
                  ? `${order.deliverySchedule.date} (${order.deliverySchedule.timeSlot})`
                  : t('schedule.asapLabel', '⚡ Deliver ASAP (25 - 35 mins)')}
              </h3>
              {order.deliverySchedule.note && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">
                  "{order.deliverySchedule.note}"
                </p>
              )}
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            {order.deliverySchedule.mode === 'scheduled'
              ? t('schedule.scheduledSlot', 'Scheduled')
              : t('schedule.expressAsap', 'Express ASAP')}
          </span>
        </div>
      )}

      {/* Main Printable Receipt / Invoice Card */}
      <div className="printable-receipt bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Invoice Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-orange-500/20 shrink-0">
                <img
                  src={AppAssets.images.appIcon}
                  alt="BiteCraft"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  BiteCraft Phnom Penh
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('orders.officialInvoice') || 'Official Tax Receipt & Order Summary'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Boeng Keng Kang 1 (BKK1), Daun Penh, Phnom Penh • +855 23 999 888
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-block px-3 py-1 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-mono text-xs font-black">
                {orderNumber}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Issued: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
              </p>
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Currency: USD ($) & KHR (៛)
              </p>
            </div>
          </div>
        </div>

        {/* Customer Review Section when delivered */}
        {isDelivered && (
          <div className="no-print p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-transparent">
            {existingReview ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">⭐</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        Your Order Review
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        Submitted on {existingReview.formattedDate}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRatingModal(true)}
                    className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    Edit Review
                  </button>
                </div>

                <div className="flex items-center space-x-3 text-xs font-bold">
                  <span className="text-amber-500">
                    ★ {existingReview.overallRating}/5 Overall
                  </span>
                  {existingReview.foodRating && (
                    <span className="text-slate-500">
                      🍲 Food: {existingReview.foodRating}/5
                    </span>
                  )}
                  {existingReview.deliveryRating && (
                    <span className="text-slate-500">
                      🛵 Rider: {existingReview.deliveryRating}/5
                    </span>
                  )}
                </div>

                {existingReview.comment && (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">
                    "{existingReview.comment}"
                  </p>
                )}

                {existingReview.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {existingReview.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shadow-xs">
                    ⭐
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {t('reviews.howWasYourMeal')}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t('reviews.rateMealPrompt')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRatingModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5 self-start sm:self-auto shrink-0"
                >
                  <span>⭐</span>
                  <span>{t('reviews.rateOrder')}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live Delivery Progress Stepper (Visible if order is not cancelled) */}
        {!isCancelled && (
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('orders.orderStatus') || 'Order Status'}
              </span>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                {isDelivered
                  ? `✓ ${t('orders.statusDelivered') || 'Delivered'}`
                  : `⚡ ${t('orders.estimatedArrival') || 'ETA'}: 25 - 35 mins`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = activeStepIdx > idx;
                const isCurrent = activeStepIdx === idx;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-2xl border transition-all text-center ${
                      isCurrent
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                        : isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="text-lg block mb-1">{step.icon}</span>
                    <p className="text-xs font-black truncate">{t(step.labelKey)}</p>
                    <span className="text-[9px] opacity-80 block mt-0.5">
                      {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Interactive Map Card (Collapsible, hidden during print) */}
        {isLive && (
          <div className="no-print p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-base">🛵</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Live Courier Tracking
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>

            {showMap && <DeliveryMapCard order={order} driverLoc={driverLoc} />}

            {/* Live Courier & Quick Chat Bar */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={chatDriver?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
                    alt={chatDriver?.name || 'Driver'}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-orange-500 shadow-sm"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {chatDriver?.name || 'Sok Dara'}
                    </h4>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded-md">
                      ★ {chatDriver?.rating || '4.95'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    🛵 {chatDriver?.vehicle || 'Honda Scoopy • Phnom Penh 1AB-2345'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <a
                  href={`tel:${chatDriver?.phone || '+85512889900'}`}
                  className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center space-x-1"
                >
                  <span>📞</span>
                  <span>{t('chat.callRider') || 'Call'}</span>
                </a>
                <DriverChatButton
                  variant="inline"
                  driver={chatDriver}
                  unreadCount={chatUnreadCount}
                  onClick={openChat}
                />
              </div>
            </div>

            {/* Delivery Instructions & Drop-off Notes */}
            <div className="mt-4">
              <DeliveryInstructionsCard
                currentInstruction={deliveryInstruction}
                onSaveInstruction={saveDeliveryInstruction}
                onSendPresetToChat={sendChatPreset}
              />
            </div>
          </div>
        )}

        {/* Customer & Delivery Metadata Details */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Customer Details
            </h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {order.customerName || 'BiteCraft Customer'}
            </p>
            {order.customerPhone && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                📞 {order.customerPhone}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Delivery Destination
            </h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
              📍 {order.deliveryAddress || 'Phnom Penh, Cambodia'}
            </p>
            {order.notes && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-1">
                Note: {order.notes}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Payment & Security
            </h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase flex items-center space-x-1.5">
              <span>💳 {order.paymentMethod === 'KHQR' ? 'Bakong KHQR' : order.paymentMethod}</span>
            </p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                order.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              Payment Status: {order.paymentStatus || 'Pending'}
            </span>
          </div>
        </div>

        {/* Itemized Food Dishes Table */}
        <div className="p-6 sm:p-8 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Itemized Order Breakdown ({items.length} dishes)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                  <th className="pb-3">Dish / Item</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item, idx) => {
                  const unitPrice = Number(item.price) || 0;
                  const qty = Number(item.quantity) || 1;
                  const lineTotal = unitPrice * qty;

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center space-x-3">
                          {item.foodImageUrl && (
                            <img
                              src={item.foodImageUrl}
                              alt={item.foodName}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 print:hidden"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                              {item.foodName}
                            </p>
                            {item.notes && (
                              <p className="text-[10px] text-slate-400 italic mt-0.5">
                                Instructions: {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                        {qty}
                      </td>
                      <td className="py-3.5 text-right font-medium text-slate-600 dark:text-slate-400">
                        {formatUsd(unitPrice)}
                        <span className="block text-[10px] text-slate-400">
                          {formatKhr(unitPrice)}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                        {formatUsd(lineTotal)}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {formatKhr(lineTotal)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals & KHQR Verification Card */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: KHQR Payment Verification Note */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  Bakong KHQR
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  National Digital Payment
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Transactions authenticated securely via the National Bank of Cambodia Bakong network. Zero hidden service fees.
              </p>
              <div className="pt-2 flex items-center space-x-3 text-[10px] font-mono text-slate-400 border-t border-slate-200 dark:border-slate-700">
                <span>Ref: #{order.id?.slice(0, 12)}</span>
                <span>•</span>
                <span>Tax ID: KHM-8849204</span>
              </div>
            </div>

            {/* Right: Subtotal, Fees, Total */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatUsd(itemsSubtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Standard Delivery Fee</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {deliveryFee === 0 ? 'FREE' : formatUsd(deliveryFee)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Voucher Discount</span>
                  <span>-{formatUsd(discountAmount)}</span>
                </div>
              )}

              {tipAmount > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Driver Tip</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    +{formatUsd(tipAmount)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block">
                    Final Total
                  </span>
                  <span className="text-[10px] text-slate-400">All Taxes & Fees Included</span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 block">
                    {formatUsd(totalAmount)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {formatKhr(totalAmount)}
                  </span>
                </div>
              </div>

              {/* View Official Tax Invoice CTA */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <button
                  type="button"
                  onClick={() => openInvoice(order)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-2xs"
                >
                  <span>📄</span>
                  <span>{t('invoices.viewInvoice') || 'View Official Tax Invoice'}</span>
                  <span>→</span>
                </button>

                {/* Instant 1-Click Quick Reorder Full-Width CTA */}
                <QuickReorderButton order={order} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Formal Receipt Footer Note */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center space-y-1">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            🙏 {t('orders.thankYou') || 'Thank you for ordering with BiteCraft Phnom Penh!'}
          </p>
          <p className="text-[10px] text-slate-400">
            Handcrafted artisan smash burgers, Asian bowls & wood-fired pizza delivered fresh. Keep this receipt for your records.
          </p>
        </div>
      </div>

      {/* Order Rating Modal */}
      <OrderRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        order={order}
      />

      {/* Official Tax Invoice & Receipt Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        invoice={invoice}
        onClose={closeInvoice}
        onPrint={triggerPrint}
        onCopyInvoiceNumber={copyInvoiceNumber}
        isCopied={copiedRef}
      />

      {/* Floating Driver Chat Trigger (if order is active and not delivered) */}
      {!isCancelled && (
        <DriverChatButton
          variant="floating"
          driver={chatDriver}
          unreadCount={chatUnreadCount}
          onClick={openChat}
        />
      )}

      {/* Live Driver Chat Slide-over Drawer */}
      <DriverChatDrawer
        isOpen={isChatOpen}
        onClose={closeChat}
        driver={chatDriver}
        messages={chatMessages}
        isDriverTyping={isDriverTyping}
        driverTypingName={driverTypingName}
        deliveryInstruction={deliveryInstruction}
        onSendMessage={sendChatMessage}
        onSendPreset={sendChatPreset}
      />
    </div>
  );
}
