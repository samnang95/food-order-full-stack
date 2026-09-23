const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// All upload routes require authentication
router.use(protect);

// Upload a single image
router.post('/', upload.single('image'), uploadController.uploadImage);

// Delete an image by public ID
router.delete('/:publicId', uploadController.deleteImage);

module.exports = router;
