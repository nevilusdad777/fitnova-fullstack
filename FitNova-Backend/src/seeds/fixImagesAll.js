const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Exercise = require('../models/Exercise');

function getEditDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  var matrix = [];
  for (var i = 0; i <= b.length; i++) matrix[i] = [i];
  for (var j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (var i = 1; i <= b.length; i++) {
    for (var j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
      }
    }
  }
  return matrix[b.length][a.length];
}

async function attachImagesAll() {
  try {
    console.log('Fetching comprehensive public exercise dataset for images...');
    const response = await axios.get('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
    const sourceData = response.data;
    
    await mongoose.connect(process.env.MONGODB_URI);
    const exercises = await Exercise.find({});
    
    let updatedCount = 0;

    for (let ex of exercises) {
        let bestMatch = null;
        let bestScore = Infinity;
        const myName = ex.name.toLowerCase();

        // 1. Direct/Substring/Fuzzy matches
        for (let pub of sourceData) {
            const pubName = pub.name.toLowerCase();
            if (myName === pubName) {
                bestMatch = pub;
                bestScore = 0;
                break;
            }
            if (myName.includes(pubName) || pubName.includes(myName)) {
                const diff = Math.abs(myName.length - pubName.length);
                if (diff < bestScore) {
                    bestMatch = pub;
                    bestScore = diff;
                }
            } else {
                 const dist = getEditDistance(myName, pubName);
                 if (dist < 4 && dist < bestScore) { 
                     bestMatch = pub;
                     bestScore = dist;
                 }
            }
        }

        // 2. Keyword matching fallback
        if (!bestMatch || bestScore > 10) {
            const excludeWords = ['machine', 'dumbbell', 'barbell', 'cable', 'seated', 'standing', 'with', 'single-arm', 'reverse-grip', 'close-grip', 'wide', 'grip', 'weighted'];
            const keywords = myName.split(/[\s-]+/).filter(w => w.length > 3 && !excludeWords.includes(w));
            
            for (let pub of sourceData) {
                const pubName = pub.name.toLowerCase();
                // If it shares at least one strong keyword
                const matchCount = keywords.filter(kw => pubName.includes(kw)).length;
                if (matchCount > 0 && matchCount === keywords.length) {
                    bestMatch = pub;
                    break;
                }
            }
        }
        
        // 3. Very Generic Keyword / Equipment Fallback
        if (!bestMatch) {
            const genericMap = {
                 'chest': ['push-up', 'chest press', 'bench press', 'fly'],
                 'back': ['pull-up', 'row', 'pulldown'],
                 'legs': ['squat', 'lunge', 'leg press', 'deadlift', 'calf'],
                 'shoulders': ['shoulder press', 'lateral raise', 'front raise', 'shrug'],
                 'biceps': ['bicep curl', 'hammer curl'],
                 'triceps': ['triceps extension', 'pushdown', 'skull crusher', 'dip'],
                 'abs': ['crunch', 'plank', 'leg raise', 'rollout'],
                 'cardio': ['run', 'jump', 'bike', 'rowing', 'burpee', 'sprint']
            };
            const wordsToTry = genericMap[ex.bodyPart.toLowerCase()] || [];
            
            let found = false;
            // Try matching our exercise name to generic words
            for (let word of wordsToTry) {
                 if (myName.includes(word)) {
                     bestMatch = sourceData.find(p => p.name.toLowerCase().includes(word));
                     found = true;
                     break;
                 }
            }
            
            // 4. Ultimate fallback: Just pick ANY exercise from the public DB with the same target muscle/body part
            if (!found) {
                bestMatch = sourceData.find(p => {
                    const pubPrimary = (p.primaryMuscles && p.primaryMuscles[0]) || '';
                    const myPart = ex.bodyPart.toLowerCase();
                    if (myPart === 'chest' && pubPrimary.includes('chest')) return true;
                    if (myPart === 'back' && (pubPrimary.includes('middle back') || pubPrimary.includes('lats'))) return true;
                    if (myPart === 'legs' && (pubPrimary.includes('quadriceps') || pubPrimary.includes('hamstrings') || pubPrimary.includes('glutes'))) return true;
                    if (myPart === 'shoulders' && pubPrimary.includes('shoulders')) return true;
                    if (myPart === 'biceps' && pubPrimary.includes('biceps')) return true;
                    if (myPart === 'triceps' && pubPrimary.includes('triceps')) return true;
                    if (myPart === 'abs' && pubPrimary.includes('abdominals')) return true;
                    if (myPart === 'cardio' && p.category === 'cardio') return true;
                    return false;
                });
            }
        }

        // Apply best match if found
        if (bestMatch) {
            const baseUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';
            const folderName = bestMatch.id; 
            const images = [
                `${baseUrl}/${folderName}/0.jpg`,
                `${baseUrl}/${folderName}/1.jpg`
            ];

            ex.images = images;
            ex.gifUrl = images[0]; 
            await ex.save();
            updatedCount++;
            console.log(`Matched [${ex.name}]  -->  [${bestMatch.name}]`);
        } else {
            console.log(`\n\u26A0 STILL missing: "${ex.name}"`);
        }
    }

    console.log(`\n\u2705 Successfully attached images to ${updatedCount}/${exercises.length} exercises!`);
    
  } catch (error) {
    console.error('\u274C Error attaching images:', error.message);
  } finally {
     mongoose.disconnect();
     process.exit(0);
  }
}

attachImagesAll();
