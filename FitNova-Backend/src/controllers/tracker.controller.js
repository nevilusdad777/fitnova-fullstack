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
    
    // Calculate streak - count consecutive days with workouts.
    // IMPORTANT: use Date.UTC() to get today's UTC date regardless of server timezone.
    // setHours(0,0,0,0) uses local timezone (IST on this machine), which would give
    // yesterday's UTC date when converted via toISOString() — causing the loop to
    // start one day too early and miss today's workout entirely.
    let streak = 0;
    const now = new Date();
    // UTC midnight of today — timezone-safe
    let currentUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Helper: find a workout on a given UTC-midnight Date
    const hasWorkoutOnDay = (utcMidnight) => {
      const nextDay = new Date(utcMidnight.getTime() + 24 * 60 * 60 * 1000);
      return WorkoutHistory.findOne({
        user: req.user._id,
        date: { $gte: utcMidnight, $lt: nextDay }
      });
    };

    // If today has no workout yet (day still in progress), start counting from yesterday
    const workoutToday = await hasWorkoutOnDay(currentUTC);
    if (!workoutToday) {
      currentUTC = new Date(currentUTC.getTime() - 24 * 60 * 60 * 1000); // go to yesterday
    }

    while (streak < 365) {
      const workoutOnDay = await hasWorkoutOnDay(currentUTC);
      if (workoutOnDay) {
        streak++;
        currentUTC = new Date(currentUTC.getTime() - 24 * 60 * 60 * 1000); // previous day
      } else {
        break;
      }
    }

    // Compute today's caloriesConsumed live from completed meals only
    const Meal = require('../models/Diet');
    const completedMeals = await Meal.find({
      user: req.user._id,
      date: today,
      completed: true
    });
    const liveCaloriesConsumed = Math.round(
      completedMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0)
    );

    // Build today object with live calories
    const todayData = {
      caloriesConsumed: liveCaloriesConsumed,
      caloriesBurned: todayTracker.caloriesBurned || 0,
      waterIntake: todayTracker.waterIntake || 0,
      weight: todayTracker.weight || user.weight
    };

    res.json({
      today: todayData,
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

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const trackers = await Tracker.find({
      user: req.user._id,
      date: {
        $gte: startDateStr,
        $lte: endDateStr
      }
    }).sort({ date: 1 });

    // Compute caloriesConsumed live from Meal records for accuracy
    const Meal = require('../models/Diet');
    const meals = await Meal.find({
      user: req.user._id,
      date: { $gte: startDateStr, $lte: endDateStr },
      completed: true   // only count meals the user has marked as eaten
    });

    // Build a map of date -> total calories from actual meals
    const calsByDate = {};
    for (const meal of meals) {
      calsByDate[meal.date] = (calsByDate[meal.date] || 0) + (meal.totalCalories || 0);
    }

    // Merge live calories into tracker records
    const result = trackers.map(t => ({
      ...t.toObject(),
      caloriesConsumed: Math.round(calsByDate[t.date] || 0)
    }));

    res.json(result);
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