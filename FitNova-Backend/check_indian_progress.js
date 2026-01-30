const mongoose = require('mongoose');
require('dotenv').config();
const Food = require('./src/models/Food');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Food.countDocuments();
        console.log(`Current Food Count: ${count}`);
        
        // Show last added
        const last = await Food.findOne().sort({ _id: -1 });
        if (last) {
            console.log(`Last Item: ${last.name} | Image: ${last.image ? 'YES' : 'NO'}`);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
