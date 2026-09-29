const mongoose = require('mongoose');

const userFavoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  foodIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
  }],
}, { timestamps: true });

module.exports = mongoose.model('UserFavorite', userFavoriteSchema);
