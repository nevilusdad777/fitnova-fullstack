const Tracker = require('../models/Tracker');
const User = require('../models/User');
const { getTodayDate } = require('../utils/calorie.util');
const { validationResult } = require('express-validator');

const getTodayTracker = async (req, res) => {
  try {
    const today = getTodayDate();
    const user = await User.findById(req.user._id);

    let tracker = await Tracker.findOne({ user: req.user._id, date: today });

    if (!tracker) {
      tracker = await Tracker.create({
        user: req.user._id,
        date: today,
        caloriesConsumed: 0,
        caloriesBurned: 0,
        waterIntake: 0,
        weight: user.weight
      });
    }

    res.json(tracker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWaterIntake = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const today = getTodayDate();
    const { amount } = req.body;

    let tracker = await Tracker.findOne({ user: req.user._id, date: today });

    if (!tracker) {
      const user = await User.findById(req.user._id);
      tracker = await Tracker.create({
        user: req.user._id,
        date: today,
        caloriesConsumed: 0,
        caloriesBurned: 0,
        waterIntake: amount,
        weight: user.weight
      });
    } else {
      tracker.waterIntake += amount;
      await tracker.save();
    }

    res.json(tracker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWeight = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const today = getTodayDate();
    const { weight } = req.body;

    let tracker = await Tracker.findOne({ user: req.user._id, date: today });

    if (!tracker) {
      tracker = await Tracker.create({
        user: req.user._id,
        date: today,
        caloriesConsumed: 0,
        caloriesBurned: 0,
        waterIntake: 0,
        weight: weight
      });
    } else {
      tracker.weight = weight;
      await tracker.save();
    }

    const user = await User.findById(req.user._id);
    user.weight = weight;
    await user.save();

    res.json(tracker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const today = getTodayDate();
    const user = await User.findById(req.user._id);

    // Today's summary
    let todayTracker = await Tracker.findOne({ user: req.user._id, date: today });
    if (!todayTracker) {
      todayTracker = { caloriesConsumed: 0, caloriesBurned: 0, waterIntake: 0, weight: user.weight };
    }

    // Weekly activity - Get from WorkoutHistory for consistency
    const WorkoutHistory = require('../models/WorkoutHistory');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const weeklyWorkoutHistory = await WorkoutHistory.find({
      user: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    const weeklyWorkouts = weeklyWorkoutHistory.length;
    
    // Calculate streak - count consecutive days with workouts
    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const workoutOnDay = await WorkoutHistory.findOne({
        user: req.user._id,
        date: {
          $gte: new Date(dateStr),
          $lt: new Date(new Date(dateStr).setDate(new Date(dateStr).getDate() + 1))
        }
      });
      
      if (workoutOnDay) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
      
      // Limit to prevent infinite loops
      if (streak >= 365) break;
    }

    res.json({
      today: todayTracker,
      weeklyWorkouts,
      streak,
      totalWorkoutsCompleted: user.totalWorkoutsCompleted || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrackerHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trackers = await Tracker.find({
      user: req.user._id,
      date: {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      }
    }).sort({ date: 1 });

    res.json(trackers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTodayTracker,
  updateWaterIntake,
  updateWeight,
  getTrackerHistory,
  getDashboardStats
};