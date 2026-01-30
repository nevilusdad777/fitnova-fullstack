const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const WorkoutHistory = require('../models/WorkoutHistory');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const migrateWorkouts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const userId = process.argv[2];
        if (!userId) {
            console.error('❌ Please provide your user ID as argument');
            console.error('   Usage: node src/scripts/migrate-workouts.js <USER_ID>');
            process.exit(1);
        }

        console.log(`📦 Starting migration for user: ${userId}\n`);
        console.log('='.repeat(60));

        // Get all workouts from old Workout collection
        const oldWorkouts = await Workout.find({ user: userId }).sort({ date: 1 });
        console.log(`\n📋 Found ${oldWorkouts.length} workouts in WORKOUTS collection`);

        // Get existing workout history
        const existingHistory = await WorkoutHistory.find({ user: userId });
        console.log(`📊 Found ${existingHistory.length} workouts in WORKOUT HISTORY collection`);

        if (oldWorkouts.length === 0) {
            console.log('\n✅ No workouts to migrate!');
            await mongoose.connection.close();
            return;
        }

        // Transform and migrate each workout
        let migratedCount = 0;
        let skippedCount = 0;

        for (const workout of oldWorkouts) {
            // Skip rest days
            if (workout.isRestDay) {
                console.log(`⏭️  Skipping rest day: ${workout.day} (${workout.date})`);
                skippedCount++;
                continue;
            }

            // Skip if no exercises
            if (!workout.exercises || workout.exercises.length === 0) {
                console.log(`⏭️  Skipping empty workout: ${workout.day} (${workout.date})`);
                skippedCount++;
                continue;
            }

            // Transform exercises to match WorkoutHistory schema
            const transformedExercises = workout.exercises.map(ex => ({
                name: ex.name,
                bodyPart: detectBodyPart(ex.name.toLowerCase()),
                targetSets: ex.sets,
                completedSets: ex.sets, // Assume completed
                targetReps: ex.reps,
                completedReps: ex.reps, // Assume completed
                restTime: 60,
                caloriesBurned: ex.caloriesBurned || 0,
                notes: ''
            }));

            // Create WorkoutHistory entry
            const historyEntry = {
                user: userId,
                routineName: workout.day || 'Workout Session',
                date: new Date(workout.date),
                exercises: transformedExercises,
                totalCaloriesBurned: workout.totalCaloriesBurned || 0,
                duration: workout.duration || 60,
                sessionNotes: `Migrated from ${workout.day} workout plan`
            };

            // Check if this workout was already migrated (by date)
            const workoutDate = new Date(workout.date);
            const existingOnDate = await WorkoutHistory.findOne({
                user: userId,
                date: {
                    $gte: new Date(workoutDate.setHours(0, 0, 0, 0)),
                    $lt: new Date(workoutDate.setHours(23, 59, 59, 999))
                }
            });

            if (existingOnDate) {
                console.log(`⏭️  Skipping duplicate: ${workout.day} (${workout.date}) - already exists`);
                skippedCount++;
                continue;
            }

            // Save to WorkoutHistory
            await WorkoutHistory.create(historyEntry);
            console.log(`✅ Migrated: ${workout.day} (${workout.date}) - ${transformedExercises.length} exercises`);
            migratedCount++;
        }

        console.log('\n' + '='.repeat(60));
        console.log(`\n📊 MIGRATION SUMMARY:`);
        console.log(`   ✅ Migrated: ${migratedCount} workouts`);
        console.log(`   ⏭️  Skipped: ${skippedCount} workouts (duplicates/rest days/empty)`);
        console.log(`   📈 Total in WORKOUT HISTORY: ${existingHistory.length + migratedCount}`);

        // Ask if user wants to delete old workouts
        console.log(`\n⚠️  OLD WORKOUTS STILL IN 'workouts' COLLECTION`);
        console.log(`   To delete them, run:`);
        console.log(`   node src/scripts/cleanup-old-workouts.js ${userId}\n`);

        await mongoose.connection.close();
        console.log('✅ Migration complete! Database connection closed\n');

    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

// Helper function to detect body part from exercise name
function detectBodyPart(name) {
    if (name.includes('chest') || name.includes('bench') || name.includes('press up') || 
        name.includes('pec') || name.includes('fly')) return 'chest';
    
    if (name.includes('back') || name.includes('pull') || name.includes('row') || 
        name.includes('deadlift') || name.includes('lat')) return 'back';
    
    if (name.includes('leg') || name.includes('squat') || name.includes('lunge') || 
        name.includes('calf')) return 'legs';
    
    if (name.includes('shoulder') || name.includes('lateral') || name.includes('delt') || 
        name.includes('overhead')) return 'shoulders';
    
    if (name.includes('bicep') || name.includes('tricep') || name.includes('curl') || 
        name.includes('arm')) return 'arms';
    
    if (name.includes('ab') || name.includes('core') || name.includes('crunch') || 
        name.includes('plank')) return 'abs';
    
    if (name.includes('cardio') || name.includes('run') || name.includes('bike') || 
        name.includes('treadmill')) return 'cardio';
    
    return 'chest'; // Default
}

migrateWorkouts();
