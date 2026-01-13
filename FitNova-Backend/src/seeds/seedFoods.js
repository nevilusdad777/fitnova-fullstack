const Food = require('../models/Food');

const commonFoods = [
  // ==================== NON-VEGETARIAN FOODS ====================
  
  // Poultry - Non-Veg
  {
    name: 'Chicken Breast',
    category: 'protein',
    isVegetarian: false,
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Chicken Thigh',
    category: 'protein',
    isVegetarian: false,
    calories: 209,
    protein: 26,
    carbs: 0,
    fat: 11,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Turkey Breast',
    category: 'protein',
    isVegetarian: false,
    calories: 135,
    protein: 30,
    carbs: 0,
    fat: 0.7,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  
  // Seafood - Non-Veg
  {
    name: 'Salmon',
    category: 'protein',
    isVegetarian: false,
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Tuna',
    category: 'protein',
    isVegetarian: false,
    calories: 130,
    protein: 29,
    carbs: 0,
    fat: 1.3,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Shrimp',
    category: 'protein',
    isVegetarian: false,
    calories: 99,
    protein: 24,
    carbs: 0.2,
    fat: 0.3,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Cod',
    category: 'protein',
    isVegetarian: false,
    calories: 82,
    protein: 18,
    carbs: 0,
    fat: 0.7,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  
  // Red Meat - Non-Veg
  {
    name: 'Lean Beef',
    category: 'protein',
    isVegetarian: false,
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 15,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Lamb',
    category: 'protein',
    isVegetarian: false,
    calories: 294,
    protein: 25,
    carbs: 0,
    fat: 21,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  
  // ==================== VEGETARIAN FOODS ====================
  
  // Eggs & Dairy Protein - Veg
  {
    name: 'Eggs',
    category: 'protein',
    isVegetarian: true,
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Greek Yogurt',
    category: 'dairy',
    isVegetarian: true,
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Paneer',
    category: 'protein',
    isVegetarian: true,
    calories: 265,
    protein: 18,
    carbs: 1.2,
    fat: 20,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Cottage Cheese',
    category: 'dairy',
    isVegetarian: true,
    calories: 98,
    protein: 11,
    carbs: 3.4,
    fat: 4.3,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Milk (Whole)',
    category: 'dairy',
    isVegetarian: true,
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fat: 3.3,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'ml',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Cheese (Cheddar)',
    category: 'dairy',
    isVegetarian: true,
    calories: 403,
    protein: 25,
    carbs: 1.3,
    fat: 33,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  
  // Plant Protein - Veg
  {
    name: 'Tofu',
    category: 'protein',
    isVegetarian: true,
    calories: 76,
    protein: 8,
    carbs: 1.9,
    fat: 4.8,
    fiber: 0.3,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Lentils (Cooked)',
    category: 'protein',
    isVegetarian: true,
    calories: 116,
    protein: 9,
    carbs: 20,
    fat: 0.4,
    fiber: 8,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Chickpeas (Cooked)',
    category: 'protein',
    isVegetarian: true,
    calories: 164,
    protein: 8.9,
    carbs: 27,
    fat: 2.6,
    fiber: 7.6,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Black Beans (Cooked)',
    category: 'protein',
    isVegetarian: true,
    calories: 132,
    protein: 8.9,
    carbs: 24,
    fat: 0.5,
    fiber: 8.7,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Kidney Beans (Cooked)',
    category: 'protein',
    isVegetarian: true,
    calories: 127,
    protein: 8.7,
    carbs: 23,
    fat: 0.5,
    fiber: 6.4,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  
  // Grains & Carbs - Veg
  {
    name: 'Brown Rice (Cooked)',
    category: 'grains',
    isVegetarian: true,
    calories: 112,
    protein: 2.6,
    carbs: 24,
    fat: 0.9,
    fiber: 1.8,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'White Rice (Cooked)',
    category: 'grains',
    isVegetarian: true,
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Quinoa (Cooked)',
    category: 'grains',
    isVegetarian: true,
    calories: 120,
    protein: 4.4,
    carbs: 21,
    fat: 1.9,
    fiber: 2.8,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Oats',
    category: 'grains',
    isVegetarian: true,
    calories: 389,
    protein: 16.9,
    carbs: 66,
    fat: 6.9,
    fiber: 10.6,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Whole Wheat Bread',
    category: 'grains',
    isVegetarian: true,
    calories: 247,
    protein: 13,
    carbs: 41,
    fat: 3.4,
    fiber: 6,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Pasta (Cooked)',
    category: 'grains',
    isVegetarian: true,
    calories: 131,
    protein: 5,
    carbs: 25,
    fat: 1.1,
    fiber: 1.8,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Sweet Potato',
    category: 'carbs',
    isVegetarian: true,
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    fiber: 3,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Potato',
    category: 'carbs',
    isVegetarian: true,
    calories: 77,
    protein: 2,
    carbs: 17,
    fat: 0.1,
    fiber: 2.2,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  
  // Vegetables - Veg
  {
    name: 'Broccoli',
    category: 'vegetables',
    isVegetarian: true,
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Spinach',
    category: 'vegetables',
    isVegetarian: true,
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Kale',
    category: 'vegetables',
    isVegetarian: true,
    calories: 35,
    protein: 2.9,
    carbs: 4.4,
    fat: 1.5,
    fiber: 4.1,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Carrots',
    category: 'vegetables',
    isVegetarian: true,
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    fiber: 2.8,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Tomatoes',
    category: 'vegetables',
    isVegetarian: true,
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Bell Peppers',
    category: 'vegetables',
    isVegetarian: true,
    calories: 31,
    protein: 1,
    carbs: 6,
    fat: 0.3,
    fiber: 2.1,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Cucumber',
    category: 'vegetables',
    isVegetarian: true,
    calories: 16,
    protein: 0.7,
    carbs: 3.6,
    fat: 0.1,
    fiber: 0.5,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Cauliflower',
    category: 'vegetables',
    isVegetarian: true,
    calories: 25,
    protein: 1.9,
    carbs: 5,
    fat: 0.3,
    fiber: 2,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  
  // Fruits - Veg
  {
    name: 'Banana',
    category: 'fruits',
    isVegetarian: true,
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Apple',
    category: 'fruits',
    isVegetarian: true,
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Orange',
    category: 'fruits',
    isVegetarian: true,
    calories: 47,
    protein: 0.9,
    carbs: 12,
    fat: 0.1,
    fiber: 2.4,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Strawberries',
    category: 'fruits',
    isVegetarian: true,
    calories: 32,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3,
    fiber: 2,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Blueberries',
    category: 'fruits',
    isVegetarian: true,
    calories: 57,
    protein: 0.7,
    carbs: 14,
    fat: 0.3,
    fiber: 2.4,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Mango',
    category: 'fruits',
    isVegetarian: true,
    calories: 60,
    protein: 0.8,
    carbs: 15,
    fat: 0.4,
    fiber: 1.6,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Grapes',
    category: 'fruits',
    isVegetarian: true,
    calories: 69,
    protein: 0.7,
    carbs: 18,
    fat: 0.2,
    fiber: 0.9,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  
  // Nuts & Seeds - Veg
  {
    name: 'Almonds',
    category: 'fats',
    isVegetarian: true,
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    fiber: 12.5,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Walnuts',
    category: 'fats',
    isVegetarian: true,
    calories: 654,
    protein: 15,
    carbs: 14,
    fat: 65,
    fiber: 6.7,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Cashews',
    category: 'fats',
    isVegetarian: true,
    calories: 553,
    protein: 18,
    carbs: 30,
    fat: 44,
    fiber: 3.3,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Peanut Butter',
    category: 'fats',
    isVegetarian: true,
    calories: 588,
    protein: 25,
    carbs: 20,
    fat: 50,
    fiber: 6,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Chia Seeds',
    category: 'fats',
    isVegetarian: true,
    calories: 486,
    protein: 17,
    carbs: 42,
    fat: 31,
    fiber: 34,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Avocado',
    category: 'fats',
    isVegetarian: true,
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 15,
    fiber: 6.7,
    servingSize: 100,
    servingUnit: 'g',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Olive Oil',
    category: 'fats',
    isVegetarian: true,
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'ml',
    verified: true,
    apiSource: 'USDA'
  },
  
  // Beverages - Veg
  {
    name: 'Protein Shake',
    category: 'beverages',
    isVegetarian: true,
    calories: 103,
    protein: 20,
    carbs: 3,
    fat: 1.5,
    fiber: 0,
    servingSize: 250,
    servingUnit: 'ml',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Green Tea',
    category: 'beverages',
    isVegetarian: true,
    calories: 1,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    servingSize: 250,
    servingUnit: 'ml',
    verified: true,
    apiSource: 'USDA'
  }
];

async function seedFoods() {
  try {
    // Clear existing foods
    await Food.deleteMany({});
    console.log('Cleared existing foods');

    // Insert new foods
    const result = await Food.insertMany(commonFoods);
    console.log(`\n✅ Successfully seeded ${result.length} foods to database`);
    console.log(`   🥗 Vegetarian foods: ${commonFoods.filter(f => f.isVegetarian).length}`);
    console.log(`   🍗 Non-vegetarian foods: ${commonFoods.filter(f => !f.isVegetarian).length}\n`);
    
    return result;
  } catch (error) {
    console.error('❌ Error seeding foods:', error.message);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config();

  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return seedFoods();
    })
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedFoods;
