const express = require('express');
const router = express.Router();
const { getTodayTracker, updateWaterIntake, updateWeight, getTrackerHistory, getDashboardStats } = require('../controllers/tracker.controller');
const { protect } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

router.get('/today', protect, getTodayTracker);
router.get('/stats', protect, getDashboardStats);
router.get('/history', protect, getTrackerHistory);

router.post('/water', protect, [
  body('amount').isFloat().withMessage('Amount must be a number')
], updateWaterIntake);

router.post('/weight', protect, [
  body('weight').isFloat({ min: 1 }).withMessage('Weight must be at least 1')
], updateWeight);

module.exports = router;