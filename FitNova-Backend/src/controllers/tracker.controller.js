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
    // Use start of current week (Monday 00:00:00 UTC) so only this week's workouts are counted
    const WorkoutHistory = require('../models/WorkoutHistory');
    const weekNow = new Date();
    const dayOfWeek = weekNow.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // days since last Monday
    const startOfWeek = new Date(Date.UTC(weekNow.getUTCFullYear(), weekNow.getUTCMonth(), weekNow.getUTCDate() - daysFromMonday));
    
    const weeklyWorkoutHistory = await WorkoutHistory.find({
      user: req.user._id,
      date: { $gte: startOfWeek }
    }).sort({ date: -1 });

    const weeklyWorkouts = weeklyWorkoutHistory.length;
    
    // Calculate streak - count consecutive days with workouts and rest days.
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

    // Get active WorkoutPlan to check for rest days
    const WorkoutPlan = require('../models/WorkoutPlan');
    const activePlan = await WorkoutPlan.findOne({ user: req.user._id, isActive: true });
    const workoutDays = new Set();
    if (activePlan && activePlan.schedule) {
      activePlan.schedule.forEach(s => {
        if (s.dayOfWeek !== undefined) {
          workoutDays.add(s.dayOfWeek);
        }
      });
    }

    let tempStreak = 0;
    let foundRealWorkout = false;

    // Check up to 365 days in the past
    for (let i = 0; i < 365; i++) {
      const workoutOnDay = await hasWorkoutOnDay(currentUTC);
      const isToday = i === 0;
      const currentDayOfWeek = currentUTC.getUTCDay(); // 0 (Sunday) to 6 (Saturday)
      
      // If the day is NOT in workoutDays, it's a rest day. (If no active plan, we assume every day is a workout day until told otherwise, or assume no rest days. We will assume no rest days if workoutDays is empty to be safe.)
      const isRestDay = activePlan && activePlan.schedule && activePlan.schedule.length > 0 ? !workoutDays.has(currentDayOfWeek) : false;

      if (workoutOnDay) {
        tempStreak++;
        foundRealWorkout = true;
      } else if (isRestDay) {
        // No workout, but it's a rest day -> continues streak
        tempStreak++;
      } else {
        // No workout, not a rest day -> breaks streak (unless today and still in progress)
        if (!isToday) {
          break;
        }
      }

      currentUTC = new Date(currentUTC.getTime() - 24 * 60 * 60 * 1000);
    }

    // Only assign streak if we found an actual workout to avoid infinite rest-day streaks
    if (foundRealWorkout) {
      streak = tempStreak;
    } else {
      streak = 0;
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

    // Compute today's caloriesBurned live from WorkoutHistory
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);
    
    const todaysWorkouts = await WorkoutHistory.find({
      user: req.user._id,
      date: { $gte: startOfToday, $lte: endOfToday }
    });
    
    // Let's add manually logged tracker calories as a fallback, but cap it so we don't duplicate. Actually it's cleaner to just rely on WorkoutHistory now
    const liveCaloriesBurned = Math.round(
      todaysWorkouts.reduce((sum, w) => sum + (w.totalCaloriesBurned || 0), 0)
    );

    // Build today object with live calories
    const todayData = {
      caloriesConsumed: liveCaloriesConsumed > 0 ? liveCaloriesConsumed : (todayTracker.caloriesConsumed || 0),
      caloriesBurned: liveCaloriesBurned > 0 ? liveCaloriesBurned : (todayTracker.caloriesBurned || 0),
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

    // Compute caloriesBurned live from WorkoutHistory records for accuracy
    const WorkoutHistory = require('../models/WorkoutHistory');
    const workoutRecords = await WorkoutHistory.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const burnedByDate = {};
    for (const w of workoutRecords) {
      // Convert to local YYYY-MM-DD
      const localDate = new Date(w.date.getTime() - (w.date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      burnedByDate[localDate] = (burnedByDate[localDate] || 0) + (w.totalCaloriesBurned || 0);
    }

    // Merge live calories into tracker records
    const result = trackers.map(t => ({
      ...t.toObject(),
      caloriesConsumed: calsByDate[t.date] > 0 ? Math.round(calsByDate[t.date]) : (t.caloriesConsumed || 0),
      caloriesBurned: burnedByDate[t.date] > 0 ? Math.round(burnedByDate[t.date]) : (t.caloriesBurned || 0)
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