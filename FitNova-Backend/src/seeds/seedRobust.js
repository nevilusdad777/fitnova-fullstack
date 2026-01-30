const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const Exercise = require('../models/Exercise');

const seedData = JSON.parse(fs.readFileSync('temp_exercises.json', 'utf8'));
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

const mapDifficulty = (level) => {
    if (level === 'expert') return 'advanced';
    return level || 'beginner';
};

const mapEquipment = (eq) => {
    if (!eq) return 'none';
    const lower = eq.toLowerCase();
    if (lower === 'body only') return 'bodyweight';
    if (lower === 'bands') return 'resistance-band';
    if (lower === 'e-z curl bar') return 'barbell';
    if (lower === 'kettlebell') return 'dumbbell'; // Approximate
    if (lower === 'cable') return 'cable';
    if (lower === 'machine') return 'machine';
    if (lower === 'dumbbell') return 'dumbbell';
    if (lower === 'barbell') return 'barbell';
    return 'none';
};

const mapBodyPart = (ex) => {
    const muscles = ex.primaryMuscles || [];
    const cat = ex.category;

    if (cat === 'cardio') return 'cardio';
    if (muscles.includes('biceps')) return 'biceps';
    if (muscles.includes('triceps')) return 'triceps';
    if (muscles.includes('chest')) return 'chest';
    if (muscles.includes('shoulders')) return 'shoulders';
    if (muscles.includes('abdominals')) return 'abs';
    
    if (muscles.some(m => ['quadriceps', 'hamstrings', 'calves', 'glutes', 'adductors', 'abductors'].includes(m))) return 'legs';
    if (muscles.some(m => ['lats', 'middle back', 'lower back', 'traps', 'neck'].includes(m))) return 'back';

    // Fallback
    return 'full-body';
};

const processExercises = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await Exercise.deleteMany({});
        console.log('Cleared existing exercises.');

        const exercisesToInsert = [];
        const seenNames = new Set();

        for (const ex of seedData) {
            // Unify names to avoid dupes if any
            if (seenNames.has(ex.name)) continue;
            seenNames.add(ex.name);

            // Construct Images
            // Dataset has nested folders matching name usually? 
            // Actually the dataset has "images": ["Folder/0.jpg", ...]
            
            const images = (ex.images || []).map(img => `${IMAGE_BASE_URL}${img}`);
            const gifUrl = images.length > 0 ? images[0] : ''; // Use first image as main visual

            const bodyPart = mapBodyPart(ex);
            
            // Only add if it maps to our categories nicely
            if (bodyPart === 'full-body' && ex.category !== 'strength' && ex.category !== 'stretching') {
                // Should we keep full-body? The user asked for specific categories.
                // Let's keep them if they are good exercises, but user listed specific ones.
                // User said: "for chest,back,biceps,triceps,legs,shoulders,cardio,abs"
                // If it's not one of those, maybe skip or put in valid cat.
            }
            
            if (['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'abs', 'cardio'].includes(bodyPart)) {
                exercisesToInsert.push({
                    name: ex.name,
                    bodyPart: bodyPart,
                    difficulty: mapDifficulty(ex.level),
                    equipment: mapEquipment(ex.equipment),
                    instructions: ex.instructions || [],
                    defaultSets: 3,
                    defaultReps: 12,
                    caloriesPerMinute: 6,
                    gifUrl: gifUrl,
                    images: images,
                    // Description is missing in Schema but 'instructions' is there.
                    // Frontend uses 'description' (which might be separate), or instructions array.
                    // Let's assume instructions is key.
                });
            }
        }

        const result = await Exercise.insertMany(exercisesToInsert);
        console.log(`Successfully seeded ${result.length} exercises.`);
        
        // Log distribution
        const counts = {};
        result.forEach(e => {
            counts[e.bodyPart] = (counts[e.bodyPart] || 0) + 1;
        });
        console.log('Distribution:', counts);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
};

processExercises();
