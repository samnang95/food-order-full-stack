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

// ==============================
// Admin-Only Routes
// ==============================
// Get all users in the system
router.get('/', authorizeRoles('admin'), userController.getAllUsers);

// Promote/Demote a user's role
router.put('/:id/role', authorizeRoles('admin'), userController.updateUserRole);

module.exports = router;
