const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// All order routes require authentication
router.use(protect);

// Customer places an order
router.post('/', orderController.placeOrder);

// Customer gets their orders / Staff gets all orders
router.get('/', orderController.getMyOrders);

// Customer gets spending & order history analytics
router.get('/analytics', orderController.getOrderAnalytics);

// View specific order details
router.get('/:id', orderController.getOrderById);

// Update order status (Admin, Manager, Kitchen, Staff, Customer)
router.put('/:id/status', authorizeRoles('admin', 'manager', 'kitchen', 'staff', 'user'), orderController.updateOrderStatus);

module.exports = router;
