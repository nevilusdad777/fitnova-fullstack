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
  getTodayWorkout
};