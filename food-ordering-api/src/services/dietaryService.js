const UserDietary = require('../models/userDietaryModel');

const DEFAULT_PREFERENCES = {
  activeDietTag: 'all',
  selectedAllergens: [],
  dailyCalorieTarget: 2200,
  dailyProteinTarget: 90,
  showMacroBadges: true,
};

const getUserPreferences = async (userId) => {
  if (!userId) return DEFAULT_PREFERENCES;

  let prefs = await UserDietary.findOne({ userId });
  if (!prefs) {
    prefs = new UserDietary({
      userId,
      ...DEFAULT_PREFERENCES,
    });
    await prefs.save();
  }

  return {
    activeDietTag: prefs.activeDietTag,
    selectedAllergens: prefs.selectedAllergens || [],
    dailyCalorieTarget: prefs.dailyCalorieTarget || 2200,
    dailyProteinTarget: prefs.dailyProteinTarget || 90,
    showMacroBadges: prefs.showMacroBadges !== false,
  };
};

const saveUserPreferences = async (userId, data) => {
  if (!userId) {
    return { ...DEFAULT_PREFERENCES, ...data };
  }

  let prefs = await UserDietary.findOne({ userId });
  if (!prefs) {
    prefs = new UserDietary({ userId, ...data });
  } else {
    if (data.activeDietTag !== undefined) prefs.activeDietTag = data.activeDietTag;
    if (data.selectedAllergens !== undefined) prefs.selectedAllergens = data.selectedAllergens;
    if (data.dailyCalorieTarget !== undefined) prefs.dailyCalorieTarget = data.dailyCalorieTarget;
    if (data.dailyProteinTarget !== undefined) prefs.dailyProteinTarget = data.dailyProteinTarget;
    if (data.showMacroBadges !== undefined) prefs.showMacroBadges = data.showMacroBadges;
  }

  await prefs.save();
  return {
    activeDietTag: prefs.activeDietTag,
    selectedAllergens: prefs.selectedAllergens,
    dailyCalorieTarget: prefs.dailyCalorieTarget,
    dailyProteinTarget: prefs.dailyProteinTarget,
    showMacroBadges: prefs.showMacroBadges,
  };
};

module.exports = {
  getUserPreferences,
  saveUserPreferences,
};
