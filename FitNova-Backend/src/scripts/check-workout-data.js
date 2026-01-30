const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const WorkoutHistory = require('../models/WorkoutHistory');
require('dotenv').config();

const checkDatabaseData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get user ID from command line
        const userId = process.argv[2];
        if (!userId) {
            console.error('❌ Please provide your user ID as argument');
            process.exit(1);
        }

        console.log(`📊 Checking data for user: ${userId}\n`);
        console.log('=' .repeat(60));

        // Check Workout collection (old weekly plans)
        const workouts = await Workout.find({ user: userId }).sort({ date: -1 });
        console.log(`\n📋 WORKOUTS COLLECTION (Weekly Plan Templates):`);
        console.log(`   Total entries: ${workouts.length}`);
        if (workouts.length > 0) {
            console.log(`\n   Recent entries:`);
            workouts.slice(0, 10).forEach((w, i) => {
                const exerciseCount = w.exercises ? w.exercises.length : 0;
                const restDay = w.isRestDay ? ' (REST DAY)' : '';
                console.log(`   ${i + 1}. ${w.day} - ${w.date} - ${exerciseCount} exercises${restDay}`);
                if (exerciseCount > 0 && exerciseCount <= 3) {
                    w.exercises.forEach(ex => {
                        console.log(`      - ${ex.name} (${ex.sets}x${ex.reps})`);
                    });
                }
            });
        }

        console.log(`\n` + '='.repeat(60));

        // Check WorkoutHistory collection (actual completed workouts)
        const workoutHistory = await WorkoutHistory.find({ user: userId }).sort({ date: -1 });
        console.log(`\n📊 WORKOUT HISTORY COLLECTION (Completed Workouts):`);
        console.log(`   Total entries: ${workoutHistory.length}`);
        if (workoutHistory.length > 0) {
            console.log(`\n   Recent entries:`);
            workoutHistory.slice(0, 10).forEach((w, i) => {
                const exerciseCount = w.exercises ? w.exercises.length : 0;
                console.log(`   ${i + 1}. ${w.routineName} - ${w.date.toLocaleDateString()} - ${exerciseCount} exercises - ${w.totalCaloriesBurned} cal`);
                if (exerciseCount > 0 && exerciseCount <= 3) {
                    w.exercises.forEach(ex => {
                        console.log(`      - ${ex.name} (${ex.completedSets}/${ex.targetSets} sets)`);
                    });
                }
            });
        }

        console.log(`\n` + '='.repeat(60));
        console.log(`\n💡 SUMMARY:`);
        console.log(`   - "Recent Sessions" showing ${workouts.length} = Data in WORKOUTS collection`);
        console.log(`   - "History Page" showing ${workoutHistory.length} = Data in WORKOUT HISTORY collection`);
        console.log(`\n   The ${workouts.length} workouts in WORKOUTS collection should be migrated to WORKOUT HISTORY.`);

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkDatabaseData();
