const mongoose = require('mongoose');

const userDietarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  activeDietTag: {
    type: String,
    default: 'all',
  },
  selectedAllergens: [{
    type: String,
  }],
  dailyCalorieTarget: {
    type: Number,
    default: 2200,
  },
  dailyProteinTarget: {
    type: Number,
    default: 90,
  },
  showMacroBadges: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('UserDietary', userDietarySchema);
