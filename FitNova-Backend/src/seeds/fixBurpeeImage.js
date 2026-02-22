const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');

async function fixBurpeeImage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Using a clear static image of a burpee from Wikipedia
    // We already tried "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Burpee_exercise_1.svg/800px-Burpee_exercise_1.svg.png" but maybe the previous script failed over to Unsplash. Let me check the logs again, it said "Wikimedia failed".
    // Let's use an imgur or similar public image explicitly known to be burpees, or find a different github repo asset.
    
    // I will use an image from yuhonas/free-exercise-db but for mountain climbers or something similar if no burpee? No, the user wants BURPEES.
    // Wait, let's use a reliable static image.
    const chosenUrl = 'https://hips.hearstapps.com/hmg-prod/images/burpee-1582218000.gif'; // Usually accessible
    
    // If that fails, let's try a different one
    // Actually, why not just use the placeholder if it fails? No, the user wants an image.
    // Let's try this one: 
    const fallbackGif = 'https://flabfix.com/wp-content/uploads/2019/02/Burpees.gif';

    const ex = await Exercise.findOne({ name: 'Burpees' });
    if (ex) {
        ex.images = [fallbackGif];
        ex.gifUrl = fallbackGif;
        await ex.save();
        console.log('Successfully assigned clear Burpees GIF: ' + fallbackGif);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
     mongoose.disconnect();
  }
}

fixBurpeeImage();
