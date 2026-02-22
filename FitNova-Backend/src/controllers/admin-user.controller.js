const User = require('../models/User');
const WorkoutRoutine = require('../models/WorkoutRoutine');
const WorkoutHistory = require('../models/WorkoutHistory');
const Diet = require('../models/Diet');
const { calculateBMR, calculateTDEE, calculateDailyCalorieTarget } = require('../utils/bmr.util');

// @desc    Get all users with pagination and search
// @route   GET /admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const goal = req.query.goal || '';
    const gender = req.query.gender || '';

    const skip = (page - 1) * limit;

    // Build query to exclude any rogue 'admin' accounts left over in the User collection
    let query = { role: { $ne: 'admin' } };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (goal) {
      query.goal = goal;
    }

    if (gender) {
      query.gender = gender;
    }

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user by ID
// @route   GET /admin/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    const allowedUpdates = [
      'name', 'email', 'age', 'gender', 'height', 'weight', 
      'goal', 'waterGoal'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Explicitly recalculate metabolic metrics after potential weight/height/age/goal changes
    user.bmr = calculateBMR(user.weight, user.height, user.age, user.gender);
    user.tdee = calculateTDEE(user.bmr, user.activityLevel);
    user.dailyCalorieTarget = calculateDailyCalorieTarget(user.tdee, user.goal);

    const updatedUser = await user.save();

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user statistics
// @route   GET /admin/users/stats/overview
// @access  Private (Admin)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const maleUsers = await User.countDocuments({ gender: 'male', role: { $ne: 'admin' } });
    const femaleUsers = await User.countDocuments({ gender: 'female', role: { $ne: 'admin' } });
    
    const goalStats = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      {
        $group: {
          _id: '$goal',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      genderDistribution: {
        male: maleUsers,
        female: femaleUsers,
        other: totalUsers - maleUsers - femaleUsers
      },
      goalDistribution: goalStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's workout routines
// @route   GET /admin/users/:id/routines
// @access  Private (Admin)
const getUserRoutines = async (req, res) => {
  try {
    const routines = await WorkoutRoutine.find({ user: req.params.id })
      .populate('exercises.exercise')
      .sort({ createdAt: -1 });

    res.json(routines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's workout history
// @route   GET /admin/users/:id/workouts
// @access  Private (Admin)
const getUserWorkoutHistory = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const matchQuery = { user: new mongoose.Types.ObjectId(req.params.id) };
    
    // Add date filtering if days parameter is provided
    if (req.query.days) {
      const days = parseInt(req.query.days);
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);
      matchQuery.date = { $gte: daysAgo };
    }

    const workouts = await WorkoutHistory.aggregate([
      { $match: matchQuery },
      { $sort: { date: -1 } }
    ]);

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's diet logs
// @route   GET /admin/users/:id/diet
// @access  Private (Admin)
const getUserDiet = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const matchQuery = { user: new mongoose.Types.ObjectId(req.params.id) };

    const meals = await Diet.aggregate([
      { $match: matchQuery },
      { $sort: { date: -1 } }
    ]);
    
    // Group meals by date
    const grouped = {};
    meals.forEach(meal => {
      const tc = meal.totalCalories || 0;
      const tp = meal.totalProtein || 0;
      const tcbs = meal.totalCarbs || 0;
      const tf = meal.totalFat || 0;
      
      if (!grouped[meal.date]) {
        grouped[meal.date] = {
          date: meal.date,
          calorieTarget: 0, 
          totalCalories: tc,
          totalProtein: tp,
          totalCarbs: tcbs,
          totalFat: tf,
          meals: [meal]
        };
      } else {
        grouped[meal.date].totalCalories += tc;
        grouped[meal.date].totalProtein += tp;
        grouped[meal.date].totalCarbs += tcbs;
        grouped[meal.date].totalFat += tf;
        grouped[meal.date].meals.push(meal);
      }
    });

    const user = await User.findById(req.params.id);
    const target = user ? user.dailyCalorieTarget : 2000;

    let dietLogs = Object.values(grouped);
    
    // Sort array descending (newest first)
    dietLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter by days
    if (req.query.days) {
      const days = parseInt(req.query.days);
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);
      dietLogs = dietLogs.filter(log => new Date(log.date) >= daysAgo);
    } else {
      dietLogs = dietLogs.slice(0, 14); // Default 14 days
    }

    dietLogs = dietLogs.map(log => {
      log.calorieTarget = target;
      return log;
    });

    res.json(dietLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user's workout history entry
// @route   DELETE /admin/users/:userId/workouts/:workoutId
// @access  Private (Admin)
const deleteUserWorkout = async (req, res) => {
  try {
    const workout = await WorkoutHistory.findOne({
      _id: req.params.workoutId,
      user: req.params.userId
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout record not found' });
    }

    await WorkoutHistory.findByIdAndDelete(req.params.workoutId);
    res.json({ message: 'Workout record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user's diet logs for a specific date
// @route   DELETE /admin/users/:userId/diet/:date
// @access  Private (Admin)
const deleteUserDiet = async (req, res) => {
  try {
    // Determine the date to delete (assuming format YYYY-MM-DD)
    const dateStr = req.params.date;
    
    const result = await Diet.deleteMany({
      user: req.params.userId,
      date: dateStr
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No diet logs found for this date' });
    }

    res.json({ message: `Deleted ${result.deletedCount} diet log entries` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  getUserRoutines,
  getUserWorkoutHistory,
  getUserDiet,
  deleteUserWorkout,
  deleteUserDiet
};
