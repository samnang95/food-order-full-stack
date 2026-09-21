const orderRepository = require('../repositories/orderRepository');
const foodRepository = require('../repositories/foodRepository');

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

    // 3. Create the order
    const finalOrderData = {
      user: userId,
      items: finalItems,
      totalAmount: totalAmount,
      deliveryAddress: orderData.deliveryAddress,
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

    return await orderRepository.updateStatus(orderId, status, paymentStatus);
  }
};

module.exports = orderService;
