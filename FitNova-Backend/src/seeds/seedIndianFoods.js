const mongoose = require('mongoose');
const Food = require('../models/Food');
const indianFoods1 = require('./data/indian_foods_data.json');
const indianFoods2 = require('./data/indian_foods_data_extended.json');
const fitnessFoods = require('./data/fitness_foods_data.json');
const moreFoods = require('./data/more_foods_data.json');

require('dotenv').config();

async function seedIndianFoods() {
  try {
    console.log('🚀 Starting Comprehensive Food Seeding...');
    
    // Combine all data sources
    const allFoods = [
      ...indianFoods1,
      ...indianFoods2,
      ...fitnessFoods,
      ...moreFoods
    ];

    // Remove duplicates based on name
    const uniqueFoods = [];
    const seenNames = new Set();
    
    allFoods.forEach(food => {
      const normalizedName = food.name.toLowerCase().trim();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        // Ensure required fields
        const foodItem = {
          ...food,
          verified: true,
          apiSource: 'Curated (Indian)',
          apiId: `manual_${normalizedName.replace(/\s+/g, '_')}`
        };
        uniqueFoods.push(foodItem);
      }
    });

    console.log(`📊 Loaded ${allFoods.length} items from files.`);
    console.log(`✨ Unique items to seed: ${uniqueFoods.length}`);

    // Validate connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    }

    // Clear existing
    await Food.deleteMany({});
    console.log('🗑️  Cleared existing food database');

    // Insert
    const result = await Food.insertMany(uniqueFoods);
    console.log(`\n🎉 Successfully seeded ${result.length} foods!`);
    
    // Log breakdown
    const categories = {};
    result.forEach(f => {
      categories[f.category] = (categories[f.category] || 0) + 1;
    });
    
    console.log('\n📈 Category Breakdown:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   - ${cat.padEnd(12)}: ${count}`);
    });

    return result;

  } catch (error) {
    console.error('❌ Error seeding foods:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
    seedIndianFoods().then(() => {
        console.log('\n👋 Seeding finished.');
        process.exit(0);
    });
}

module.exports = seedIndianFoods;
