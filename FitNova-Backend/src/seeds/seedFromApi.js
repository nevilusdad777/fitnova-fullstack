const mongoose = require('mongoose');
require('dotenv').config();
const Food = require('../models/Food');
const { searchFood, mapToFoodModel } = require('../services/openFoodFactsService');

// List of foods we want to make sure are in the database
const targetFoods = [
  // Fruits
  'apple', 'banana', 'orange', 'strawberry', 'blueberry', 'mango', 'grape', 'watermelon', 'pineapple',
  // Vegetables
  'broccoli', 'spinach', 'carrot', 'tomato', 'cucumber', 'kale', 'potato', 'sweet potato', 'onion', 'garlic',
  // Proteins
  'chicken breast', 'salmon', 'tuna', 'egg', 'beef steak', 'pork chop', 'tofu', 'lentils', 'chickpeas',
  // Grains
  'rice', 'quinoa', 'oats', 'whole wheat bread', 'pasta',
  // Dairy
  'milk', 'cheddar cheese', 'greek yogurt', 'butter',
  // Fats/Nuts
  'almonds', 'walnuts', 'peanut butter', 'avocado', 'olive oil'
];

async function seedFromApi() {
  console.log('🌱 Starting OpenFoodFacts Seed Process...');
  console.log(`Checking for ${targetFoods.length} target foods...`);

  let addedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const query of targetFoods) {
    try {
      // 1. Search for the product
      // We ask for 5 results and filter for the best match in the service, but here we pick the first valid one
      const searchResults = await searchFood(query, 5);
      
      if (searchResults.length === 0) {
        console.log(`⚠️ No results found for "${query}"`);
        continue;
      }

      // Pick the best match (simplistic: first one)
      // Ideally we might check if the name matches closely
      const bestMatch = searchResults[0];
      
      // 2. Map to Model
      const foodData = mapToFoodModel(bestMatch);

      // 3. Check if already exists by API ID or exact Name
      const existing = await Food.findOne({ 
        $or: [
            { apiId: foodData.apiId },
            { name: new RegExp('^' + foodData.name + '$', 'i') } // Case insensitive exact match
        ]
      });

      if (existing) {
        // Update if existing doesn't have an image but new one does
        if (!existing.image && foodData.image) {
            existing.image = foodData.image;
            existing.apiId = foodData.apiId;
            existing.apiSource = 'OpenFoodFacts';
            await existing.save();
            console.log(`🔄 Updated "${existing.name}" with image`);
            addedCount++;
        } else {
            console.log(`⏭️  Skipping "${foodData.name}" (already exists)`);
            skippedCount++;
        }
      } else {
          // Create new
          await Food.create(foodData);
          console.log(`✅ Added "${foodData.name}"`);
          addedCount++;
      }

      // Respectful delay for public API
      await new Promise(r => setTimeout(r, 500)); 

    } catch (error) {
      console.error(`❌ Unexpected error processing "${query}":`, error.message);
      errorCount++;
    }
  }

  console.log('\n==========================================');
  console.log(`Seed Complete!`);
  console.log(`Processed/Updated: ${addedCount}`);
  console.log(`Skipped:           ${skippedCount}`);
  console.log(`Errors:            ${errorCount}`);
  console.log('==========================================\n');
}

// Run if called directly
if (require.main === module) {
  const mongoose = require('mongoose');
  
  // No API Key check needed for OpenFoodFacts

  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return seedFromApi();
    })
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Connection failed:', error);
      process.exit(1);
    });
}

module.exports = seedFromApi;
