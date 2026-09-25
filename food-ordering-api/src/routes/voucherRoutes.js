const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

// List available vouchers
router.get('/', voucherController.getAvailableVouchers);

// Validate and calculate discount for a code
router.post('/validate', voucherController.validateVoucher);

module.exports = router;
