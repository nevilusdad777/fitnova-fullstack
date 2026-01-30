const User = require('../models/User');
const Workout = require('../models/Workout');
const Diet = require('../models/Diet');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Diet = require('../models/Diet');
const Exercise = require('../models/Exercise');
const Food = require('../models/Food');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const workoutCount = await Workout.countDocuments(); // User created workouts
    const dietCount = await Diet.countDocuments();
    const exerciseCount = await Exercise.countDocuments(); // System exercises

    // Create a mock revenue for now as there is no payment model yet
    const revenue = userCount * 120; 

    res.json({
      totalUsers: userCount,
      activeWorkouts: workoutCount + exerciseCount, 
      totalDietPlans: dietCount,
      revenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all exercises
// @route   GET /api/admin/exercises
// @access  Private/Admin
const getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find({});
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all foods
// @route   GET /api/admin/foods
// @access  Private/Admin
const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find({});
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getDashboardStats,
  getAllExercises,
  getAllFoods
};
