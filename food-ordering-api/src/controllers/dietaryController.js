const dietaryService = require('../services/dietaryService');

const getPreferences = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const preferences = await dietaryService.getUserPreferences(userId);
    res.json({ success: true, preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const savePreferences = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const preferences = await dietaryService.saveUserPreferences(userId, req.body);
    res.json({ success: true, preferences });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPreferences,
  savePreferences,
};
