const accountService = require('../services/accountService');

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.body?.userId ||
    req.query?.userId ||
    req.headers['x-user-id'] ||
    null
  );
};

// ==========================================
// Address Endpoints
// ==========================================

const getAddresses = async (req, res) => {
  try {
    const userId = getUserId(req);
    const addresses = await accountService.getAddresses(userId);
    res.json({ success: true, count: addresses.length, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    const address = await accountService.saveAddress(userId, req.body);
    res.status(201).json({ success: true, message: 'Address saved successfully', address });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const address = await accountService.updateAddress(userId, id, req.body);
    res.json({ success: true, message: 'Address updated successfully', address });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const result = await accountService.deleteAddress(userId, id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const syncAddresses = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { addresses } = req.body;
    const synced = await accountService.syncAddresses(userId, addresses);
    res.json({ success: true, message: 'Addresses synchronized', addresses: synced });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==========================================
// Favorites Endpoints
// ==========================================

const getFavorites = async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await accountService.getFavorites(userId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const userId = getUserId(req);
    const foodId = req.body.foodId || req.params.foodId;
    const result = await accountService.toggleFavorite(userId, foodId);
    res.json({ success: true, message: 'Favorite status toggled', ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const syncFavorites = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { favoriteIds } = req.body;
    const result = await accountService.syncFavorites(userId, favoriteIds);
    res.json({ success: true, message: 'Favorites synchronized', ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { foodId } = req.params;
    const result = await accountService.removeFavorite(userId, foodId);
    res.json({ success: true, message: 'Favorite removed', ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const clearFavorites = async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await accountService.clearFavorites(userId);
    res.json({ success: true, message: 'All favorites cleared', ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAddresses,
  saveAddress,
  updateAddress,
  deleteAddress,
  syncAddresses,
  getFavorites,
  toggleFavorite,
  syncFavorites,
  removeFavorite,
  clearFavorites,
};
