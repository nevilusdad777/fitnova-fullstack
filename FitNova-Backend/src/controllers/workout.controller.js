const Workout = require('../models/Workout');
const Tracker = require('../models/Tracker');
const { getTodayDate } = require('../utils/calorie.util');
const { validationResult } = require('express-validator');

const getWeeklyPlan = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ day: 1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createWorkout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, day, exercises, duration, isRestDay } = req.body;

    const totalCaloriesBurned = isRestDay ? 0 : exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);

    const workout = await Workout.create({
      user: req.user._id,
      date,
      day,
      exercises: isRestDay ? [] : exercises,
      totalCaloriesBurned,
      duration: duration || 0,
      isRestDay
    });

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWorkout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { exercises, duration, isRestDay } = req.body;

    workout.exercises = isRestDay ? [] : exercises || workout.exercises;
    workout.duration = duration || workout.duration;
    workout.isRestDay = isRestDay !== undefined ? isRestDay : workout.isRestDay;
    workout.totalCaloriesBurned = isRestDay ? 0 : workout.exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);

    const updatedWorkout = await workout.save();
    res.json(updatedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logWorkout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const today = getTodayDate();
    const { caloriesBurned, duration } = req.body;

    let tracker = await Tracker.findOne({ user: req.user._id, date: today });

    if (!tracker) {
      const User = require('../models/User');
      const user = await User.findById(req.user._id);
      tracker = await Tracker.create({
        user: req.user._id,
        date: today,
        caloriesConsumed: 0,
        caloriesBurned: caloriesBurned,
        waterIntake: 0,
        weight: user.weight
      });
    } else {
      tracker.caloriesBurned += caloriesBurned;
      await tracker.save();
    }

    res.json({ message: 'Workout logged successfully', tracker });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWorkoutHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Query WorkoutHistory collection instead of Workout
    const WorkoutHistory = require('../models/WorkoutHistory');
    const workouts = await WorkoutHistory.find({
      user: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });

    // Helper function to extract body part from exercise name
    const getBodyPartFromExerciseName = (exerciseName) => {
      const name = exerciseName.toLowerCase();
      
      // Chest exercises
      if (name.includes('chest') || name.includes('push') || name.includes('bench') || 
          name.includes('press up') || name.includes('pec') || name.includes('fly') || 
          name.includes('dip')) return 'chest';
      
      // Back exercises
      if (name.includes('back') || name.includes('pull') || name.includes('row') || 
          name.includes('deadlift') || name.includes('lat') || name.includes('chin') ||
          name.includes('shrug')) return 'back';
      
      // Leg exercises
      if (name.includes('leg') || name.includes('squat') || name.includes('lunge') || 
          name.includes('calf') || name.includes('thigh') || name.includes('quad') ||
          name.includes('hamstring') || name.includes('glute')) return 'legs';
      
      // Shoulder exercises
      if (name.includes('shoulder') || name.includes('lateral') || name.includes('front raise') ||
          name.includes('rear delt') || name.includes('overhead')) return 'shoulders';
      
      // Arm exercises
      if (name.includes('bicep') || name.includes('tricep') || name.includes('arm') || 
          name.includes('curl') || name.includes('extension') || name.includes('dip')) return 'arms';
      
      // Ab exercises
      if (name.includes('ab') || name.includes('core') || name.includes('crunch') || 
          name.includes('plank') || name.includes('sit up') || name.includes('twist') ||
          name.includes('leg raise')) return 'abs';
      
      // Cardio exercises
      if (name.includes('cardio') || name.includes('run') || name.includes('jog') ||
          name.includes('bike') || name.includes('cycle') || name.includes('treadmill') ||
          name.includes('walk') || name.includes('sprint') || name.includes('burpee') ||
          name.includes('jump') || name.includes('skip')) return 'cardio';
      
      // Default to full body
      return 'full body';
    };

    // Calculate body part frequency and enhance workout objects
    const bodyPartStats = {};
    let totalCaloriesBurned = 0;
    
    const enhancedWorkouts = workouts.map(workout => {
      const workoutObj = workout.toObject();
      const bodyPartsSet = new Set();
      
      if (workout.exercises && workout.exercises.length > 0) {
        workout.exercises.forEach(exercise => {
          const bodyPart = exercise.bodyPart || getBodyPartFromExerciseName(exercise.name);
          bodyPartsSet.add(bodyPart);
          bodyPartStats[bodyPart] = (bodyPartStats[bodyPart] || 0) + 1;
        });
        totalCaloriesBurned += workout.totalCaloriesBurned || 0;
      }
      
      // Add bodyParts array to workout object
      workoutObj.bodyParts = Array.from(bodyPartsSet);
      return workoutObj;
    });

    res.json({
      workouts: enhancedWorkouts,
      analytics: {
        totalWorkouts: workouts.length,
        totalCaloriesBurned,
        bodyPartFrequency: bodyPartStats,
        periodDays: days
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTodayWorkout = async (req, res) => {
  try {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDay = dayNames[today.getDay()];

    const workout = await Workout.findOne({ user: req.user._id, day: todayDay });

    if (workout) {
      res.json(workout);
    } else {
      res.status(404).json({ message: 'No workout planned for today' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWeeklyPlan,
  createWorkout,
  updateWorkout,
  logWorkout,
  getTodayWorkout,
  getWorkoutHistory
};