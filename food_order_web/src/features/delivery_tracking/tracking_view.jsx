import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatUsd } from '../../core';
import { AppRoutes, getOrderDetailRoute } from '../../routes/app_routes';
import { container } from '../../core/di/container';
import { useTrackingStore } from './tracking_store';
import { LiveEtaBanner } from './components/LiveEtaBanner';
import { TrackingMapView } from './components/TrackingMapView';
import { TrackingTimeline } from './components/TrackingTimeline';
import { DriverInfoCard } from './components/DriverInfoCard';
import { DriverChatButton, DriverChatDrawer, useDriverChatStore } from '../chat';
import { DeliveryInstructionsCard } from '../chat/components/DeliveryInstructionsCard';

export function TrackingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);

  const {
    tracking,
    isLoading,
    errorMessage,
    isMapExpanded,
    toggleMap,
    loadTracking,
  } = useTrackingStore(id);

  const orderNumber = order?.orderNumber || `#${(id || '').slice(-6).toUpperCase()}`;

  const chatOrder = useMemo(() => {
    if (!order && !tracking) return null;
    const base = order ? { ...order } : { id, orderNumber };
    if (tracking) {
      base.driver = {
        name: tracking.driverName || 'Sok Dara',
        phone: tracking.driverPhone || '+85512889900',
        avatar: tracking.driverAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
        rating: tracking.driverRating || 4.9,
        plate: tracking.vehiclePlate || 'PP-0000',
        vehicle: tracking.vehicleType || 'Motorbike',
        status: tracking.status || 'on_the_way',
      };
    }
    return base;
  }, [order, tracking, id, orderNumber]);

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
  } = useDriverChatStore(chatOrder);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    async function loadOrder() {
      try {
        setOrderLoading(true);
        const orderData = await container.getOrderByIdUseCase.execute(id);
        if (mounted) setOrder(orderData);
      } catch (err) {
        console.warn('[TrackingView] Could not load order:', err);
      } finally {
        if (mounted) setOrderLoading(false);
      }
    }
    loadOrder();
    return () => { mounted = false; };
  }, [id]);

  if (isLoading || orderLoading) {
    return (
      <div className="py-20 text-center space-y-4 animate-in fade-in duration-300">
        <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          Loading live tracking...
        </p>
      </div>
    );
  }

  // Error state
  if (errorMessage || !tracking) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-300">
        <span className="text-5xl block">🛵</span>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          Tracking Not Available
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {errorMessage || 'We could not find a live tracking session for this order.'}
        </p>
        <div className="flex items-center justify-center space-x-3 pt-2">
          <Link
            to={AppRoutes.ORDERS}
            className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            ← My Orders
          </Link>
          <button
            type="button"
            onClick={() => loadTracking(id)}
            className="px-5 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isLive = tracking.isLive;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center space-x-1"
          >
            <span>←</span>
            <span>Back</span>
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <span>🛵</span>
              <span>Live Delivery Tracking</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Order {orderNumber}
              {order?.createdAt && ` • ${new Date(order.createdAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {id && (
            <Link
              to={getOrderDetailRoute(id)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center space-x-1.5"
            >
              <span>🧾</span>
              <span>View Receipt</span>
            </Link>
          )}

          {isLive && (
            <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Live ETA Banner */}
      <LiveEtaBanner tracking={tracking} />

      {/* Main Content Grid: Map + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Map (2 cols on large) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-base">🗺️</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Live Courier Map
                </h3>
              </div>
              <button
                type="button"
                onClick={toggleMap}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
              >
                {isMapExpanded ? 'Minimize' : 'Expand'}
              </button>
            </div>

            <TrackingMapView
              tracking={tracking}
              className={isMapExpanded ? 'h-[500px]' : ''}
            />
          </div>

          {/* Driver Info Card with Live Chat & Call Trigger */}
          <DriverInfoCard
            tracking={tracking}
            onChatDriver={openChat}
            unreadCount={chatUnreadCount}
          />

          {/* Delivery Instructions & Drop-off Notes */}
          <DeliveryInstructionsCard
            currentInstruction={deliveryInstruction}
            onSaveInstruction={saveDeliveryInstruction}
            onSendPresetToChat={sendChatPreset}
          />

          {/* Order Items Summary (if order loaded) */}
          {order?.items?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Order Summary ({order.items.length} items)
              </h3>
              <div className="space-y-2.5">
                {order.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      {item.foodImageUrl && (
                        <img
                          src={item.foodImageUrl}
                          alt={item.foodName}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.foodName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          x{item.quantity || 1}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {formatUsd((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  Total
                </span>
                <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                  {formatUsd(Number(order.totalAmount || 0))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Timeline */}
        <div className="space-y-4">
          {/* Timeline Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Delivery Timeline
            </h3>
            <TrackingTimeline
              timeline={tracking.timeline}
              status={tracking.status}
            />
          </div>

          {/* Delivery Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Delivery Details
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Pickup From
                </p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  🍽️ BiteCraft Kitchen
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  BKK1, Phnom Penh
                </p>
              </div>

              <div className="flex items-center space-x-2 text-slate-300 dark:text-slate-600">
                <div className="flex-1 h-px bg-current" />
                <span className="text-lg">↓</span>
                <div className="flex-1 h-px bg-current" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Deliver To
                </p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  📍 {order?.deliveryAddress || 'Phnom Penh, Cambodia'}
                </p>
                {order?.notes && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 italic mt-0.5">
                    "{order.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            {order?.paymentMethod && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Payment
                </p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  💳 {order.paymentMethod === 'KHQR' ? 'Bakong KHQR' : order.paymentMethod}
                </p>
              </div>
            )}
          </div>

          {/* Help Card */}
          <div className="bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-800/50 dark:to-orange-950/20 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Need Help?
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Having trouble with your delivery? Our support team is available 24/7.
            </p>
            <div className="flex flex-col space-y-2">
              <a
                href="tel:+85523999888"
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
              >
                📞 Call Support: +855 23 999 888
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Driver Chat Trigger (visible when rider is assigned) */}
      {tracking?.driverName && (
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
