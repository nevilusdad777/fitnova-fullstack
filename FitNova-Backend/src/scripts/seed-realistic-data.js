require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Tracker = require('../models/Tracker');
const WorkoutHistory = require('../models/WorkoutHistory');
const WorkoutRoutine = require('../models/WorkoutRoutine');
const Exercise = require('../models/Exercise');

const seedRealisticData = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitnova', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected.');

        const email = 'test@fitnova.com';
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User ${email} not found.`);
            process.exit(1);
        }

        console.log(`Generating realistic data for ${user.name}`);

        // Try to get user's active workout routine
        const routine = await WorkoutRoutine.findOne({ user: user._id, isActive: true });
        
        let routineExercisesMap = new Map();
        let fallbackExercises = [];
        
        if (routine && routine.schedule && routine.schedule.length > 0) {
            console.log(`Found active routine: ${routine.name}`);
            routine.schedule.forEach(day => {
                const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day.day);
                if (!day.isRestDay && day.exercises && day.exercises.length > 0) {
                    routineExercisesMap.set(dayIndex, {
                        name: routine.name,
                        id: routine._id,
                        exercises: day.exercises
                    });
                }
            });
        } else {
            console.log('No active workout routine found. Using fallback realistic schedule.');
            // Fallback: Fetch a few exercises
            fallbackExercises = await Exercise.find().limit(15);
        }

        const today = new Date();
        const daysToSeed = 30;
        
        let currentWeight = user.weight || 75;
        const dailyCalorieTarget = user.dailyCalorieTarget || 2200;
        const waterGoalML = user.waterGoal || 3000;
        
        // Convert to Liters as UI expects waterIntake in Liters, e.g., 2.5
        const waterGoalLiters = waterGoalML / 1000;

        console.log('Clearing old data from the last 30 days...');
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - daysToSeed);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        await WorkoutHistory.deleteMany({
            user: user._id,
            date: { $gte: thirtyDaysAgo }
        });

        // Tracker date strings are YYYY-MM-DD
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
        await Tracker.deleteMany({
            user: user._id,
            date: { $gte: thirtyDaysAgoStr }
        });

        console.log('Generating new Tracker and WorkoutHistory data...');

        for (let i = daysToSeed; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            // Fix local timezone offset for dateStr
            const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

            // 1. Strict Sunday Rest Day
            const isSunday = dayOfWeek === 0;

            // 2. Determine Workout Schedule
            let isWorkoutDay = false;
            let dayRoutine = null;

            if (!isSunday) {
                // Force all non-Sunday days to be workout days as requested
                isWorkoutDay = true;
                if (routineExercisesMap.has(dayOfWeek)) {
                    dayRoutine = routineExercisesMap.get(dayOfWeek);
                }
            }

            // Base calories will be adjusted so total is around 1000
            let baseCaloriesBurned = isWorkoutDay ? 600 : 900; 
            let workoutCalories = 0;

            // 4. Generate Workout History if it's a workout day
            if (isWorkoutDay) {
                let exercisesList = [];
                let routineName = 'Custom Generated Workout';
                let routineId = null;

                if (dayRoutine) {
                    exercisesList = dayRoutine.exercises.map(ex => ({
                        exerciseId: ex.exerciseId,
                        name: ex.name,
                        bodyPart: ex.bodyPart,
                        targetSets: ex.sets || 3,
                        completedSets: ex.sets || 3,
                        targetReps: ex.reps || 10,
                        completedReps: ex.reps || 10,
                        restTime: ex.restTime || 60,
                        caloriesBurned: ((ex.sets || 3) * 15), // e.g., 45 cal per exercise
                        notes: 'Felt strong.'
                    }));
                    routineName = dayRoutine.name;
                    routineId = dayRoutine.id;
                } else if (fallbackExercises.length > 0) {
                    // Grab 4-6 exercises randomly
                    const shuffled = fallbackExercises.sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, 5);
                    exercisesList = selected.map(ex => {
                        const sets = 3;
                        return {
                            exerciseId: ex._id,
                            name: ex.name,
                            bodyPart: ex.bodyPart || 'cardio',
                            targetSets: sets,
                            completedSets: sets,
                            targetReps: 12,
                            completedReps: 12,
                            restTime: 60,
                            caloriesBurned: sets * 18, // ~54 cal per exercise
                            notes: 'Good execution.'
                        };
                    });
                }

                if (exercisesList.length > 0) {
                    let totalWorkoutDuration = exercisesList.length * 10; // ~10 min per exercise
                    let bodyPartsWorked = new Set(exercisesList.map(e => {
                        let bp = (e.bodyPart || '').toLowerCase();
                        if (bp === 'biceps' || bp === 'triceps') return 'arms';
                        if (['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'].includes(bp)) return bp;
                        return 'arms';
                    }));

                    workoutCalories = exercisesList.reduce((sum, e) => sum + e.caloriesBurned, 0);

                    const historyEntry = new WorkoutHistory({
                        user: user._id,
                        routineId: routineId,
                        routineName: routineName,
                        date: date,
                        exercises: exercisesList,
                        totalCaloriesBurned: workoutCalories,
                        duration: totalWorkoutDuration,
                        completedAt: date,
                        bodyPartsWorked: Array.from(bodyPartsWorked),
                        sessionNotes: 'Completed successfully.'
                    });
                    
                    await historyEntry.save();
                }
            }

            const totalCaloriesBurned = Math.floor(baseCaloriesBurned + workoutCalories + (Math.random() * 200 - 100)); // Around 1000

            // 5. Generate Calories Consumed
            // Fluctuate around 1800 to 2000
            const caloriesConsumed = Math.floor(1800 + Math.random() * 200);

            // 6. Generate Water Intake (in Liters)
            // Needs to be e.g., 2.5, 3.2, etc. NOT 3500. UI handles it as Liters.
            const waterVariationLiters = (Math.random() - 0.5) * 1.5; // +/- 0.75 L
            let waterIntakeLiters = waterGoalLiters + waterVariationLiters;
            if (waterIntakeLiters < 1.0) waterIntakeLiters = 1.0;
            if (waterIntakeLiters > 6.0) waterIntakeLiters = 6.0;

            // Optional: drink slightly less on rest days or weekends usually
            if (isSunday) {
                waterIntakeLiters *= 0.8;
            }

            waterIntakeLiters = parseFloat(waterIntakeLiters.toFixed(1)); // 1 decimal place

            // 7. Generate Weight
            const weightDelta = (Math.random() - 0.5) * 0.4;
            currentWeight = parseFloat((currentWeight + weightDelta).toFixed(1));

            // Upsert Tracker
            await Tracker.findOneAndUpdate(
                { user: user._id, date: dateStr },
                {
                    caloriesConsumed: Math.max(0, caloriesConsumed),
                    caloriesBurned: Math.max(0, totalCaloriesBurned),
                    waterIntake: waterIntakeLiters,
                    weight: currentWeight
                },
                { upsert: true, new: true }
            );
        }

        console.log('Successfully seeded 30 days of realistic data!');
        user.weight = currentWeight;
        const totalWorkouts = await WorkoutHistory.countDocuments({ user: user._id });
        user.totalWorkoutsCompleted = totalWorkouts;
        await user.save();

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

seedRealisticData();
