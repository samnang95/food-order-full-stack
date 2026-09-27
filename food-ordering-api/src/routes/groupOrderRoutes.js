const express = require('express');
const router = express.Router();
const groupOrderController = require('../controllers/groupOrderController');

// Create group order
router.post('/', groupOrderController.createGroupOrder);

// Get group order details
router.get('/:groupId', groupOrderController.getGroupOrder);

// Join group order
router.post('/:groupId/join', groupOrderController.joinGroupOrder);

// Leave group order
router.post('/:groupId/leave', groupOrderController.leaveGroupOrder);

// Add item to group cart
router.post('/:groupId/items', groupOrderController.addItem);

// Remove item from group cart
router.delete('/:groupId/items/:itemId', groupOrderController.removeItem);

// Lock / Unlock group cart
router.put('/:groupId/lock', groupOrderController.lockGroupOrder);

module.exports = router;
