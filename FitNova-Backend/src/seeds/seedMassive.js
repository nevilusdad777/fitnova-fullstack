const mongoose = require('mongoose');
const Food = require('../models/Food');

const massiveFoodList = [
  // ==================== PROTEINS ====================
  { name: 'Chicken Breast (Grilled)', category: 'protein', isVegetarian: false, calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Chicken Thigh', category: 'protein', isVegetarian: false, calories: 209, protein: 26, carbs: 0, fat: 11, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Chicken Wings', category: 'protein', isVegetarian: false, calories: 203, protein: 30, carbs: 0, fat: 8, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Turkey Breast', category: 'protein', isVegetarian: false, calories: 135, protein: 30, carbs: 0, fat: 1, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1616486029423-aaa478964c96?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Lean Ground Beef (95%)', category: 'protein', isVegetarian: false, calories: 137, protein: 21, carbs: 0, fat: 5, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Steak (Sirloin)', category: 'protein', isVegetarian: false, calories: 244, protein: 27, carbs: 0, fat: 14, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Salmon', category: 'protein', isVegetarian: false, calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Tuna (Canned)', category: 'protein', isVegetarian: false, calories: 116, protein: 26, carbs: 0, fat: 1, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1534483509839-29b64f06834b?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Shrimp', category: 'protein', isVegetarian: false, calories: 99, protein: 24, carbs: 0.2, fat: 0.3, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Tilapia', category: 'protein', isVegetarian: false, calories: 96, protein: 20, carbs: 0, fat: 1.7, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1522030097621-3e47eb59acbc?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Cod', category: 'protein', isVegetarian: false, calories: 82, protein: 18, carbs: 0, fat: 0.7, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1535914603953-eb896443c5fb?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Egg (Whole)', category: 'protein', isVegetarian: true, calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1587486913075-e6e57b303b30?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Egg Whites', category: 'protein', isVegetarian: true, calories: 52, protein: 11, carbs: 0.7, fat: 0.2, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Tofu (Firm)', category: 'protein', isVegetarian: true, calories: 144, protein: 16, carbs: 3.9, fat: 8, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Paneer', category: 'protein', isVegetarian: true, calories: 265, protein: 18, carbs: 1.2, fat: 20, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1567332717070-5d666497d3f1?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Soya Chunks', category: 'protein', isVegetarian: true, calories: 345, protein: 52, carbs: 33, fat: 0.5, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1610452392476-d9255a805f23?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Lentils (Cooked)', category: 'protein', isVegetarian: true, calories: 116, protein: 9, carbs: 20, fat: 0.4, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1543505298-b8be9b52a21d?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Chickpeas (Cooked)', category: 'protein', isVegetarian: true, calories: 164, protein: 8.9, carbs: 27, fat: 2.6, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Greek Yogurt (0%)', category: 'dairy', isVegetarian: true, calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Cottage Cheese', category: 'dairy', isVegetarian: true, calories: 98, protein: 11, carbs: 3.4, fat: 4.3, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1568285984600-b6c86a869766?auto=format&fit=crop&w=500&q=80', verified: true },

  // ==================== GRAINS & CARBS ====================
  { name: 'Oats (Rolled)', category: 'grains', isVegetarian: true, calories: 389, protein: 16.9, carbs: 66, fat: 6.9, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'White Rice', category: 'grains', isVegetarian: true, calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1536304929831-27dd883f317d?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Brown Rice', category: 'grains', isVegetarian: true, calories: 111, protein: 2.6, carbs: 23, fat: 0.9, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1531182372136-1e6878b6680a?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Quinoa', category: 'grains', isVegetarian: true, calories: 120, protein: 4.4, carbs: 21, fat: 1.9, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1595105268478-d4190c74fb9a?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Sweet Potato', category: 'carbs', isVegetarian: true, calories: 86, protein: 1.6, carbs: 20, fat: 0.1, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1596097635121-14b63b84e429?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Potato (White)', category: 'carbs', isVegetarian: true, calories: 77, protein: 2, carbs: 17, fat: 0.1, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Whole Wheat Bread', category: 'grains', isVegetarian: true, calories: 247, protein: 13, carbs: 41, fat: 3.4, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Pasta (Whole Wheat)', category: 'grains', isVegetarian: true, calories: 124, protein: 5, carbs: 27, fat: 0.5, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=500&q=80', verified: true },
  
  // ==================== FATS ====================
  { name: 'Almonds', category: 'fats', isVegetarian: true, calories: 579, protein: 21, carbs: 22, fat: 49, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1563227812-0ea4c2023d81?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Walnuts', category: 'fats', isVegetarian: true, calories: 654, protein: 15, carbs: 14, fat: 65, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1582845512747-e42001c95638?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Peanut Butter', category: 'fats', isVegetarian: true, calories: 588, protein: 25, carbs: 20, fat: 50, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1574853039708-360341793739?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Avocado', category: 'fats', isVegetarian: true, calories: 160, protein: 2, carbs: 8, fat: 15, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1523049673856-428689c8ae89?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Olive Oil', category: 'fats', isVegetarian: true, calories: 884, protein: 0, carbs: 0, fat: 100, servingSize: 100, servingUnit: 'ml', image: 'https://images.unsplash.com/photo-1474979266404-7caddbed77a8?auto=format&fit=crop&w=500&q=80', verified: true },
  
  // ==================== FRUITS ====================
  { name: 'Banana', category: 'fruits', isVegetarian: true, calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1571771896020-410d02d3303d?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Apple', category: 'fruits', isVegetarian: true, calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Blueberries', category: 'fruits', isVegetarian: true, calories: 57, protein: 0.7, carbs: 14, fat: 0.3, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=500&q=80', verified: true },
  
  // ==================== VEGETABLES ====================
  { name: 'Broccoli', category: 'vegetables', isVegetarian: true, calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Spinach', category: 'vegetables', isVegetarian: true, calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80', verified: true },
  { name: 'Carrots', category: 'vegetables', isVegetarian: true, calories: 41, protein: 0.9, carbs: 10, fat: 0.2, servingSize: 100, servingUnit: 'g', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=500&q=80', verified: true }
];

async function seedMassive() {
  try {
    await Food.deleteMany({});
    console.log('Cleared existing foods');
    
    // Add variations programmatically to reach ~150 foods
    // e.g. "Grilled Chicken" vs "Boiled Chicken"
    // For now we insert the base list
    
    const result = await Food.insertMany(massiveFoodList);
    console.log(`\n✅ Successfully seeded ${result.length} MASSIVE FOOD LIST to database`);
    
    return result;
  } catch (error) {
    console.error('❌ Error seeding foods:', error.message);
    throw error;
  }
}

if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config();

  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return seedMassive();
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

module.exports = seedMassive;
