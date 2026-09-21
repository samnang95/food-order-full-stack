const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes (anyone can view food and search/filter)
router.get('/', foodController.getAllFoods);
router.get('/:id', foodController.getFoodById);

// Protected routes (authenticated users can modify food)
router.use(protect);
router.use(authorizeRoles('user'));

router.post('/', foodController.createFood);
router.put('/:id', foodController.updateFood);
router.delete('/:id', foodController.deleteFood);

module.exports = router;
