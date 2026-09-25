const orderRepository = require('../repositories/orderRepository');
const foodRepository = require('../repositories/foodRepository');
const voucherService = require('./voucherService');
const { startSimulation, stopSimulation } = require('../socket/driverSimulator');
const { getIO } = require('../socket/socketManager');

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
      paymentMethod: orderData.paymentMethod || 'cash'
    };

    return await orderRepository.create(finalOrderData);
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

    // Security check: users can only view their own order
    if (order.user._id.toString() !== userId.toString()) {
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
    const validStatuses = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }

    const validPaymentStatuses = ['pending', 'completed', 'failed'];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      throw new Error('Invalid payment status');
    }

    // If transitioning to out_for_delivery, start driver simulation
    if (status === 'out_for_delivery' && order.status !== 'out_for_delivery') {
      const deliveryLocation = order.deliveryLocation || 
        DEFAULT_DELIVERY_LOCATIONS[Math.floor(Math.random() * DEFAULT_DELIVERY_LOCATIONS.length)];

      startSimulation(orderId, deliveryLocation, async () => {
        // Auto-update order status to delivered when driver arrives
        await orderRepository.updateStatus(orderId, 'delivered', 'completed');
      });
    }

    // If cancelling, stop any active simulation
    if (status === 'cancelled') {
      stopSimulation(orderId);
    }

    // Emit status change event via Socket.IO
    try {
      const io = getIO();
      io.to(`order_${orderId}`).emit('order_status_changed', { orderId, status });
    } catch (e) {
      // Socket not initialized yet, skip
    }

    return await orderRepository.updateStatus(orderId, status, paymentStatus);
  }
};

module.exports = orderService;
