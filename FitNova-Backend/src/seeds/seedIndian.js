const mongoose = require('mongoose');
require('dotenv').config();
const Food = require('../models/Food');
const { searchFood } = require('../services/openFoodFactsService');

// ==========================================
// 🇮🇳 CURATED INDIAN FITNESS DATABASE 🇮🇳
// ==========================================
// trusted macros reference: USDA, NIN (National Institute of Nutrition, India), and common fitness apps (MyFitnessPal est.)

const INDIAN_DIET_DATA = [
    // ================= STAPLES (ROTI/RICE) =================
    { name: 'Roti (Whole Wheat)', query: 'chapati', category: 'grains', calories: 104, protein: 3, carbs: 22, fat: 0.5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
    { name: 'Multigrain Roti', query: 'multigrain roti', category: 'grains', calories: 120, protein: 4, carbs: 24, fat: 1, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
    { name: 'Bajra Roti', query: 'bajra roti', category: 'grains', calories: 140, protein: 4, carbs: 28, fat: 2, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
    { name: 'Naan (Butter)', query: 'butter naan', category: 'grains', calories: 260, protein: 8, carbs: 45, fat: 5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
    { name: 'Plain Rice (Cooked)', query: 'basmati rice cooked', category: 'grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Brown Rice (Cooked)', query: 'brown rice cooked', category: 'grains', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Jeera Rice', query: 'jeera rice', category: 'grains', calories: 150, protein: 3, carbs: 30, fat: 2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Khichdi', query: 'khichdi', category: 'grains', calories: 120, protein: 4, carbs: 22, fat: 2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Poha', query: 'poha', category: 'grains', calories: 180, protein: 3, carbs: 35, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Upma', query: 'upma', category: 'grains', calories: 190, protein: 4, carbs: 32, fat: 6, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Dosa (Plain)', query: 'dosa', category: 'grains', calories: 133, protein: 4, carbs: 27, fat: 3, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
    { name: 'Masala Dosa', query: 'masala dosa', category: 'grains', calories: 350, protein: 6, carbs: 55, fat: 12, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
    { name: 'Idli', query: 'idli', category: 'grains', calories: 58, protein: 2, carbs: 12, fat: 0.2, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
    { name: 'Oats (Masala)', query: 'masala oats', category: 'grains', calories: 150, protein: 5, carbs: 25, fat: 3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Paratha (Aloo)', query: 'aloo paratha', category: 'grains', calories: 290, protein: 6, carbs: 45, fat: 10, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
    { name: 'Paratha (Paneer)', query: 'paneer paratha', category: 'grains', calories: 320, protein: 12, carbs: 38, fat: 14, servingSize: 1, servingUnit: 'piece', isVegetarian: true },

    // ================= DAL & LEGUMES =================
    { name: 'Dal Tadka (Yellow)', query: 'dal tadka', category: 'protein', calories: 140, protein: 7, carbs: 18, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Dal Makhani', query: 'dal makhani', category: 'protein', calories: 280, protein: 9, carbs: 25, fat: 16, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Moong Dal (Boiled)', query: 'moong dal', category: 'protein', calories: 105, protein: 8, carbs: 18, fat: 0.5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Chana Masala', query: 'chana masala', category: 'protein', calories: 160, protein: 7, carbs: 25, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Rajma', query: 'rajma kidney beans', category: 'protein', calories: 140, protein: 8, carbs: 22, fat: 4, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Sambar', query: 'sambar', category: 'vegetables', calories: 90, protein: 3, carbs: 15, fat: 2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Sprouts (Moong)', query: 'moong sprouts', category: 'protein', calories: 30, protein: 3, carbs: 6, fat: 0.2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Soya Chunks Curry', query: 'soya chunks', category: 'protein', calories: 200, protein: 20, carbs: 15, fat: 8, servingSize: 100, servingUnit: 'g', isVegetarian: true },

    // ================= VEGETABLES / SABZI =================
    { name: 'Palak Paneer', query: 'palak paneer', category: 'vegetables', calories: 240, protein: 10, carbs: 12, fat: 18, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Bhindi Masala', query: 'okra masala', category: 'vegetables', calories: 90, protein: 3, carbs: 10, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Aloo Gobi', query: 'aloo gobi', category: 'vegetables', calories: 120, protein: 3, carbs: 18, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Mix Veg', query: 'mixed vegetable curry', category: 'vegetables', calories: 110, protein: 3, carbs: 14, fat: 5, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Baingan Bharta', query: 'baingan bharta', category: 'vegetables', calories: 90, protein: 2, carbs: 12, fat: 4, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Matar Paneer', query: 'matar paneer', category: 'vegetables', calories: 220, protein: 9, carbs: 15, fat: 14, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Cucumber Salad', query: 'cucumber slices', category: 'vegetables', calories: 15, protein: 1, carbs: 3, fat: 0, servingSize: 100, servingUnit: 'g', isVegetarian: true },

    // ================= PROTEIN (NON-VEG) =================
    { name: 'Chicken Curry (Indian)', query: 'chicken curry', category: 'protein', calories: 180, protein: 18, carbs: 6, fat: 10, servingSize: 100, servingUnit: 'g', isVegetarian: false },
    { name: 'Butter Chicken', query: 'butter chicken', category: 'protein', calories: 350, protein: 20, carbs: 12, fat: 25, servingSize: 100, servingUnit: 'g', isVegetarian: false },
    { name: 'Tandoori Chicken', query: 'tandoori chicken', category: 'protein', calories: 220, protein: 25, carbs: 4, fat: 10, servingSize: 100, servingUnit: 'g', isVegetarian: false },
    { name: 'Chicken Tikka', query: 'chicken tikka', category: 'protein', calories: 200, protein: 24, carbs: 5, fat: 8, servingSize: 100, servingUnit: 'g', isVegetarian: false },
    { name: 'Egg Bhurji', query: 'scrambled egg indian', category: 'protein', calories: 160, protein: 11, carbs: 3, fat: 12, servingSize: 2, servingUnit: 'eggs', isVegetarian: false },
    { name: 'Boiled Egg', query: 'boiled egg', category: 'protein', calories: 70, protein: 6, carbs: 0.6, fat: 5, servingSize: 1, servingUnit: 'piece', isVegetarian: false },
    { name: 'Omelette (2 Eggs)', query: 'omelette', category: 'protein', calories: 154, protein: 12, carbs: 1, fat: 11, servingSize: 1, servingUnit: 'piece', isVegetarian: false },
    { name: 'Fish Fry', query: 'fish fry', category: 'protein', calories: 210, protein: 20, carbs: 8, fat: 12, servingSize: 100, servingUnit: 'g', isVegetarian: false },
    { name: 'Fish Curry', query: 'fish curry', category: 'protein', calories: 160, protein: 18, carbs: 6, fat: 7, servingSize: 100, servingUnit: 'g', isVegetarian: false },
    { name: 'Mutton Curry', query: 'mutton curry', category: 'protein', calories: 240, protein: 20, carbs: 5, fat: 16, servingSize: 100, servingUnit: 'g', isVegetarian: false },
    { name: 'Chicken Biryani', query: 'chicken biryani', category: 'grains', calories: 200, protein: 10, carbs: 25, fat: 8, servingSize: 100, servingUnit: 'g', isVegetarian: false },

    // ================= DAIRY & PANEER =================
    { name: 'Paneer (Raw)', query: 'paneer block', category: 'protein', calories: 265, protein: 18, carbs: 1, fat: 20, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Paneer Tikka', query: 'paneer tikka', category: 'protein', calories: 250, protein: 16, carbs: 8, fat: 18, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Curd (Dahi)', query: 'plain yogurt', category: 'dairy', calories: 60, protein: 3, carbs: 4, fat: 3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Greek Yogurt', query: 'greek yogurt', category: 'dairy', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Milk (Cow)', query: 'cow milk', category: 'dairy', calories: 60, protein: 3, carbs: 5, fat: 3, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
    { name: 'Milk (Buffalo)', query: 'buffalo milk', category: 'dairy', calories: 97, protein: 3.7, carbs: 5, fat: 6.5, servingSize: 100, servingUnit: 'ml', isVegetarian: true },
    { name: 'Lassi (Sweet)', query: 'lassi', category: 'beverages', calories: 150, protein: 4, carbs: 25, fat: 5, servingSize: 200, servingUnit: 'ml', isVegetarian: true },
    { name: 'Chaas (Buttermilk)', query: 'buttermilk', category: 'beverages', calories: 30, protein: 2, carbs: 3, fat: 1, servingSize: 200, servingUnit: 'ml', isVegetarian: true },
    { name: 'Ghee', query: 'ghee', category: 'fats', calories: 900, protein: 0, carbs: 0, fat: 100, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Amul Butter', query: 'amul butter', category: 'fats', calories: 717, protein: 0.8, carbs: 0, fat: 81, servingSize: 100, servingUnit: 'g', isVegetarian: true },

    // ================= FITNESS BASICS (International Light) =================
    { name: 'Oats (Plain)', query: 'rolled oats', category: 'grains', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Peanut Butter', query: 'peanut butter', category: 'fats', calories: 588, protein: 25, carbs: 20, fat: 50, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Almonds', query: 'almonds', category: 'fats', calories: 579, protein: 21, carbs: 22, fat: 50, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Walnuts', query: 'walnuts', category: 'fats', calories: 654, protein: 15, carbs: 14, fat: 65, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Apple', query: 'red apple', category: 'fruits', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Banana', query: 'banana', category: 'fruits', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Papaya', query: 'papaya', category: 'fruits', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Watermelon', query: 'watermelon', category: 'fruits', calories: 30, protein: 0.6, carbs: 8, fat: 0.2, servingSize: 100, servingUnit: 'g', isVegetarian: true },
    { name: 'Whey Protein Scoop', query: 'whey protein powder', category: 'protein', calories: 120, protein: 24, carbs: 3, fat: 1.5, servingSize: 1, servingUnit: 'scoop', isVegetarian: true },
    { name: 'Multivitamin', query: 'multivitamin pill', category: 'snacks', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: 1, servingUnit: 'tablet', isVegetarian: true },
    { name: 'Green Tea', query: 'green tea cup', category: 'beverages', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: 1, servingUnit: 'cup', isVegetarian: true },
    { name: 'Black Coffee', query: 'black coffee', category: 'beverages', calories: 2, protein: 0, carbs: 0, fat: 0, servingSize: 1, servingUnit: 'cup', isVegetarian: true },
];

async function seedIndian() {
    console.log('🇮🇳 Starting Curated Indian & Fitness Food Seeding...');
    
    // Clear old data
    await Food.deleteMany({});
    console.log('🗑️  Cleared existing food database.');

    let count = 0;

    for (const item of INDIAN_DIET_DATA) {
        console.log(`Processing "${item.name}"...`);
        
        try {
            console.log(`   > Searching API for "${item.query}"...`);
            let imageUrl = null;
            // Use specific query for better images
            const results = await searchFood(item.query, 5); 
            console.log(`   > Found ${results.length} results.`);
            
            // Find first valid image
            for (const res of results) {
                if (res.image_url || res.image_front_url) {
                    imageUrl = res.image_front_url || res.image_url;
                    console.log(`   > Selected Image: ${imageUrl.substring(0, 50)}...`);
                    break;
                }
            }

            if (!imageUrl) {
                 console.log('   > No image found. Using placeholder logic (null).');
            }

            // Create object
            console.log('   > Saving to DB...');
            const newItem = await Food.create({
                ...item,
                image: imageUrl,
                verified: true,
                apiSource: 'Curated (Indian)',
                apiId: `IN_${count}` // Custom ID
            });
            
            console.log(`   > ✅ Saved ID: ${newItem._id}`);
            count++;

            // Tiny delay to be polite
            await new Promise(r => setTimeout(r, 200));

        } catch (e) {
            console.log(`   > ❌ Error: ${e.message}`);
        }
    }

    console.log(`\n🎉 Seeding Complete! Added ${count} items.`);
}

// Run if called directly
if (require.main === module) {
    const mongoose = require('mongoose');
    
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        console.log('Connected to MongoDB');
        return seedIndian();
      })
      .then(() => {
        process.exit(0);
      })
      .catch((error) => {
        console.error('Connection failed:', error);
        process.exit(1);
      });
}

module.exports = seedIndian;
