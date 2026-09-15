const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All profile routes require authentication
router.use(protect);

// GET /users/profile
router.get('/profile', userController.getProfile);

// PUT /users/profile
router.put('/profile', userController.updateProfile);

// PUT /users/profile/password
router.put('/profile/password', userController.changePassword);

module.exports = router;
