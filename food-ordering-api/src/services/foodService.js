const foodRepository = require('../repositories/foodRepository');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');
const { getIO } = require('../socket/socketManager');

const resolveCategoryId = async (cat) => {
  if (!cat) {
    const defaultCat = await Category.findOne();
    return defaultCat ? defaultCat._id : null;
  }
  if (mongoose.Types.ObjectId.isValid(cat)) {
    return cat;
  }
  let found = await Category.findOne({ name: new RegExp(`^${cat}$`, 'i') });
  if (!found) {
    found = await Category.create({
      name: cat,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    });
  }
  return found._id;
};

const foodService = {
  getAllFoods: async (filters) => {
    return await foodRepository.findAll(filters);
  },

  getFoodById: async (id) => {
    const food = await foodRepository.findById(id);
    if (!food) {
      throw new Error('Food item not found');
    }
    return food;
  },

  createFood: async (foodData) => {
    if (foodData.category) {
      foodData.category = await resolveCategoryId(foodData.category);
    }
    const created = await foodRepository.create(foodData);
    try {
      const io = getIO();
      io.emit('food:created', created);
      io.emit('menu:updated');
    } catch (_) {}
    return created;
  },

  updateFood: async (id, foodData) => {
    const existingFood = await foodRepository.findById(id);
    if (!existingFood) {
      throw new Error('Food item not found');
    }
    if (foodData.category) {
      foodData.category = await resolveCategoryId(foodData.category);
    }
    const updated = await foodRepository.update(id, foodData);
    try {
      const io = getIO();
      io.emit('food:updated', updated);
      io.emit('menu:updated');
    } catch (_) {}
    return updated;
  },

  deleteFood: async (id) => {
    const existingFood = await foodRepository.findById(id);
    if (!existingFood) {
      throw new Error('Food item not found');
    }
    const deleted = await foodRepository.delete(id);
    try {
      const io = getIO();
      io.emit('food:deleted', { id });
      io.emit('menu:updated');
    } catch (_) {}
    return deleted;
  }
};

module.exports = foodService;
