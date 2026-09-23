require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db/database');
const Category = require('./models/categoryModel');
const Food = require('./models/foodModel');

const categories = [
  {
    name: 'Burgers',
    description: 'Juicy beef, chicken, and veggie burgers',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  },
  {
    name: 'Pizza',
    description: 'Authentic wood-fired and classic pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  },
  {
    name: 'Asian Cuisine',
    description: 'Ramen, sushi, stir-fry and more',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
  },
  {
    name: 'Healthy Bowls',
    description: 'Fresh salads, grain bowls, and smoothie bowls',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  },
  {
    name: 'Desserts',
    description: 'Cakes, ice cream, pastries and sweets',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
  },
  {
    name: 'Beverages',
    description: 'Coffee, smoothies, juices and more',
    imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
  },
  {
    name: 'Seafood',
    description: 'Fresh fish, shrimp, and shellfish dishes',
    imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400',
  },
  {
    name: 'Bakery',
    description: 'Freshly baked bread, croissants, and pastries',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
  },
];

const foodsByCategory = {
  'Burgers': [
    { name: 'Classic Smash Burger', description: 'Double smashed patty with melted cheddar, pickles, and special sauce', price: 12.99, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
    { name: 'BBQ Bacon Burger', description: 'Angus beef with crispy bacon, onion rings, and smoky BBQ sauce', price: 14.50, imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400' },
    { name: 'Mushroom Swiss Burger', description: 'Sautéed mushrooms and melted Swiss cheese on a brioche bun', price: 13.99, imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400' },
  ],
  'Pizza': [
    { name: 'Margherita Pizza', description: 'San Marzano tomatoes, fresh mozzarella, basil, and olive oil', price: 14.50, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
    { name: 'Pepperoni Supreme', description: 'Loaded with pepperoni, mozzarella, and a touch of chili flakes', price: 16.00, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
    { name: 'Truffle Mushroom Pizza', description: 'Wild mushrooms, truffle oil, fontina cheese, and fresh thyme', price: 18.99, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
  ],
  'Asian Cuisine': [
    { name: 'Spicy Tuna Roll', description: 'Fresh tuna with spicy mayo, cucumber, and avocado', price: 18.00, imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400' },
    { name: 'Tonkotsu Ramen', description: 'Rich pork bone broth with chashu, soft egg, and nori', price: 16.50, imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
    { name: 'Pad Thai', description: 'Stir-fried rice noodles with shrimp, peanuts, and tamarind sauce', price: 15.00, imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400' },
  ],
  'Healthy Bowls': [
    { name: 'Açaí Power Bowl', description: 'Blended açaí with granola, banana, berries, and honey drizzle', price: 13.50, imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400' },
    { name: 'Quinoa Buddha Bowl', description: 'Roasted veggies, chickpeas, quinoa, tahini dressing', price: 14.00, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
  ],
  'Desserts': [
    { name: 'Chocolate Lava Cake', description: 'Warm molten chocolate cake with vanilla ice cream', price: 9.99, imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400' },
    { name: 'Tiramisu', description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone', price: 8.50, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400' },
    { name: 'Mango Sticky Rice', description: 'Sweet coconut sticky rice with fresh mango slices', price: 7.99, imageUrl: 'https://images.unsplash.com/photo-1621293954908-907159247fc8?w=400' },
  ],
  'Beverages': [
    { name: 'Iced Matcha Latte', description: 'Premium matcha whisked with oat milk over ice', price: 5.50, imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400' },
    { name: 'Tropical Smoothie', description: 'Mango, pineapple, coconut milk, and a splash of lime', price: 6.99, imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84571?w=400' },
  ],
  'Seafood': [
    { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon-dill sauce and roasted asparagus', price: 22.00, imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400' },
    { name: 'Garlic Butter Shrimp', description: 'Pan-seared shrimp in garlic butter with crusty bread', price: 19.50, imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400' },
  ],
  'Bakery': [
    { name: 'Butter Croissant', description: 'Flaky, golden, and loaded with French butter', price: 4.50, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400' },
    { name: 'Sourdough Bread', description: 'Artisan sourdough with a crispy crust and tangy flavor', price: 6.00, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
  ],
};

async function seed() {
  try {
    await connectDB();
    console.log('🌱 Starting seed...\n');

    // Clear existing data
    await Food.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories and foods\n');

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Build a map of category name → ObjectId
    const categoryMap = {};
    for (const cat of createdCategories) {
      categoryMap[cat.name] = cat._id;
    }

    // Insert foods
    const allFoods = [];
    for (const [categoryName, foods] of Object.entries(foodsByCategory)) {
      for (const food of foods) {
        allFoods.push({
          ...food,
          category: categoryMap[categoryName],
          isAvailable: true,
        });
      }
    }

    const createdFoods = await Food.insertMany(allFoods);
    console.log(`✅ Created ${createdFoods.length} food items\n`);

    // Summary
    console.log('📋 Summary:');
    for (const cat of createdCategories) {
      const count = allFoods.filter(f => f.category.equals(cat._id)).length;
      console.log(`   ${cat.name}: ${count} items`);
    }

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
