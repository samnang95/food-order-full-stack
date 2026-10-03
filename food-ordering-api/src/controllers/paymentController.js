const paymentService = require('../services/paymentService');

const generateKhqr = (req, res) => {
  try {
    const { amount, currency, orderId, merchantAccount, merchantName } = req.body;
    const result = paymentService.generateKhqr({
      amount,
      currency,
      orderId,
      merchantAccount,
      merchantName,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { transactionId, orderId, bankName } = req.body;
    const result = await paymentService.verifyPayment({
      transactionId,
      orderId,
      bankName,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  generateKhqr,
  verifyPayment,
};
