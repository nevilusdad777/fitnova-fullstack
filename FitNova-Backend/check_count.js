const mongoose = require('mongoose');
require('dotenv').config();
const Food = require('./src/models/Food');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Food.countDocuments();
        console.log(`Total Foods in DB: ${count}`);
        
        if (count > 0) {
            const sample = await Food.findOne();
            console.log('Sample:', sample.name, 'Source:', sample.apiSource);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
