import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { container } from '../../core/di/container';
import { socketService } from '../../core/services/socket_service';
import { formatUsd, formatKhr, useTranslation } from '../../core';
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

export function OrdersView() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [driverLoc, setDriverLoc] = useState(null);
  const [notification, setNotification] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTargetOrder, setRatingTargetOrder] = useState(null);

  const { getReviewForOrder, hasReviewedOrder } = useReviews();

  const {
    invoice,
    isOpen: isInvoiceOpen,
    openInvoice,
    closeInvoice,
    triggerPrint,
    copyInvoiceNumber,
    copiedRef,
  } = useInvoiceStore();

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

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
  } = useDriverChatStore(selectedOrder);

  const refetchOrders = useCallback(async () => {
    try {
      const orderRepo = container.getOrderRepository();
      let list = [];
      try {
        list = await orderRepo.getMyOrders();
      } catch (err) {
        console.debug('getMyOrders fallback:', err);
        list = await orderRepo.getOrders();
      }
      setOrders(list);
    } catch (err) {
      console.error('Failed to refetch orders:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const orderRepo = container.getOrderRepository();
        let list = [];
        try {
          list = await orderRepo.getMyOrders();
        } catch (err) {
          console.debug('Initial getMyOrders fallback:', err);
          list = await orderRepo.getOrders();
        }
        if (isMounted) {
          setOrders(list);
          if (list.length > 0) {
            setSelectedOrderId((prev) => prev || list[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load customer orders:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Socket listener for live status updates & notifications
  useEffect(() => {
    const unsubStatus = socketService.onOrderStatusChanged(({ orderId, status }) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: status.toLowerCase() } : o))
      );
    });

    const unsubNotif = socketService.onPushNotification((notif) => {
      setNotification(notif);
      setTimeout(() => setNotification(null), 5000);
      refetchOrders();
    });

    const unsubDriver = socketService.onDriverLocation((loc) => {
      setDriverLoc(loc);
    });

    return () => {
      unsubStatus?.();
      unsubNotif?.();
      unsubDriver?.();
    };
  }, [refetchOrders]);


  // Join socket room for currently selected order
  useEffect(() => {
    if (selectedOrderId) {
      socketService.joinOrder(selectedOrderId);
      return () => socketService.leaveOrder(selectedOrderId);
    }
  }, [selectedOrderId]);

  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 0;
    if (s === 'preparing') return 1;
    if (s === 'out_for_delivery') return 2;
    if (s === 'delivered') return 3;
    return -1;
  };

  const handleSimulateNextStep = async () => {
    if (!selectedOrder) return;
    const currentIdx = getStepIndex(selectedOrder.status);
    const orderRepo = container.getOrderRepository();

    let nextStatus = 'preparing';
    if (currentIdx === 0) nextStatus = 'preparing';
    else if (currentIdx === 1) nextStatus = 'out_for_delivery';
    else if (currentIdx === 2) nextStatus = 'delivered';
    else if (currentIdx >= 3) nextStatus = 'pending';

    setSimulating(true);
    try {
      await orderRepo.updateOrderStatus(selectedOrder.id, nextStatus);
      await refetchOrders();
    } catch (err) {
      console.error('Status transition error:', err);
    } finally {
      setSimulating(false);
    }

  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
          {t('common.loading')}
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center text-4xl mx-auto shadow-inner">
          📦
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {t('orders.noOrdersTitle')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('orders.noOrdersSubtitle')}
        </p>
        <Link
          to={AppRoutes.MENU}
          className="inline-block px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all"
        >
          {t('orders.startOrdering')}
        </Link>
      </div>
    );
  }

  const activeStepIdx = selectedOrder ? getStepIndex(selectedOrder.status) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Real-time Notification Banner */}
      {notification && (
        <div className="p-4 rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/30 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider">{notification.title}</p>
              <p className="text-xs opacity-90">{notification.body}</p>
            </div>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-white/80 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('orders.ordersTitle')} 📦
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('orders.ordersSubtitle')}
          </p>
        </div>

        {/* Live Simulation Control */}
        <button
          onClick={handleSimulateNextStep}
          disabled={simulating}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2"
        >
          <span>⚡</span>
          <span>
            {simulating
              ? 'Updating Status...'
              : activeStepIdx === 3
              ? 'Restart Simulation Demo'
              : 'Advance Order Status (Demo)'}
          </span>
        </button>
      </div>

      {/* Mobile Quick Order Switcher */}
      {orders.length > 1 && (
        <div className="lg:hidden space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Switch Order ({orders.length})
          </p>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-3.5 sm:-mx-6 px-3.5 sm:px-6 scroll-smooth scrollbar-none overscroll-x-contain">
            {orders.map((order) => {
              const isSelected = order.id === selectedOrderId;
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>{order.orderNumber || `#${order.id?.slice(-6).toUpperCase()}`}</span>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {order.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: Orders List (Desktop primary, Mobile secondary below live tracker) */}
        <div className="order-2 lg:order-1 lg:col-span-4 space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Order History ({orders.length})
          </h2>

          <div className="space-y-3">
            {orders.map((order) => {
              const isSelected = order.id === selectedOrderId;
              const isDelivered = order.status === 'delivered';
              const isCancelled = order.status === 'cancelled';

              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-500 shadow-md shadow-orange-500/10'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {order.orderNumber || `#${order.id?.slice(-6).toUpperCase()}`}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 animate-pulse'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                    {order.items?.map((i) => `${i.quantity}x ${i.foodName}`).join(', ')}
                  </p>

                  {order.deliverySchedule && (
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-2">
                      <span>{order.deliverySchedule.mode === 'scheduled' ? '📅' : '⚡'}</span>
                      <span className="truncate">
                        {order.deliverySchedule.mode === 'scheduled'
                          ? `${order.deliverySchedule.date} • ${order.deliverySchedule.timeSlot}`
                          : 'Deliver ASAP'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px]">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <QuickReorderButton order={order} size="sm" />
                      {isDelivered && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRatingTargetOrder(order);
                            setShowRatingModal(true);
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 transition-all ${
                            hasReviewedOrder(order.id)
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                              : 'bg-orange-500 text-white shadow-xs hover:bg-orange-600'
                          }`}
                        >
                          <span>⭐</span>
                          <span>{hasReviewedOrder(order.id) ? 'Reviewed' : 'Rate'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInvoice(order);
                        }}
                        className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center space-x-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 px-2 py-0.5 rounded-md hover:scale-102 transition-all cursor-pointer"
                        title={t('invoices.viewInvoice') || 'View Tax Invoice'}
                      >
                        <span>📄</span>
                        <span className="hidden sm:inline">{t('invoices.taxInvoice') || 'Tax Invoice'}</span>
                      </button>
                      <Link
                        to={`/orders/${order.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:underline flex items-center space-x-0.5"
                      >
                        <span>Details →</span>
                      </Link>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatUsd(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Order Detail & Live Timeline (Mobile primary, desktop secondary) */}
        {selectedOrder && (
          <div className="order-1 lg:order-2 lg:col-span-8 space-y-6">
            {/* Live Status Tracker Card */}
            <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-5 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Live Tracking
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {selectedOrder.orderNumber || `#${selectedOrder.id?.slice(-6).toUpperCase()}`}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => openInvoice(selectedOrder)}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    <span>📄</span>
                    <span>{t('invoices.viewInvoice') || 'Tax Invoice'}</span>
                  </button>
                  <Link
                    to={`/orders/${selectedOrder.id}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center space-x-1 shadow-2xs"
                  >
                    <span>Details</span>
                    <span>→</span>
                  </Link>
                  <QuickReorderButton order={selectedOrder} size="sm" />
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 block">ETA</span>
                    <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                      {selectedOrder.deliverySchedule?.mode === 'scheduled'
                        ? selectedOrder.deliverySchedule.timeSlot
                        : activeStepIdx >= 3
                        ? 'Delivered'
                        : '⚡ 25 - 35 mins'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Timing Banner if scheduled */}
              {selectedOrder.deliverySchedule && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg">{selectedOrder.deliverySchedule.mode === 'scheduled' ? '📅' : '⚡'}</span>
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {selectedOrder.deliverySchedule.mode === 'scheduled'
                          ? `Scheduled Delivery: ${selectedOrder.deliverySchedule.date} (${selectedOrder.deliverySchedule.timeSlot})`
                          : 'Express Priority Delivery (ASAP 25-35 mins)'}
                      </span>
                      {selectedOrder.deliverySchedule.note && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          "{selectedOrder.deliverySchedule.note}"
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    {selectedOrder.deliverySchedule.mode === 'scheduled' ? 'Scheduled' : 'ASAP'}
                  </span>
                </div>
              )}

              {/* Step Timeline */}
              <div className="relative py-2 sm:py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = activeStepIdx > idx;
                    const isCurrent = activeStepIdx === idx;

                    return (
                      <div
                        key={step.key}
                        className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 shadow-md ring-2 ring-orange-500/20'
                            : isCompleted
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mx-auto mb-1.5 sm:mb-2 flex items-center justify-center text-base sm:text-xl bg-white dark:bg-slate-800 shadow-xs">
                          {isCompleted ? '✓' : step.icon}
                        </div>
                        <p
                          className={`text-[11px] sm:text-xs font-bold leading-tight ${
                            isCurrent
                              ? 'text-orange-600 dark:text-orange-400'
                              : isCompleted
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {t(step.labelKey)}
                        </p>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5">
                          {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-Time Interactive Delivery Map */}
              <DeliveryMapCard order={selectedOrder} driverLoc={driverLoc} />

              {/* Live Courier & Quick Chat Bar */}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={chatDriver?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
                        alt={chatDriver?.name || 'Driver'}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-orange-500 shadow-sm"
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
              )}

              {/* Delivery Instructions & Drop-off Notes */}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <DeliveryInstructionsCard
                  currentInstruction={deliveryInstruction}
                  onSaveInstruction={saveDeliveryInstruction}
                  onSendPresetToChat={sendChatPreset}
                />
              )}

              {/* Delivered Order Review Showcase / CTA */}
              {selectedOrder.status === 'delivered' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/25 shrink-0">
                      ⭐
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {hasReviewedOrder(selectedOrder.id)
                          ? 'You Rated This Order!'
                          : t('reviews.howWasYourMeal')}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {hasReviewedOrder(selectedOrder.id)
                          ? `★ ${getReviewForOrder(selectedOrder.id)?.overallRating}/5 Stars • "${getReviewForOrder(selectedOrder.id)?.comment || 'Thank you for your feedback!'}"`
                          : t('reviews.rateMealPrompt')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setRatingTargetOrder(selectedOrder);
                      setShowRatingModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 active:scale-95 transition-all flex items-center space-x-1.5 self-start sm:self-auto shrink-0"
                  >
                    <span>⭐</span>
                    <span>{hasReviewedOrder(selectedOrder.id) ? 'Update Review' : t('reviews.rateOrder')}</span>
                  </button>
                </div>
              )}

              {/* Order Items Breakdown */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Items in this order
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="py-2.5 sm:py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 sm:space-x-3">
                        <img
                          src={item.foodImageUrl}
                          alt={item.foodName}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
                          }}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.quantity}x {item.foodName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {formatUsd(item.price)} each
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {formatUsd(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Payment Info */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] sm:text-[11px] block">Delivery Address:</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5 break-words">
                    📍 {selectedOrder.deliveryAddress}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] sm:text-[11px] block">Payment Method:</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5 uppercase break-words">
                    💳 {selectedOrder.paymentMethod} • Status: {selectedOrder.paymentStatus}
                  </p>
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-baseline pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Total Amount</span>
                <div className="text-right">
                  <span className="text-lg sm:text-xl font-black text-orange-600 dark:text-orange-400">
                    {formatUsd(selectedOrder.totalAmount)}
                  </span>
                  <span className="block text-[10px] sm:text-xs text-slate-400">
                    ({formatKhr(selectedOrder.totalAmount)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Rating Modal */}
      <OrderRatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setRatingTargetOrder(null);
        }}
        order={ratingTargetOrder || selectedOrder}
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

      {/* Floating Driver Chat Trigger */}
      {selectedOrder && selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
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
