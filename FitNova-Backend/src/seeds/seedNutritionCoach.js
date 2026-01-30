const mongoose = require('mongoose');
const Food = require('../models/Food');

const nutritionCoachFoods = [
  // ==================== BREAKFAST & GRAINS ====================
  {
    name: 'Oatmeal Bowl',
    category: 'grains',
    isVegetarian: true,
    calories: 158,
    protein: 6,
    carbs: 27,
    fat: 3,
    fiber: 4,
    servingSize: 1,
    servingUnit: 'cup',
    image: 'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Muesli with Milk',
    category: 'grains',
    isVegetarian: true,
    calories: 290,
    protein: 11,
    carbs: 45,
    fat: 6,
    fiber: 6,
    servingSize: 1,
    servingUnit: 'cup',
    image: 'https://images.unsplash.com/photo-1590483259885-3ba5775f0a1c?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Avocado Toast',
    category: 'grains',
    isVegetarian: true,
    calories: 250,
    protein: 6,
    carbs: 25,
    fat: 14,
    fiber: 7,
    servingSize: 1,
    servingUnit: 'piece',
    image: 'https://images.unsplash.com/photo-1588137372308-15f75323ca8d?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Quinoa Bowl',
    category: 'grains',
    isVegetarian: true,
    calories: 222,
    protein: 8,
    carbs: 39,
    fat: 4,
    fiber: 5,
    servingSize: 1,
    servingUnit: 'cup',
    image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },

  // ==================== MEALS & SNACKS ====================
  {
    name: 'Paneer Sandwich',
    category: 'snacks',
    isVegetarian: true,
    calories: 320,
    protein: 14,
    carbs: 35,
    fat: 14,
    fiber: 4,
    servingSize: 1,
    servingUnit: 'piece',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Grilled Chicken Salad',
    category: 'protein',
    isVegetarian: false,
    calories: 350,
    protein: 35,
    carbs: 12,
    fat: 18,
    fiber: 5,
    servingSize: 1,
    servingUnit: 'cup',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Hummus & Veggie Platter',
    category: 'snacks',
    isVegetarian: true,
    calories: 250,
    protein: 8,
    carbs: 28,
    fat: 14,
    fiber: 8,
    servingSize: 1,
    servingUnit: 'piece',
    image: 'https://images.unsplash.com/photo-1627909384784-add53556de54?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Greek Yogurt Parfait',
    category: 'dairy',
    isVegetarian: true,
    calories: 220,
    protein: 15,
    carbs: 30,
    fat: 4,
    fiber: 3,
    servingSize: 1,
    servingUnit: 'cup',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },

  // ==================== PROTEINS ====================
  {
    name: 'Grilled Salmon',
    category: 'protein',
    isVegetarian: false,
    calories: 360,
    protein: 40,
    carbs: 0,
    fat: 20,
    fiber: 0,
    servingSize: 150,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Tofu Stir Fry',
    category: 'protein',
    isVegetarian: true,
    calories: 280,
    protein: 22,
    carbs: 18,
    fat: 14,
    fiber: 4,
    servingSize: 1,
    servingUnit: 'cup',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Chickpea Curry (Chana)',
    category: 'protein',
    isVegetarian: true,
    calories: 290,
    protein: 12,
    carbs: 42,
    fat: 8,
    fiber: 10,
    servingSize: 1,
    servingUnit: 'cup',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Egg White Omelet',
    category: 'protein',
    isVegetarian: true,
    calories: 120,
    protein: 24,
    carbs: 2,
    fat: 1,
    fiber: 0,
    servingSize: 1,
    servingUnit: 'piece',
    image: 'https://images.unsplash.com/photo-1596395914104-58bc4499d305?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },

  // ==================== FRUITS & VEG ====================
  {
    name: 'Mixed Berries',
    category: 'fruits',
    isVegetarian: true,
    calories: 60,
    protein: 1,
    carbs: 14,
    fat: 0,
    fiber: 3,
    servingSize: 1,
    servingUnit: 'cup',
    image: 'https://images.unsplash.com/photo-1579715569428-f6ff47285513?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Banana',
    category: 'fruits',
    isVegetarian: true,
    calories: 105,
    protein: 1,
    carbs: 27,
    fat: 0,
    fiber: 3,
    servingSize: 1,
    servingUnit: 'piece',
    image: 'https://images.unsplash.com/photo-1571771896020-410d02d3303d?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Green Smoothie',
    category: 'beverages',
    isVegetarian: true,
    calories: 180,
    protein: 4,
    carbs: 35,
    fat: 2,
    fiber: 6,
    servingSize: 1,
    servingUnit: 'cup',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
   {
    name: 'Sweet Potato',
    category: 'vegetables',
    isVegetarian: true,
    calories: 112,
    protein: 2,
    carbs: 26,
    fat: 0,
    fiber: 4,
    servingSize: 130, // medium
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1596097635121-14b63b84e429?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  
  // ==================== DAIRY & FATS ====================
  {
    name: 'Cottage Cheese',
    category: 'dairy',
    isVegetarian: true,
    calories: 180,
    protein: 24,
    carbs: 8,
    fat: 5,
    servingSize: 1,
    servingUnit: 'cup',
    image: 'https://images.unsplash.com/photo-1568285984600-b6c86a869766?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Almonds',
    category: 'fats',
    isVegetarian: true,
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    fiber: 3,
    servingSize: 28, // oz
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da98e604f1?auto=format&fit=crop&w=400',
    verified: true,
    apiSource: 'manual'
  }
];

async function seedNutrition() {
  try {
    // Clear existing foods
    await Food.deleteMany({});
    console.log('Cleared existing foods');

    // Insert new foods
    const result = await Food.insertMany(nutritionCoachFoods);
    console.log(`\n✅ Successfully seeded ${result.length} healthy foods to database`);
    console.log(`   🥗 Vegetarian foods: ${nutritionCoachFoods.filter(f => f.isVegetarian).length}`);
    console.log(`   🍗 Non-vegetarian foods: ${nutritionCoachFoods.filter(f => !f.isVegetarian).length}\n`);
    
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
      return seedNutrition();
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

module.exports = seedNutrition;
