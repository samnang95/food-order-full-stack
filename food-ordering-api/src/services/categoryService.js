const categoryRepository = require('../repositories/categoryRepository');
const foodRepository = require('../repositories/foodRepository');

const categoryService = {
  getAllCategories: async () => {
    return await categoryRepository.findAll();
  },

  getCategoryById: async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  },

  createCategory: async (categoryData) => {
    const existingCategory = await categoryRepository.findByName(categoryData.name);
    if (existingCategory) {
      throw new Error('Category name already exists');
    }
    return await categoryRepository.create(categoryData);
  },

  updateCategory: async (id, categoryData) => {
    const existingCategory = await categoryRepository.findById(id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }

    if (categoryData.name && categoryData.name !== existingCategory.name) {
      const nameInUse = await categoryRepository.findByName(categoryData.name);
      if (nameInUse) {
        throw new Error('Category name already in use');
      }
    }

    return await categoryRepository.update(id, categoryData);
  },

  deleteCategory: async (id) => {
    const existingCategory = await categoryRepository.findById(id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Also verify if there are any foods tied to this category
    const foodsInCategory = await foodRepository.findAll({ category: id });
    if (foodsInCategory && foodsInCategory.length > 0) {
      throw new Error(`Cannot delete category because it contains ${foodsInCategory.length} food items. Delete or reassign the food items first.`);
    }

    return await categoryRepository.delete(id);
  },

  getFoodsByCategory: async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return await foodRepository.findAll({ category: id });
  }
};

module.exports = categoryService;
