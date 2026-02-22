const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');
const axios = require('axios');

async function checkUrl() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const ex = await Exercise.findOne({ name: 'Burpees' });
    console.log('Burpees:', ex.name, ex.gifUrl, ex.images);
    
    // Let's also check if there's an actual 'Burpee' in the DB instead of 'Burpees'
    const others = await Exercise.find({ name: /burpee/i });
    console.log('All burpee matches:', others.map(o => o.name));

  } catch (error) {
    console.error('Error:', error);
  } finally {
     mongoose.disconnect();
  }
}

checkUrl();
