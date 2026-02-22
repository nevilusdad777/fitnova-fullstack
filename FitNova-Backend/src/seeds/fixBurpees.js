const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');

async function fixBurpees() {
  try {
    console.log('Fetching public DB...');
    const response = await axios.get('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
    const sourceData = response.data;
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    // Look for burpee in public DB
    const burpeeMatches = sourceData.filter(ex => ex.name.toLowerCase().includes('burpee'));
    console.log('Found public burpee matches: ', burpeeMatches.map(b => b.name));

    if (burpeeMatches.length > 0) {
        const bestMatch = burpeeMatches[0]; // just grab the first one, usually "Burpee"
        console.log(`Using: ${bestMatch.name} (ID: ${bestMatch.id})`);

        const baseUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';
        const folderName = bestMatch.id; 
        const images = [
            `${baseUrl}/${folderName}/0.jpg`,
            `${baseUrl}/${folderName}/1.jpg`
        ];

        const myBurpees = await Exercise.findOne({ name: 'Burpees' });
        if (myBurpees) {
            myBurpees.images = images;
            myBurpees.gifUrl = images[0];
            await myBurpees.save();
            console.log('Successfully updated Burpees images!');
        } else {
            console.log('Could not find Burpees in our database.');
        }
    } else {
        console.log('No burpee found in public db.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
     mongoose.disconnect();
  }
}

fixBurpees();
