const mongoose = require('mongoose');
require('dotenv').config();
const Food = require('../models/Food');

const INDIAN_DIET_DATA = [
    { name: 'Roti (Whole Wheat)', query: 'chapati', category: 'grains', calories: 104, protein: 3, carbs: 22, fat: 0.5, servingSize: 1, servingUnit: 'piece', isVegetarian: true },
    { name: 'Multigrain Roti', query: 'multigrain roti', category: 'grains', calories: 120, protein: 4, carbs: 24, fat: 1, servingSize: 1, servingUnit: 'piece', isVegetarian: true }
];

async function seed() {
    console.log('Starting No-API Seed...');
    await mongoose.connect(process.env.MONGODB_URI);
    await Food.deleteMany({});
    console.log('Cleared DB');

    let count = 0;
    for (const item of INDIAN_DIET_DATA) {
        console.log(`Processing ${item.name}`);
        const newItem = await Food.create({
            ...item,
            image: null,
            verified: true,
            apiSource: 'Curated (Indian)',
            apiId: `IN_${count}`
        });
        console.log(`Saved ${newItem._id}`);
        count++;
    }
    console.log('Done');
    process.exit(0);
}
seed();
