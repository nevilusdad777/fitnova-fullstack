const express = require('express');
const router = express.Router();
const { getWeeklyPlan, createWorkout, updateWorkout, logWorkout, getTodayWorkout } = require('../controllers/workout.controller');
const { protect } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

router.get('/weekly', protect, getWeeklyPlan);
router.get('/today', protect, getTodayWorkout);

router.post('/create', protect, [
  body('day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Valid day is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('isRestDay').isBoolean().withMessage('isRestDay must be boolean')
], createWorkout);

router.put('/:id', protect, updateWorkout);

router.post('/log', protect, [
  body('caloriesBurned').isFloat({ min: 0 }).withMessage('Calories burned must be at least 0'),
  body('duration').isInt({ min: 0 }).withMessage('Duration must be at least 0')
], logWorkout);

module.exports = router;