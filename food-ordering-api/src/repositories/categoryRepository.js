const Category = require('../models/categoryModel');

const categoryRepository = {
  findAll: async () => {
    return await Category.find().sort({ createdAt: -1 });
  },

  findById: async (id) => {
    return await Category.findById(id);
  },

  findByName: async (name) => {
    return await Category.findOne({ name });
  },

  create: async (categoryData) => {
    const newCategory = new Category(categoryData);
    await newCategory.save();
    return newCategory;
  },

  update: async (id, categoryData) => {
    return await Category.findByIdAndUpdate(
      id,
      { $set: categoryData },
      { new: true, runValidators: true }
    );
  },

  delete: async (id) => {
    return await Category.findByIdAndDelete(id);
  }
};

module.exports = categoryRepository;
