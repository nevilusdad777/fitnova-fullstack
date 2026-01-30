const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const cleanupOldWorkouts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const userId = process.argv[2];
        if (!userId) {
            console.error('❌ Please provide your user ID as argument');
            process.exit(1);
        }

        console.log(`🗑️  Cleaning up old workouts for user: ${userId}\n`);

        const result = await Workout.deleteMany({ user: userId });
        
        console.log(`✅ Deleted ${result.deletedCount} workouts from old collection`);
        console.log(`\n   Your data is now consolidated in WorkoutHistory! 🎉\n`);

        await mongoose.connection.close();

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

cleanupOldWorkouts();
