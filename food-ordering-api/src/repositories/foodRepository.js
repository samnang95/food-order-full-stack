const Food = require('../models/foodModel');

const foodRepository = {
  findAll: async (filters) => {
    // We will build a MongoDB query object based on the filters provided
    const query = {};

    // 1. Search by name (case-insensitive regex)
    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }

    // 2. Filter by category
    if (filters.category) {
      query.category = filters.category;
    }

    // 3. Filter by price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice !== undefined) query.price.$lte = Number(filters.maxPrice);
    }

    // 4. Filter by availability (convert string 'true'/'false' to boolean)
    if (filters.isAvailable !== undefined) {
      query.isAvailable = filters.isAvailable === 'true' || filters.isAvailable === true;
    }

    // Execute query and optionally sort (e.g., newest first or by price)
    return await Food.find(query)
      .populate('category', 'name imageUrl')
      .sort({ createdAt: -1 });
  },

  findById: async (id) => {
    return await Food.findById(id).populate('category', 'name imageUrl');
  },

  create: async (foodData) => {
    const newFood = new Food(foodData);
    await newFood.save();
    return newFood;
  },

  update: async (id, foodData) => {
    return await Food.findByIdAndUpdate(
      id,
      { $set: foodData },
      { new: true, runValidators: true }
    );
  },

  delete: async (id) => {
    return await Food.findByIdAndDelete(id);
  }
};

module.exports = foodRepository;
