const mongoose = require('mongoose');
require('dotenv').config();
const Food = require('./src/models/Food');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Food.countDocuments();
        console.log(`Count: ${count}`);
        
        const last = await Food.findOne().sort({ createdAt: -1 });
        if (last) {
            console.log(`Last Item: ${last.name}`);
            console.log(`Calories: ${last.calories}`);
            console.log(`Source: ${last.apiSource}`);
            console.log(`Image: ${last.image ? 'Yes' : 'No'}`);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
