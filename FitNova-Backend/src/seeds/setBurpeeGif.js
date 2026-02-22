const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');

async function setBurpeeGif() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const myBurpees = await Exercise.findOne({ name: 'Burpees' });
    if (myBurpees) {
        // A reliable WikiMedia Commons burpee instructional GIF
        const gif = 'https://upload.wikimedia.org/wikipedia/commons/3/36/Burpee_exercise.gif';
        const img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Burpee_exercise_1.svg/800px-Burpee_exercise_1.svg.png';
        
        myBurpees.images = [gif]; // Just put the GIF in the array
        myBurpees.gifUrl = gif;
        await myBurpees.save();
        console.log('Successfully applied verified Burpee GIF!');
    } else {
        console.log('Burpees not found.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
     mongoose.disconnect();
  }
}

setBurpeeGif();
