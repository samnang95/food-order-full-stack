const mongoose = require('mongoose');
const UserAddress = require('../models/userAddressModel');
const UserFavorite = require('../models/userFavoriteModel');
const User = require('../models/userModel');
const Food = require('../models/foodModel');

const DEFAULT_SEED_ADDRESSES = [
  {
    customId: 'addr_home',
    label: 'Home',
    address: 'Building 45, Street 302, Boeng Keng Kang 1, Phnom Penh',
    note: 'Call when arriving, 3rd floor',
    lat: 11.551,
    lng: 104.925,
    isDefault: true,
  },
  {
    customId: 'addr_work',
    label: 'Work',
    address: 'Vattanac Capital Tower, Level 12, Preah Monivong Blvd, Daun Penh, Phnom Penh',
    note: 'Leave at lobby reception',
    lat: 11.572,
    lng: 104.925,
    isDefault: false,
  },
];

/**
 * Resolve effective userId, falling back to an existing verified user in DB if unauthenticated
 */
const resolveUserId = async (rawUserId) => {
  if (rawUserId && mongoose.Types.ObjectId.isValid(rawUserId)) {
    return rawUserId;
  }
  // Try finding default user
  let user = await User.findOne({ username: 'Pozz nang' });
  if (!user) {
    user = await User.findOne();
  }
  if (!user) {
    user = await User.create({
      username: 'BiteCraft Foodie',
      email: 'foodie@bitecraft.local',
      role: 'user',
    });
  }
  return user._id;
};

// ==========================================
// Address Services
// ==========================================

const getAddresses = async (userId) => {
  const uid = await resolveUserId(userId);
  let addresses = await UserAddress.find({ userId: uid }).sort({ isDefault: -1, createdAt: -1 });

  // Auto-seed default Phnom Penh addresses if user has no saved addresses
  if (addresses.length === 0) {
    const seeded = await UserAddress.insertMany(
      DEFAULT_SEED_ADDRESSES.map((a) => ({ ...a, userId: uid }))
    );
    return seeded.map(formatAddress);
  }

  return addresses.map(formatAddress);
};

const saveAddress = async (userId, addressData) => {
  const uid = await resolveUserId(userId);

  if (addressData.isDefault) {
    await UserAddress.updateMany({ userId: uid }, { isDefault: false });
  }

  // Check if address already exists by customId or _id
  let existing = null;
  if (addressData.id && mongoose.Types.ObjectId.isValid(addressData.id)) {
    existing = await UserAddress.findOne({ _id: addressData.id, userId: uid });
  } else if (addressData.customId || addressData.id) {
    existing = await UserAddress.findOne({
      customId: addressData.customId || addressData.id,
      userId: uid,
    });
  }

  if (existing) {
    existing.label = addressData.label || existing.label;
    existing.address = addressData.address || existing.address;
    existing.note = addressData.note !== undefined ? addressData.note : existing.note;
    existing.lat = Number(addressData.lat) || existing.lat;
    existing.lng = Number(addressData.lng) || existing.lng;
    existing.isDefault = Boolean(addressData.isDefault);
    await existing.save();
    return formatAddress(existing);
  }

  // Count existing addresses to decide isDefault
  const count = await UserAddress.countDocuments({ userId: uid });

  const newDoc = await UserAddress.create({
    userId: uid,
    customId: addressData.id || addressData.customId || `addr_${Date.now()}`,
    label: addressData.label || 'Home',
    address: addressData.address,
    note: addressData.note || '',
    lat: Number(addressData.lat) || 11.551,
    lng: Number(addressData.lng) || 104.925,
    isDefault: addressData.isDefault !== undefined ? Boolean(addressData.isDefault) : count === 0,
  });

  return formatAddress(newDoc);
};

const updateAddress = async (userId, addressId, fields) => {
  const uid = await resolveUserId(userId);

  if (fields.isDefault) {
    await UserAddress.updateMany({ userId: uid }, { isDefault: false });
  }

  const query = mongoose.Types.ObjectId.isValid(addressId)
    ? { _id: addressId, userId: uid }
    : { customId: addressId, userId: uid };

  const updated = await UserAddress.findOneAndUpdate(
    query,
    { $set: fields },
    { new: true }
  );

  if (!updated) {
    throw new Error('Address not found');
  }

  return formatAddress(updated);
};

const deleteAddress = async (userId, addressId) => {
  const uid = await resolveUserId(userId);

  const query = mongoose.Types.ObjectId.isValid(addressId)
    ? { _id: addressId, userId: uid }
    : { customId: addressId, userId: uid };

  const deleted = await UserAddress.findOneAndDelete(query);
  if (!deleted) {
    throw new Error('Address not found');
  }

  // If deleted address was default, make first remaining address default
  if (deleted.isDefault) {
    const firstRemaining = await UserAddress.findOne({ userId: uid }).sort({ createdAt: -1 });
    if (firstRemaining) {
      firstRemaining.isDefault = true;
      await firstRemaining.save();
    }
  }

  return { success: true, message: 'Address deleted successfully', deletedId: addressId };
};

const syncAddresses = async (userId, addressList = []) => {
  const uid = await resolveUserId(userId);
  if (!Array.isArray(addressList) || addressList.length === 0) {
    return await getAddresses(uid);
  }

  for (const item of addressList) {
    if (item && item.address) {
      await saveAddress(uid, item);
    }
  }

  return await getAddresses(uid);
};

function formatAddress(doc) {
  if (!doc) return null;
  return {
    id: doc.customId || doc._id.toString(),
    _id: doc._id.toString(),
    label: doc.label,
    address: doc.address,
    note: doc.note,
    lat: doc.lat,
    lng: doc.lng,
    isDefault: doc.isDefault,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ==========================================
// Favorites Services
// ==========================================

const getFavorites = async (userId) => {
  const uid = await resolveUserId(userId);

  let favDoc = await UserFavorite.findOne({ userId: uid }).populate({
    path: 'foodIds',
    select: 'name price imageUrl category description rating prepTime isAvailable',
  });

  if (!favDoc) {
    // Seed sample favorite dishes for delightful initial customer experience
    const sampleFoods = await Food.find({ isAvailable: true }).limit(2);
    const initialIds = sampleFoods.map((f) => f._id);
    favDoc = await UserFavorite.create({
      userId: uid,
      foodIds: initialIds,
    });
    favDoc = await favDoc.populate({
      path: 'foodIds',
      select: 'name price imageUrl category description rating prepTime isAvailable',
    });
  }

  // Filter out any deleted food references
  const validFoods = (favDoc.foodIds || []).filter((f) => f && f._id);
  const favoriteIds = validFoods.map((f) => f._id.toString());
  const favoriteFoods = validFoods.map((f) => ({
    id: f._id.toString(),
    name: f.name,
    price: f.price,
    imageUrl: f.imageUrl,
    categoryName: f.category?.name || 'Chef Specialty',
    description: f.description || '',
    rating: f.rating || 5.0,
    prepTime: f.prepTime || '15-20 min',
  }));

  return { favoriteIds, favoriteFoods, count: favoriteIds.length };
};

const toggleFavorite = async (userId, foodId) => {
  const uid = await resolveUserId(userId);
  if (!foodId) {
    throw new Error('foodId is required');
  }

  let favDoc = await UserFavorite.findOne({ userId: uid });
  if (!favDoc) {
    favDoc = new UserFavorite({ userId: uid, foodIds: [] });
  }

  const strFoodId = foodId.toString();
  const index = favDoc.foodIds.findIndex((id) => id.toString() === strFoodId);
  let isFavorite = false;

  if (index >= 0) {
    favDoc.foodIds.splice(index, 1);
    isFavorite = false;
  } else {
    // If it's a valid ObjectId, push it
    if (mongoose.Types.ObjectId.isValid(foodId)) {
      favDoc.foodIds.unshift(foodId);
      isFavorite = true;
    } else {
      // Find food by name or partial match
      const matchingFood = await Food.findOne({
        $or: [{ name: new RegExp(foodId, 'i') }],
      });
      if (matchingFood) {
        favDoc.foodIds.unshift(matchingFood._id);
        isFavorite = true;
      }
    }
  }

  await favDoc.save();
  return await getFavorites(uid);
};

const syncFavorites = async (userId, favoriteIds = []) => {
  const uid = await resolveUserId(userId);
  let favDoc = await UserFavorite.findOne({ userId: uid });
  if (!favDoc) {
    favDoc = new UserFavorite({ userId: uid, foodIds: [] });
  }

  const currentIds = (favDoc.foodIds || []).map((id) => id.toString());
  const combinedSet = new Set(currentIds);

  for (const fid of favoriteIds) {
    if (fid && mongoose.Types.ObjectId.isValid(fid)) {
      combinedSet.add(fid.toString());
    }
  }

  favDoc.foodIds = Array.from(combinedSet);
  await favDoc.save();

  return await getFavorites(uid);
};

const removeFavorite = async (userId, foodId) => {
  const uid = await resolveUserId(userId);
  if (!foodId) throw new Error('foodId is required');

  const strId = foodId.toString();
  await UserFavorite.updateOne(
    { userId: uid },
    { $pull: { foodIds: strId } }
  );

  return await getFavorites(uid);
};

const clearFavorites = async (userId) => {
  const uid = await resolveUserId(userId);
  await UserFavorite.updateOne(
    { userId: uid },
    { $set: { foodIds: [] } }
  );
  return { favoriteIds: [], favoriteFoods: [], count: 0 };
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
