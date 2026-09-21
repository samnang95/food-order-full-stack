const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes (anyone can view categories and their foods)
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/foods', categoryController.getFoodsByCategory);

// Protected routes (authenticated users can modify categories)
router.use(protect);
router.use(authorizeRoles('user'));

router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
