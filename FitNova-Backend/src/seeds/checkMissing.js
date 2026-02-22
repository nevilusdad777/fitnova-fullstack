const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');

async function checkMissing() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    const missing = await Exercise.find({ 
        $or: [
            { images: { $size: 0 } },
            { imagesPos: { $exists: false } } // just checking standard
        ]
    });
    
    // Actually the placeholder is attached to 'images' being length 0? Let's check.
    const all = await Exercise.find();
    let missingImages = all.filter(e => e.images.length === 0 || !e.images[0].includes('yuhonas'));
    
    console.log(`Missing images for ${missingImages.length} exercises:`);
    missingImages.forEach(e => console.log(e.name));

  } catch (error) {
    console.error('Error:', error);
  } finally {
     mongoose.disconnect();
  }
}

checkMissing();
