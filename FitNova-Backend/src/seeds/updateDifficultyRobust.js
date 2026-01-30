const mongoose = require('mongoose');
require('dotenv').config();
const Exercise = require('../models/Exercise');

const updateExercises = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Reset all to beginner first (optional, but cleaner)
        // await Exercise.updateMany({}, { difficulty: 'beginner' });

        // Advanced keywords
        const advancedKeywords = ['Deadlift', 'Clean', 'Snatch', 'Jerk', 'Muscle Up', 'Dragon Flag', 'Human Flag', 'Front Lever', 'Back Lever', 'Planche', 'Handstand'];
        const advancedRegex = advancedKeywords.map(k => new RegExp(k, 'i'));
        
        const advRes = await Exercise.updateMany(
            { name: { $in: advancedRegex } },
            { $set: { difficulty: 'advanced' } }
        );
        console.log(`Updated ${advRes.modifiedCount} exercises to Advanced.`);

        // Intermediate keywords (apply to those not already advanced)
        const intermediateKeywords = ['Barbell', 'Dumbbell', 'Pull Up', 'Chin Up', 'Dip', 'Bench Press', 'Squat', 'Lunge', 'Push Up', 'Row', 'Plank'];
        const intermediateRegex = intermediateKeywords.map(k => new RegExp(k, 'i'));

        // Only update if not already advanced
        const intRes = await Exercise.updateMany(
            { 
                name: { $in: intermediateRegex },
                difficulty: { $ne: 'advanced' }
            },
            { $set: { difficulty: 'intermediate' } }
        );
        console.log(`Updated ${intRes.modifiedCount} exercises to Intermediate.`);

        // Force at least 10 random remaining beginners to Advanced and 20 to Intermediate 
        // to ensure we have SOME data if keywords fail
        
        // Count current
        const advCount = await Exercise.countDocuments({ difficulty: 'advanced' });
        console.log(`Current Advanced Count: ${advCount}`);

        if (advCount < 20) {
            console.log('Forcing random exercises to Advanced...');
            const randoms = await Exercise.aggregate([
                { $match: { difficulty: 'beginner' } },
                { $sample: { size: 20 } }
            ]);
            if (randoms.length > 0) {
                const ids = randoms.map(e => e._id);
                await Exercise.updateMany({ _id: { $in: ids } }, { $set: { difficulty: 'advanced' } });
                console.log(`Forced ${ids.length} random exercises to Advanced.`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error updating exercises:', error);
        process.exit(1);
    }
};

updateExercises();
