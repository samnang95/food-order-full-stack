const foodService = require('../services/foodService');

const getAllFoods = async (req, res) => {
  try {
    // Pass query parameters as filters to the service
    const filters = {
      search: req.query.search,
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      isAvailable: req.query.isAvailable
    };

    const foods = await foodService.getAllFoods(filters);
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFoodById = async (req, res) => {
  try {
    const food = await foodService.getFoodById(req.params.id);
    res.json(food);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createFood = async (req, res) => {
  try {
    const newFood = await foodService.createFood(req.body);
    res.status(201).json({ message: 'Food created successfully', food: newFood });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFood = async (req, res) => {
  try {
    const updatedFood = await foodService.updateFood(req.params.id, req.body);
    res.json({ message: 'Food updated successfully', food: updatedFood });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFood = async (req, res) => {
  try {
    await foodService.deleteFood(req.params.id);
    res.json({ message: 'Food deleted successfully' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
};
