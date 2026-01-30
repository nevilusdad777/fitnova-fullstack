const mongoose = require('mongoose');
require('dotenv').config();
const Food = require('./src/models/Food');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');
        
        await Food.deleteMany({});
        console.log('Deleted all');
        
        const f = await Food.create({
            name: 'TEST_ITEM',
            category: 'protein',
            isVegetarian: true,
            calories: 100,
            protein: 10,
            carbs: 10,
            fat: 10,
            servingSize: 100,
            servingUnit: 'g'
        });
        console.log('Created:', f._id);
        
        const count = await Food.countDocuments();
        console.log('Count:', count);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
test();
