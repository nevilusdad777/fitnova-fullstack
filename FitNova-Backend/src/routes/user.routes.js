const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

router.get('/profile', protect, getProfile);

router.put('/profile', protect, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('age').optional().isInt({ min: 10, max: 120 }).withMessage('Age must be between 10 and 120'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('height').optional().isFloat({ min: 50, max: 300 }).withMessage('Height must be between 50 and 300'),
  body('weight').optional().isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500'),
  body('goal').optional().isIn(['gain', 'loss', 'maintain']).withMessage('Valid goal is required'),
  body('activityLevel').optional().isFloat({ min: 1.2, max: 1.9 }).withMessage('Activity level must be between 1.2 and 1.9'),
  body('waterGoal').optional().isInt({ min: 500, max: 10000 }).withMessage('Water goal must be between 500ml and 10000ml'),
  body('targetWeight').optional().isFloat({ min: 20, max: 500 }).withMessage('Target weight must be between 20 and 500'),
  body('weeklyWorkoutDays').optional().isInt({ min: 0, max: 7 }).withMessage('Weekly workout days must be between 0 and 7'),
  body('pace').optional().isIn(['relaxed', 'normal', 'aggressive']).withMessage('Valid pace is required'),
  body('targetWater').optional().isInt({ min: 500, max: 10000 }).withMessage('Target water must be between 500ml and 10000ml')
], updateProfile);

module.exports = router;