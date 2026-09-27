const driverTipService = require('../services/driverTipService');

const submitTip = async (req, res) => {
  try {
    const tip = await driverTipService.submitDriverTip(req.body);
    res.status(201).json({ success: true, tip });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getOrderTipStatus = async (req, res) => {
  try {
    const status = await driverTipService.getOrderTipStatus(req.params.orderId);
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const result = await driverTipService.submitDriverFeedback(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getDriverProfile = async (req, res) => {
  try {
    const profile = await driverTipService.getDriverProfile(req.params.driverId);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitTip,
  getOrderTipStatus,
  submitFeedback,
  getDriverProfile,
};
