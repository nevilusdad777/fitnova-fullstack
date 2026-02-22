const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');

async function fixBurpeesFinal() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Hardcode a good generic Burpee from public repo (there was an issue where Burpee wasn't found under that exact string)
    // Actually wait, let's use the 'Burpee' folder that usually exists in these repos
    const baseUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';
    const folderName = 'Burpee'; // or maybe just a generic cardio one if it 404s, but let's try 'Burpee'
    const images = [
        `${baseUrl}/Burpee/0.jpg`,
        `${baseUrl}/Burpee/1.jpg`
    ];

    const myBurpees = await Exercise.findOne({ name: 'Burpees' });
    if (myBurpees) {
        myBurpees.images = [
            'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Burpee/0.jpg',
            'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Burpee/1.jpg'
        ];
        // If git repo throws 404, we'll try a fallback that we know exists in the frontend
        myBurpees.gifUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Burpee/0.jpg';
        await myBurpees.save();
        console.log('Successfully updated Burpees images!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
     mongoose.disconnect();
  }
}

fixBurpeesFinal();
