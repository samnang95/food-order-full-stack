const orderService = require('../services/orderService');

const placeOrder = async (req, res) => {
  try {
    const newOrder = await orderService.placeOrder(req.user.id, req.body);
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);
    res.json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updatedOrder = await orderService.updateOrderStatus(req.params.id, status, paymentStatus);
    res.json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus
};
