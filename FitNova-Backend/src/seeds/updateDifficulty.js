const mongoose = require('mongoose');
require('dotenv').config();
const Exercise = require('../models/Exercise');

const updateExercises = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update specific exercises to Advanced
        const advancedNames = ['Deadlift', 'Barbell Back Squat', 'Pull Up', 'Barbell Bench Press', 'Clean and Jerk', 'Snatch', 'Muscle Up', 'Front Squat', 'Overhead Press'];
        const advancedRes = await Exercise.updateMany(
            { name: { $in: advancedNames } },
            { $set: { difficulty: 'advanced' } }
        );
        console.log(`Updated ${advancedRes.modifiedCount} exercises to Advanced.`);

        // Ensure others are at least beginner or intermediate if not set (but model has default 'beginner')
        // We can just confirm operation done.
        
        console.log('Update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating exercises:', error);
        process.exit(1);
    }
};

updateExercises();
