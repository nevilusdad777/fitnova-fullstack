const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');
const axios = require('axios');

async function fixBurpeeForReal() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Test the Wikimedia PNG (not the restricted GIF)
    const imgUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Burpee_exercise_1.svg/800px-Burpee_exercise_1.svg.png';
    const imgUrl2 = 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800'; // Generic functional fitness fallback
    
    let chosenUrl = null;
    try {
        await axios.get(imgUrl);
        chosenUrl = imgUrl;
        console.log('Wikimedia PNG works!');
    } catch (e) {
        chosenUrl = imgUrl2;
        console.log('Wikimedia failed, using Unsplash fallback!');
    }

    const ex = await Exercise.findOne({ name: 'Burpees' });
    if (ex) {
        ex.images = [chosenUrl];
        ex.gifUrl = chosenUrl;
        await ex.save();
        console.log('Successfully assigned image to Burpees: ' + chosenUrl);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
     mongoose.disconnect();
  }
}

fixBurpeeForReal();
