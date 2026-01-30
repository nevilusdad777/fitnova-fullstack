const mongoose = require('mongoose');
require('dotenv').config();
const Food = require('../models/Food');
const { searchFood, mapToFoodModel } = require('../services/openFoodFactsService');

// ==========================================
// CONFIGURATION
// ==========================================
const TARGET_ITEMS_PER_CATEGORY = 15; // Aim for this many unique verified items per search term
const DELAY_MS = 1000; // Be nice to the API

// Search terms grouped by logical category to ensure variety
const SEARCH_GROUPS = {
    Protein: [
        'Chicken Breast', 'Grilled Chicken', 'Chicken Thigh', 
        'Salmon', 'Tuna Steak', 'Cod', 'Shrimp', 
        'Beef Steak', 'Ground Beef', 'Lamb', 
        'Pork Chop', 'Turkey Breast',
        'Egg', 'Egg Whites', 
        'Tofu', 'Tempeh', 'Seitan', 'Edamame',
        'Whey Protein', 'Plant Protein'
    ],
    Vegetables: [
        'Broccoli', 'Spinach', 'Kale', 'Asparagus', 
        'Green Beans', 'Carrot', 'Sweet Potato', 'Potato',
        'Bell Pepper', 'Cucumber', 'Tomato', 'Lettuce',
        'Cauliflower', 'Zucchini', 'Mushroom', 'Onion'
    ],
    Fruits: [
        'Apple', 'Banana', 'Orange', 'Strawberry', 'Blueberry',
        'Raspberry', 'Mango', 'Pineapple', 'Watermelon',
        'Grape', 'Peach', 'Pear', 'Kiwi', 'Avocado', 'Lemon'
    ],
    Grains: [
        'Brown Rice', 'White Rice', 'Basmati Rice', 'Jasmine Rice',
        'Quinoa', 'Oats', 'Rolled Oats', 'Granola',
        'Whole Wheat Bread', 'Sourdough Bread', 'Pasta', 'Spaghetti',
        'Couscous', 'Barley'
    ],
    Dairy: [
        'Milk', 'Almond Milk', 'Soy Milk', 'Oat Milk',
        'Greek Yogurt', 'Yogurt', 'Cottage Cheese', 
        'Cheddar Cheese', 'Mozzarella', 'Parmesan', 'Butter', 'Cream Cheese'
    ],
    Fats: [
        'Almonds', 'Walnuts', 'Cashews', 'Peanuts', 
        'Peanut Butter', 'Almond Butter', 
        'Olive Oil', 'Coconut Oil', 'Chia Seeds', 'Flax Seeds'
    ],
    Snacks: [
        'Dark Chocolate', 'Popcorn', 'Rice Cake', 'Protein Bar',
        'Hummus', 'Guacamole', 'Salsa', 'Pretzels'
    ]
};

// ==========================================
// SEEDING LOGIC
// ==========================================
async function seedSmartFood() {
    console.log('🚀 Starting Smart Food Seeding Process...');
    console.log('🗑️  Clearing existing food database...');
    
    await Food.deleteMany({});
    console.log('✅ Database cleared.');

    let totalAdded = 0;
    const seenNames = new Set();
    const seenApiIds = new Set();

    for (const [groupName, terms] of Object.entries(SEARCH_GROUPS)) {
        console.log(`\n📂 Processing Group: ${groupName.toUpperCase()}`);
        
        for (const term of terms) {
            try {
                process.stdout.write(`   🔍 Searching for "${term}"... `);
                
                // We ask for more results (20) in the service to allow filtering
                const results = await searchFood(term, 20);
                
                let addedForTerm = 0;

                for (const product of results) {
                    // Map to our model
                    const foodData = mapToFoodModel(product);

                    // 1. Check Duplicates (API ID or Name)
                    if (seenApiIds.has(foodData.apiId) || seenNames.has(foodData.name.toLowerCase())) {
                        continue;
                    }

                    // 2. Extra Validation (Double check service didn't leak bad data)
                    if (!foodData.image || foodData.calories === 0) {
                        continue;
                    }

                    // Save
                    await Food.create(foodData);
                    
                    seenApiIds.add(foodData.apiId);
                    seenNames.add(foodData.name.toLowerCase());
                    addedForTerm++;
                    totalAdded++;

                    // Limit per term to avoid flooding with 50 kinds of "strawberry yogurt"
                    if (addedForTerm >= 3) break; 
                }

                console.log(`Added ${addedForTerm} items.`);
                
                // Politeness delay
                await new Promise(r => setTimeout(r, DELAY_MS));

            } catch (err) {
                console.log(`❌ Error: ${err.message}`);
            }
        }
    }

    console.log('\n==========================================');
    console.log(`🎉 Seeding Complete!`);
    console.log(`Total Foods Added: ${totalAdded}`);
    console.log('==========================================\n');
}

// Run if called directly
if (require.main === module) {
    const mongoose = require('mongoose');
    
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        console.log('Connected to MongoDB');
        return seedSmartFood();
      })
      .then(() => {
        process.exit(0);
      })
      .catch((error) => {
        console.error('Connection failed:', error);
        process.exit(1);
      });
}

module.exports = seedSmartFood;
