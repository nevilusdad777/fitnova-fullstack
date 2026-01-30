const WorkoutHistory = require('../models/WorkoutHistory');
const Tracker = require('../models/Tracker');
const { getTodayDate } = require('../utils/calorie.util');
const { validationResult } = require('express-validator');

// Save a completed workout session
const saveWorkoutSession = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { 
            routineId, 
            routineName, 
            exercises, 
            totalCaloriesBurned, 
            duration,
            sessionNotes 
        } = req.body;

        const workoutHistory = await WorkoutHistory.create({
            user: req.user._id,
            routineId,
            routineName,
            exercises,
            totalCaloriesBurned,
            duration,
            sessionNotes,
            date: new Date()
        });

        // Update tracker with calories burned
        const today = getTodayDate();
        let tracker = await Tracker.findOne({ user: req.user._id, date: today });

        if (!tracker) {
            const User = require('../models/User');
            const user = await User.findById(req.user._id);
            tracker = await Tracker.create({
                user: req.user._id,
                date: today,
                caloriesConsumed: 0,
                caloriesBurned: totalCaloriesBurned,
                waterIntake: 0,
                weight: user.weight
            });
        } else {
            tracker.caloriesBurned += totalCaloriesBurned;
            await tracker.save();
        }

        // Increment user's total workouts completed
        try {
            const User = require('../models/User');
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { totalWorkoutsCompleted: 1 }
            });
            console.log('User total workouts incremented successfully');
        } catch (userUpdateError) {
            console.error('Error incrementing user workout count:', userUpdateError);
            // Don't fail the whole request if this update fails
        }

        res.status(201).json({
            success: true,
            data: workoutHistory,
            message: 'Workout session saved successfully'
        });
    } catch (error) {
        console.error('Error saving workout session:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get workout history with filtering
const getWorkoutHistory = async (req, res) => {
    try {
        const { 
            startDate, 
            endDate, 
            bodyPart, 
            routineId,
            limit = 50,
            page = 1
        } = req.query;

        const query = { user: req.user._id };

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }
        }

        // Body part filter
        if (bodyPart) {
            query.bodyPartsWorked = bodyPart.toLowerCase();
        }

        // Routine filter
        if (routineId) {
            query.routineId = routineId;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const workouts = await WorkoutHistory.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .populate('routineId', 'name targetBodyParts');

        const total = await WorkoutHistory.countDocuments(query);

        res.json({
            success: true,
            data: workouts,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching workout history:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get workout statistics
const getWorkoutStats = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const workouts = await WorkoutHistory.find({
            user: req.user._id,
            date: { $gte: startDate }
        });

        // Calculate statistics
        const totalWorkouts = workouts.length;
        const totalCalories = workouts.reduce((sum, w) => sum + w.totalCaloriesBurned, 0);
        const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
        const avgCaloriesPerWorkout = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;
        const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

        // Body part frequency
        const bodyPartFrequency = {};
        workouts.forEach(workout => {
            if (workout.bodyPartsWorked) {
                workout.bodyPartsWorked.forEach(part => {
                    bodyPartFrequency[part] = (bodyPartFrequency[part] || 0) + 1;
                });
            }
        });

        // Most used routines
        const routineUsage = {};
        workouts.forEach(workout => {
            if (workout.routineName) {
                routineUsage[workout.routineName] = (routineUsage[workout.routineName] || 0) + 1;
            }
        });

        // Workout frequency by day of week
        const dayFrequency = {
            Sunday: 0,
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0
        };

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        workouts.forEach(workout => {
            const dayName = dayNames[new Date(workout.date).getDay()];
            dayFrequency[dayName]++;
        });

        res.json({
            success: true,
            data: {
                periodDays: parseInt(days),
                totalWorkouts,
                totalCalories,
                totalDuration,
                avgCaloriesPerWorkout,
                avgDuration,
                bodyPartFrequency,
                routineUsage,
                dayFrequency,
                recentWorkouts: workouts.slice(0, 5).map(w => ({
                    date: w.date,
                    routineName: w.routineName,
                    duration: w.duration,
                    calories: w.totalCaloriesBurned
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching workout stats:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get recent workouts (last N workouts)
const getRecentWorkouts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const workouts = await WorkoutHistory.find({ user: req.user._id })
            .sort({ date: -1 })
            .limit(parseInt(limit))
            .populate('routineId', 'name targetBodyParts');

        res.json({
            success: true,
            data: workouts
        });
    } catch (error) {
        console.error('Error fetching recent workouts:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Delete a workout history entry
const deleteWorkoutHistory = async (req, res) => {
    try {
        const workout = await WorkoutHistory.findById(req.params.id);

        if (!workout) {
            return res.status(404).json({ 
                success: false,
                message: 'Workout history not found' 
            });
        }

        // Check if workout belongs to user
        if (workout.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to delete this workout' 
            });
        }

        await WorkoutHistory.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Workout history deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting workout history:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

module.exports = {
    saveWorkoutSession,
    getWorkoutHistory,
    getWorkoutStats,
    getRecentWorkouts,
    deleteWorkoutHistory
};
