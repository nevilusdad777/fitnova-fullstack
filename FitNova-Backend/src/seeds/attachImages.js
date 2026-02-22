const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');

// Levenshtein distance for fuzzy matching
function getEditDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  var matrix = [];

  // increment along the first column of each row
  for (var i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  for (var j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (var i = 1; i <= b.length; i++) {
    for (var j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                                Math.min(matrix[i][j - 1] + 1, // insertion
                                         matrix[i - 1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
}

async function attachImages() {
  try {
    console.log('Fetching comprehensive public exercise dataset for images...');
    const response = await axios.get('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
    const sourceData = response.data;
    
    console.log(`Fetched ${sourceData.length} public exercises.`);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const exercises = await Exercise.find({});
    console.log(`Found ${exercises.length} exercises in our database to update.`);

    let updatedCount = 0;

    for (let ex of exercises) {
        let bestMatch = null;
        let bestScore = Infinity;
        
        const myName = ex.name.toLowerCase();

        for (let pub of sourceData) {
            const pubName = pub.name.toLowerCase();
            
            // Direct substring match first (e.g. "Push-Up" in "Push-up")
            if (myName === pubName) {
                bestMatch = pub;
                bestScore = 0;
                break;
            }
            
            // Try to find if one contains another (e.g "Dumbbell Bench Press" and "Dumbbell Press")
            if (myName.includes(pubName) || pubName.includes(myName)) {
                const diff = Math.abs(myName.length - pubName.length);
                if (diff < bestScore) {
                    bestMatch = pub;
                    bestScore = diff;
                }
            } else {
                 const dist = getEditDistance(myName, pubName);
                 if (dist < 5 && dist < bestScore) { // Close match threshold
                     bestMatch = pub;
                     bestScore = dist;
                 }
            }
        }

        // Apply best match if found
        if (bestMatch && bestScore < 10) {
            const baseUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';
            const folderName = bestMatch.id; 
            const images = [
                `${baseUrl}/${folderName}/0.jpg`,
                `${baseUrl}/${folderName}/1.jpg`
            ];

            ex.images = images;
            ex.gifUrl = images[0]; // fallback
            await ex.save();
            updatedCount++;
            console.log(`Matched "${ex.name}" with "${bestMatch.name}"`);
        } else {
            console.log(`\n\u26A0 Could not find a good match for: "${ex.name}"`);
        }
    }

    console.log(`\n\u2705 Successfully attached real images to ${updatedCount}/${exercises.length} exercises!`);
    
  } catch (error) {
    console.error('\u274C Error attaching images:', error.message);
  } finally {
     mongoose.disconnect();
     process.exit(0);
  }
}

attachImages();
