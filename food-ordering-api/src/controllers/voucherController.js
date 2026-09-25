const voucherService = require('../services/voucherService');

const getAvailableVouchers = (req, res) => {
  try {
    const vouchers = voucherService.getAvailableVouchers();
    res.json({
      status: 'success',
      data: vouchers,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const validateVoucher = (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const result = voucherService.validateVoucher(code, subtotal);

    if (!result.valid) {
      return res.status(400).json({
        status: 'fail',
        message: result.message,
        minSpend: result.minSpend,
      });
    }

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getAvailableVouchers,
  validateVoucher,
};
