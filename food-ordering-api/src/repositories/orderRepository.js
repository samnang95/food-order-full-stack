const Order = require('../models/orderModel');

const orderRepository = {
  create: async (orderData) => {
    const newOrder = new Order(orderData);
    await newOrder.save();
    const populated = await Order.findById(newOrder._id)
      .populate('items.food', 'name imageUrl price');
    return populated || newOrder;
  },

  findById: async (id) => {
    return await Order.findById(id)
      .populate('user', 'username email')
      .populate('items.food', 'name imageUrl price');
  },

  findByUserId: async (userId) => {
    return await Order.find({ user: userId })
      .populate('items.food', 'name imageUrl price')
      .sort({ createdAt: -1 });
  },

  findAll: async () => {
    return await Order.find()
      .populate('user', 'username email')
      .populate('items.food', 'name imageUrl price')
      .sort({ createdAt: -1 });
  },

  updateStatus: async (id, status, paymentStatus) => {
    const updateFields = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    return await Order.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
  }
};

module.exports = orderRepository;
