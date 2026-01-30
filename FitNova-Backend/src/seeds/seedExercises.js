const Exercise = require('../models/Exercise');
const axios = require('axios'); // Ensure axios is available or use fetch

async function seedExercises() {
  try {
    console.log('Fetching massive exercise database...');
    // yuhonas/free-exercise-db
    const response = await axios.get('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
    const sourceData = response.data;
    
    console.log(`Fetched ${sourceData.length} exercises. Processing...`);

    // Map to our schema
    const newExercises = sourceData.map(item => {
        // Map category to bodyPart
        let bodyPart = 'full-body';
        const primary = item.primaryMuscles[0] || '';
        
        switch(item.category) {
            case 'strength':
                if (primary.includes('chest')) bodyPart = 'chest';
                else if (primary.includes('back') || primary.includes('lats')) bodyPart = 'back';
                else if (primary.includes('quadriceps') || primary.includes('hamstrings') || primary.includes('glutes') || primary.includes('calves')) bodyPart = 'legs';
                else if (primary.includes('shoulders') || primary.includes('deltoids')) bodyPart = 'shoulders';
                else if (primary.includes('biceps') || primary.includes('triceps') || primary.includes('forearms')) bodyPart = 'arms';
                else if (primary.includes('abdominals')) bodyPart = 'abs';
                break;
            case 'cardio': bodyPart = 'cardio'; break;
            case 'plyometrics': bodyPart = 'legs'; break;
            case 'stretching': bodyPart = 'full-body'; break;
            case 'powerlifting': bodyPart = 'full-body'; break;
            case 'strongman': bodyPart = 'full-body'; break;
            case 'olympic weightlifting': bodyPart = 'full-body'; break;
        }

        // Construct Image URLs (0.jpg and 1.jpg)
        const baseUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';
        // The source id usually matches the folder name, e.g. "Air_Bike"
        const folderName = item.id; 
        const images = [
            `${baseUrl}/${folderName}/0.jpg`,
            `${baseUrl}/${folderName}/1.jpg`
        ];

        return {
            name: item.name,
            bodyPart: bodyPart,
            equipment: item.equipment === 'body only' ? 'bodyweight' : (item.equipment || 'none'),
            targetMuscle: primary || 'Full Body',
            difficulty: item.level || 'intermediate',
            instructions: item.instructions,
            images: images,
            gifUrl: images[0], // Backwards compatibility if needed
            defaultSets: 3,
            defaultReps: 12
        };
    });

    // Clear existing
    await Exercise.deleteMany({});
    console.log('Cleared existing exercises');

    // Insert in chunks to avoid timeout or memory issues
    const chunkSize = 100;
    for (let i = 0; i < newExercises.length; i += chunkSize) {
        const chunk = newExercises.slice(i, i + chunkSize);
        try {
             // Use ordered: false to skip duplicates if any name collisions (though we cleared first)
            await Exercise.insertMany(chunk, { ordered: false });
            console.log(`Inserted chunk ${i} to ${i + chunk.length}`);
        } catch (e) {
            console.warn(`Partial error in chunk ${i}:`, e.message); // Continue even if some fail
        }
    }

    console.log(`\u2705 Successfully seeded database with ${newExercises.length} exercises!`);
    return newExercises;

  } catch (error) {
    console.error('\u274C Error seeding exercises:', error.message);
    throw error;
  }
}

if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config();

  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return seedExercises();
    })
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedExercises;
