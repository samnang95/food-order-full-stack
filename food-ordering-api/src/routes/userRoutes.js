const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(protect);

// ==============================
// Profile Routes (Any User)
// ==============================
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/profile/password', userController.changePassword);
router.post('/fcm-token', userController.updateFcmToken);

// ==============================
// User Management Routes
// ==============================
// Get all users in the system (Staff/Admin only)
router.get('/', authorizeRoles('admin', 'manager'), userController.getAllUsers);

// Update a user's role (Admin only)
router.put('/:id/role', authorizeRoles('admin'), userController.updateUserRole);

module.exports = router;
