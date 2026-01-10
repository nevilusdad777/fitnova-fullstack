const User = require('../models/User');
const { calculateBMR, calculateTDEE, calculateDailyCalorieTarget } = require('../utils/bmr.util');
const { validationResult } = require('express-validator');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.age = req.body.age || user.age;
      user.gender = req.body.gender || user.gender;
      user.height = req.body.height || user.height;
      user.weight = req.body.weight || user.weight;
      user.goal = req.body.goal || user.goal;
      user.activityLevel = req.body.activityLevel || user.activityLevel;
      
      if (req.body.preferences) {
        user.preferences = req.body.preferences;
      }

      const bmr = calculateBMR(user.weight, user.height, user.age, user.gender);
      const tdee = calculateTDEE(bmr, user.activityLevel);
      const dailyCalorieTarget = calculateDailyCalorieTarget(tdee, user.goal);

      user.bmr = bmr;
      user.tdee = tdee;
      user.dailyCalorieTarget = dailyCalorieTarget;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        height: updatedUser.height,
        weight: updatedUser.weight,
        goal: updatedUser.goal,
        activityLevel: updatedUser.activityLevel,
        preferences: updatedUser.preferences,
        bmr: updatedUser.bmr,
        tdee: updatedUser.tdee,
        dailyCalorieTarget: updatedUser.dailyCalorieTarget
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile
};