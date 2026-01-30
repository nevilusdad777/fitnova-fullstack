const mongoose = require('mongoose');
const Food = require('../models/Food');

const gymFitnessFoods = [
  // ==================== HIGH PROTEIN (MEAT & FISH) ====================
  {
    name: 'Grilled Chicken Breast',
    category: 'protein',
    isVegetarian: false,
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Salmon Fillet',
    category: 'protein',
    isVegetarian: false,
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Lean Ground Beef (95%)',
    category: 'protein',
    isVegetarian: false,
    calories: 137,
    protein: 21.4,
    carbs: 0,
    fat: 5,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Tuna Steak',
    category: 'protein',
    isVegetarian: false,
    calories: 132,
    protein: 28,
    carbs: 0,
    fat: 1,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=500&q=80',
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
    fat: 1,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1606850821245-207d722de198?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Shrimp (Cooked)',
    category: 'protein',
    isVegetarian: false,
    calories: 99,
    protein: 24,
    carbs: 0.2,
    fat: 0.3,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Tilapia',
    category: 'protein',
    isVegetarian: false,
    calories: 96,
    protein: 20,
    carbs: 0,
    fat: 1.7,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80', // generic fish
    verified: true,
    apiSource: 'USDA'
  },

  // ==================== HIGH PROTEIN (VEGETARIAN) ====================
  {
    name: 'Paneer (Cottage Cheese)',
    category: 'protein',
    isVegetarian: true,
    calories: 265,
    protein: 18,
    carbs: 1.2,
    fat: 20,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Tofu (Extra Firm)',
    category: 'protein',
    isVegetarian: true,
    calories: 145,
    protein: 16,
    carbs: 4,
    fat: 8,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Soya Chunks',
    category: 'protein',
    isVegetarian: true,
    calories: 345,
    protein: 52,
    carbs: 33,
    fat: 0.5,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=500&q=80', // placeholder-ish
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Greek Yogurt (0% Fat)',
    category: 'dairy',
    isVegetarian: true,
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Egg White',
    category: 'protein',
    isVegetarian: true,
    calories: 52,
    protein: 11,
    carbs: 0.7,
    fat: 0.2,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Whole Large Egg',
    category: 'protein',
    isVegetarian: true,
    calories: 72,
    protein: 6,
    carbs: 0.4,
    fat: 5,
    servingSize: 1,
    servingUnit: 'piece',
    image: 'https://images.unsplash.com/photo-1587486913075-e6e57b303b30?auto=format&fit=crop&w=500&q=80',
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
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1543505298-b8be9b52a21d?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Chickpeas (Boiled)',
    category: 'protein',
    isVegetarian: true,
    calories: 164,
    protein: 9,
    carbs: 27,
    fat: 2.6,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },

  // ==================== QUALITY CARBS ====================
  {
    name: 'Rolled Oats',
    category: 'grains',
    isVegetarian: true,
    calories: 389,
    protein: 13,
    carbs: 66,
    fat: 7,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&w=500&q=80',
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
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1596097635121-14b63b84e429?auto=format&fit=crop&w=500&q=80',
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
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1595105268478-d4190c74fb9a?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Brown Rice',
    category: 'grains',
    isVegetarian: true,
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Basmati Rice (White)',
    category: 'grains',
    isVegetarian: true,
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1536304929831-27dd883f317d?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Whole Wheat Pasta',
    category: 'grains',
    isVegetarian: true,
    calories: 124,
    protein: 5.3,
    carbs: 27,
    fat: 0.5,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Multigrain Bread',
    category: 'grains',
    isVegetarian: true,
    calories: 250,
    protein: 13,
    carbs: 45,
    fat: 4,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },

  // ==================== HEALTHY FATS ====================
  {
    name: 'Avocado',
    category: 'fats',
    isVegetarian: true,
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1523049673856-428689c8ae89?auto=format&fit=crop&w=500&q=80',
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
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1574853039708-360341793739?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Almonds',
    category: 'fats',
    isVegetarian: true,
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da98e604f1?auto=format&fit=crop&w=500&q=80',
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
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1582845512747-e42001c95638?auto=format&fit=crop&w=500&q=80',
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
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1500669299738-f99a34bc65bc?auto=format&fit=crop&w=500&q=80',
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
    servingSize: 100,
    servingUnit: 'ml',
    image: 'https://images.unsplash.com/photo-1474979266404-7caddbed77a8?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },

  // ==================== FRUITS & VEG ====================
  {
    name: 'Banana',
    category: 'fruits',
    isVegetarian: true,
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&w=500&q=80',
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
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=500&q=80',
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
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Broccoli',
    category: 'vegetables',
    isVegetarian: true,
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1583663848850-46af132dc08e?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Spinach (Raw)',
    category: 'vegetables',
    isVegetarian: true,
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'USDA'
  },
  {
    name: 'Mixed Salad',
    category: 'vegetables',
    isVegetarian: true,
    calories: 20,
    protein: 1.5,
    carbs: 4,
    fat: 0.2,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'manual'
  },

  // ==================== GYM MEALS & SUPPLEMENTS ====================
  {
    name: 'Whey Protein Scoop',
    category: 'beverages',
    isVegetarian: true,
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1.5,
    servingSize: 30, // 1 scoop
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Pre-Workout Snack (Apple + Peanut Butter)',
    category: 'snacks',
    isVegetarian: true,
    calories: 250,
    protein: 8,
    carbs: 25,
    fat: 16,
    servingSize: 1,
    servingUnit: 'piece',
    image: 'https://images.unsplash.com/photo-1558229986-e758da430638?auto=format&fit=crop&w=500&q=80', // generic PB toast/snack
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Chicken Rice Bowl',
    category: 'protein',
    isVegetarian: false,
    calories: 450,
    protein: 40,
    carbs: 50,
    fat: 10,
    servingSize: 1,
    servingUnit: 'cup',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Oatmeal with Berries',
    category: 'grains',
    isVegetarian: true,
    calories: 300,
    protein: 10,
    carbs: 55,
    fat: 6,
    servingSize: 1,
    servingUnit: 'cup',
    image: 'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'manual'
  },
  {
    name: 'Protein Smoothie',
    category: 'beverages',
    isVegetarian: true,
    calories: 200,
    protein: 25,
    carbs: 20,
    fat: 2,
    servingSize: 300,
    servingUnit: 'ml',
    image: 'https://images.unsplash.com/photo-1627464082874-722a7f5370d7?auto=format&fit=crop&w=500&q=80',
    verified: true,
    apiSource: 'manual'
  }
];

async function seedGymFreak() {
  try {
    // Clear existing foods
    await Food.deleteMany({});
    console.log('Cleared existing foods');

    // Insert new foods
    const result = await Food.insertMany(gymFitnessFoods);
    console.log(`\n✅ Successfully seeded ${result.length} GYM-FOCUSED foods to database`);
    console.log(`   🥗 Vegetarian foods: ${gymFitnessFoods.filter(f => f.isVegetarian).length}`);
    console.log(`   🍗 Non-vegetarian foods: ${gymFitnessFoods.filter(f => !f.isVegetarian).length}\n`);
    
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
      return seedGymFreak();
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

module.exports = seedGymFreak;
