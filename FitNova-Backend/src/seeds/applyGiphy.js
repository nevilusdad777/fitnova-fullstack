const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');

async function applyGiphy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const myBurpees = await Exercise.findOne({ name: 'Burpees' });
    if (myBurpees) {
        // Confirmed working hotlink
        const gif = 'https://media1.giphy.com/media/23hPPMRgPbfFSzwvdT/giphy.gif';
        
        myBurpees.images = [gif]; 
        myBurpees.gifUrl = gif;
        await myBurpees.save();
        console.log('Successfully applied working Giphy Burpee GIF!');
    } else {
        console.log('Burpees not found.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
     mongoose.disconnect();
  }
}

applyGiphy();
