const foodRepository = require('../repositories/foodRepository');

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
    // We can add validation logic here later if needed (e.g. check if category is valid)
    return await foodRepository.create(foodData);
  },

  updateFood: async (id, foodData) => {
    const existingFood = await foodRepository.findById(id);
    if (!existingFood) {
      throw new Error('Food item not found');
    }
    return await foodRepository.update(id, foodData);
  },

  deleteFood: async (id) => {
    const existingFood = await foodRepository.findById(id);
    if (!existingFood) {
      throw new Error('Food item not found');
    }
    return await foodRepository.delete(id);
  }
};

module.exports = foodService;
