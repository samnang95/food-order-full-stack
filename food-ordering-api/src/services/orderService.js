const orderRepository = require('../repositories/orderRepository');
const foodRepository = require('../repositories/foodRepository');
const voucherService = require('./voucherService');
const { startSimulation, stopSimulation } = require('../socket/driverSimulator');
const { getIO } = require('../socket/socketManager');
const firebaseService = require('./firebaseService');

/**
 * Default Phnom Penh delivery locations (simulated for demo)
 * In production, this would come from the user's real GPS coordinates
 */
const DEFAULT_DELIVERY_LOCATIONS = [
  { lat: 11.5564, lng: 104.9282 }, // Central Market area
  { lat: 11.5725, lng: 104.9200 }, // Toul Tom Poung
  { lat: 11.5494, lng: 104.9339 }, // Riverside
  { lat: 11.5684, lng: 104.8910 }, // Russian Market
  { lat: 11.5448, lng: 104.9283 }, // Wat Phnom area
];

const orderService = {
  placeOrder: async (userId, orderData) => {
    // 1. Validate items array
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    let totalAmount = 0;
    const finalItems = [];

    // 2. Process each item: fetch real price from DB to prevent fake client prices
    for (const item of orderData.items) {
      const food = await foodRepository.findById(item.food);
      
      if (!food) {
        throw new Error(`Food item not found (ID: ${item.food})`);
      }
      
      if (!food.isAvailable) {
        throw new Error(`Food item '${food.name}' is currently unavailable`);
      }

      // Add to total
      const itemTotal = food.price * item.quantity;
      totalAmount += itemTotal;

      // Push sanitized item
      finalItems.push({
        food: food._id,
        quantity: item.quantity,
        price: food.price // use real price
      });
    }

    // 3. Process voucher discount if provided
    let discountAmount = 0;
    let appliedVoucherCode = null;

    if (orderData.voucherCode) {
      const voucherRes = voucherService.validateVoucher(orderData.voucherCode, totalAmount);
      if (voucherRes.valid) {
        discountAmount = voucherRes.discountAmount;
        appliedVoucherCode = voucherRes.code;
        totalAmount = voucherRes.finalSubtotal;
      }
    }

    // 4. Assign a random delivery location (simulated)
    const deliveryLocation = orderData.deliveryLocation ||
      DEFAULT_DELIVERY_LOCATIONS[Math.floor(Math.random() * DEFAULT_DELIVERY_LOCATIONS.length)];

    // 5. Create the order
    const finalOrderData = {
      user: userId,
      items: finalItems,
      totalAmount: totalAmount,
      voucherCode: appliedVoucherCode,
      discountAmount: discountAmount,
      deliveryAddress: orderData.deliveryAddress,
      deliveryLocation,
      paymentMethod: orderData.paymentMethod || 'cash',
      paymentStatus: orderData.paymentStatus || 'pending',
      paymentRef: orderData.paymentRef || orderData.transactionId || null,
      tipAmount: Number(orderData.tipAmount) || 0,
      deliverySchedule: orderData.deliverySchedule || { mode: 'asap' },
      deliveryNotes: orderData.deliveryNotes || '',
    };

    const createdOrder = await orderRepository.create(finalOrderData);

    try {
      const io = getIO();
      // Broadcast real-time order to all stations (Admin, KDS, etc.)
      io.emit('order:created', createdOrder);
      io.emit('order_created', createdOrder);

      const notif = {
        id: `notif_${Date.now()}`,
        type: 'order',
        title: '📦 Order Confirmed!',
        body: `Your order #${createdOrder._id.toString().slice(-6).toUpperCase()} has been placed and is being prepared.`,
        orderId: createdOrder._id.toString(),
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      io.to(`order_${createdOrder._id}`).emit('push_notification', notif);
      io.emit('push_notification', notif);
    } catch (_) {}

    // Send push notification via Firebase Cloud Messaging
    try {
      await firebaseService.sendPushNotificationToUser(userId, {
        title: '📦 Order Confirmed!',
        body: `Your order #${createdOrder._id.toString().slice(-6).toUpperCase()} has been placed and is being prepared.`,
        data: {
          orderId: createdOrder._id.toString(),
          type: 'order',
        },
      });
    } catch (_) {}

    return createdOrder;
  },

  getUserOrders: async (userId) => {
    return await orderRepository.findByUserId(userId);
  },

  getAllOrders: async () => {
    return await orderRepository.findAll();
  },

  getOrderById: async (orderId, userId, userRole) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const isStaff = ['admin', 'manager', 'kitchen', 'staff'].includes(userRole);
    const orderUserId = order.user && (order.user._id ? order.user._id.toString() : order.user.toString());
    const isOwner = orderUserId === (userId ? userId.toString() : '');

    if (!isStaff && !isOwner) {
      throw new Error('Not authorized to view this order');
    }

    return order;
  },

  updateOrderStatus: async (orderId, status, paymentStatus) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Valid statuses
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'on_delivery', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }

    const validPaymentStatuses = ['pending', 'completed', 'failed'];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      throw new Error('Invalid payment status');
    }

    const isDeliveryStatus = status === 'out_for_delivery' || status === 'on_delivery';
    const wasDeliveryStatus = order.status === 'out_for_delivery' || order.status === 'on_delivery';

    // If transitioning to delivery status, start driver simulation
    if (isDeliveryStatus && !wasDeliveryStatus) {
      const deliveryLocation = order.deliveryLocation || 
        DEFAULT_DELIVERY_LOCATIONS[Math.floor(Math.random() * DEFAULT_DELIVERY_LOCATIONS.length)];

      try {
        startSimulation(orderId, deliveryLocation, async () => {
          // Auto-update order status to delivered when driver arrives
          const deliveredOrder = await orderRepository.updateStatus(orderId, 'delivered', 'completed');
          try {
            const io = getIO();
            io.to(`order_${orderId}`).emit('order_status_changed', { orderId, status: 'delivered', paymentStatus: 'completed', order: deliveredOrder });
            io.emit('order_status_changed', { orderId, status: 'delivered', paymentStatus: 'completed', order: deliveredOrder });
            io.emit('order:status_updated', { orderId, status: 'delivered', paymentStatus: 'completed', order: deliveredOrder });
          } catch (_) {}
        });
      } catch (err) {
        console.warn('⚠️ [orderService] Driver simulation error:', err.message);
      }
    }

    // If cancelling, stop any active simulation
    if (status === 'cancelled') {
      try {
        stopSimulation(orderId);
      } catch (_) {}
    }

    // Update in database first so we have the full populated order
    const updatedOrder = await orderRepository.updateStatus(orderId, status, paymentStatus);

    // Determine notification content for status transition
    let notifTitle = null;
    let notifBody = null;
    let notifType = 'order';

    if (status === 'preparing') {
      notifTitle = '🍳 Kitchen is Cooking!';
      notifBody = `Your order #${orderId.toString().slice(-6).toUpperCase()} is currently being freshly prepared.`;
    } else if (isDeliveryStatus) {
      notifTitle = '🛵 Rider Dispatched!';
      notifBody = 'Rider Sok Dara has picked up your food and is on the way!';
    } else if (status === 'delivered') {
      notifTitle = '🎉 Order Delivered!';
      notifBody = 'Your food has arrived at your address. Enjoy your meal!';
      notifType = 'delivery';
    } else if (status === 'cancelled') {
      notifTitle = '❌ Order Cancelled';
      notifBody = `Your order #${orderId.toString().slice(-6).toUpperCase()} has been cancelled.`;
    }

    // 1. Emit status change & push notification via Socket.IO
    try {
      const io = getIO();
      // Emit to specific order tracking room
      io.to(`order_${orderId}`).emit('order_status_changed', { orderId, status, paymentStatus, order: updatedOrder });
      // Broadcast globally for Admin & KDS dashboards
      io.emit('order_status_changed', { orderId, status, paymentStatus, order: updatedOrder });
      io.emit('order:status_updated', { orderId, status, paymentStatus, order: updatedOrder });

      if (notifTitle) {
        const notif = {
          id: `notif_${Date.now()}`,
          type: notifType,
          title: notifTitle,
          body: notifBody,
          orderId: orderId.toString(),
          timestamp: new Date().toISOString(),
          isRead: false,
        };
        io.to(`order_${orderId}`).emit('push_notification', notif);
        io.emit('push_notification', notif);
      }
    } catch (_) {
      // Socket not initialized, skip
    }

    // 2. Send push notification via Firebase Cloud Messaging
    if (notifTitle) {
      const orderUserId = order.user?._id || order.user;
      if (orderUserId) {
        try {
          await firebaseService.sendPushNotificationToUser(orderUserId, {
            title: notifTitle,
            body: notifBody,
            data: {
              orderId: orderId.toString(),
              type: notifType,
            },
          });
        } catch (err) {
          console.error('⚠️ [orderService] FCM push error:', err.message);
        }
      }
    }

    return updatedOrder;
  },

  getUserOrderAnalytics: async (userId) => {
    const orders = await orderRepository.findByUserId(userId);

    let totalSpent = 0;
    let totalSavings = 0;
    let deliveredCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    const dishCounts = {};
    const monthsMap = {};
    const daysMap = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const hoursMap = { Morning: 0, Lunch: 0, Afternoon: 0, Dinner: 0, LateNight: 0 };
    const paymentMap = {};

    // Initialize last 6 calendar months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      monthsMap[key] = { key, month: monthLabel, year: d.getFullYear(), spent: 0, orders: 0 };
    }

    orders.forEach((order) => {
      const status = (order.status || 'pending').toLowerCase();
      const amount = Number(order.totalAmount) || 0;
      const discount = Number(order.discountAmount) || 0;

      if (status === 'delivered') deliveredCount++;
      else if (status === 'cancelled') cancelledCount++;
      else pendingCount++;

      // Count spending & savings for valid orders (not cancelled)
      if (status !== 'cancelled') {
        totalSpent += amount;
        totalSavings += discount;

        // Payment method distribution
        const pMethod = order.paymentMethod || 'cash';
        paymentMap[pMethod] = (paymentMap[pMethod] || 0) + 1;

        // Items and Dishes
        if (Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const foodName = item.food?.name || 'Delicious Dish';
            const foodImage = item.food?.imageUrl || '';
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || (Number(item.food?.price) || 0);

            if (!dishCounts[foodName]) {
              dishCounts[foodName] = {
                name: foodName,
                imageUrl: foodImage,
                quantity: 0,
                totalSpent: 0,
                ordersCount: 0,
              };
            }
            dishCounts[foodName].quantity += qty;
            dishCounts[foodName].totalSpent += price * qty;
            dishCounts[foodName].ordersCount += 1;
            if (!dishCounts[foodName].imageUrl && foodImage) {
              dishCounts[foodName].imageUrl = foodImage;
            }
          });
        }

        // Monthly trend
        const orderDate = new Date(order.createdAt || Date.now());
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthsMap[monthKey]) {
          monthsMap[monthKey].spent += amount;
          monthsMap[monthKey].orders += 1;
        }

        // Day of week
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[orderDate.getDay()];
        if (dayName) daysMap[dayName] = (daysMap[dayName] || 0) + 1;

        // Hour intervals
        const hour = orderDate.getHours();
        if (hour >= 6 && hour < 11) hoursMap.Morning++;
        else if (hour >= 11 && hour < 14) hoursMap.Lunch++;
        else if (hour >= 14 && hour < 17) hoursMap.Afternoon++;
        else if (hour >= 17 && hour < 22) hoursMap.Dinner++;
        else hoursMap.LateNight++;
      }
    });

    // Top dishes sorted by quantity
    const topDishes = Object.values(dishCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Monthly trends array with peak flag
    const monthlySpending = Object.values(monthsMap);
    const maxSpent = Math.max(...monthlySpending.map((m) => m.spent), 0);
    monthlySpending.forEach((m) => {
      m.isPeak = maxSpent > 0 && m.spent === maxSpent;
      m.spent = Number(m.spent.toFixed(2));
    });

    // Habits
    const topDay = Object.entries(daysMap).reduce(
      (best, [day, count]) => (count > best.count ? { day, count } : best),
      { day: 'Friday', count: 0 }
    ).day;

    const topTimeSlot = Object.entries(hoursMap).reduce(
      (best, [slot, count]) => (count > best.count ? { slot, count } : best),
      { slot: 'Dinner', count: 0 }
    ).slot;

    const topPayment = Object.entries(paymentMap).reduce(
      (best, [method, count]) => (count > best.count ? { method, count } : best),
      { method: 'Bakong KHQR', count: 0 }
    ).method;

    const validOrderCount = deliveredCount + pendingCount;
    const averageOrderValue = validOrderCount > 0 ? Number((totalSpent / validOrderCount).toFixed(2)) : 0;

    return {
      totalSpent: Number(totalSpent.toFixed(2)),
      totalSavings: Number(totalSavings.toFixed(2)),
      totalOrders: orders.length,
      deliveredCount,
      pendingCount,
      cancelledCount,
      averageOrderValue,
      monthlySpending,
      topDishes,
      habits: {
        topDay,
        topTimeSlot,
        preferredPayment: topPayment === 'bakong_khqr' ? 'Bakong KHQR' : 'Cash on Delivery',
      },
    };
  }
};

module.exports = orderService;
