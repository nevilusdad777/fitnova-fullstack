const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');
const axios = require('axios');

async function debugBurpees() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const myBurpees = await Exercise.findOne({ name: 'Burpees' });
    console.log('Burpees Document:', JSON.stringify(myBurpees, null, 2));

    if (myBurpees && myBurpees.images.length > 0) {
        console.log(`\nTesting URL: ${myBurpees.images[0]}`);
        try {
            await axios.head(myBurpees.images[0]);
            console.log('URL is VALID and reachable.');
        } catch (e) {
            console.log('URL is BROKEN/404. We need a new source.');
        }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
     mongoose.disconnect();
  }
}

debugBurpees();
