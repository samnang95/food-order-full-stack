const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/apple', authController.appleLogin);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

// Profile shortcuts
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

module.exports = router;
