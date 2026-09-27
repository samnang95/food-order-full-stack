const express = require('express');
const router = express.Router();
const dietaryController = require('../controllers/dietaryController');

// Get dietary & allergen preferences
router.get('/preferences', dietaryController.getPreferences);

// Save dietary & allergen preferences
router.post('/preferences', dietaryController.savePreferences);

module.exports = router;
