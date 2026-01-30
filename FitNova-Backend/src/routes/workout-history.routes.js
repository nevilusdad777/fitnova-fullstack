const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth.middleware');
const {
    saveWorkoutSession,
    getWorkoutHistory,
    getWorkoutStats,
    getRecentWorkouts,
    deleteWorkoutHistory
} = require('../controllers/workout-history.controller');

// Validation rules
const workoutSessionValidation = [
    body('routineName')
        .trim()
        .notEmpty()
        .withMessage('Routine name is required'),
    body('exercises')
        .isArray({ min: 1 })
        .withMessage('At least one exercise is required'),
    body('totalCaloriesBurned')
        .isFloat({ min: 0 })
        .withMessage('Total calories burned must be a positive number'),
    body('duration')
        .isInt({ min: 1 })
        .withMessage('Duration must be at least 1 minute')
];

// Routes
// POST /api/workout-history - Save a completed workout session
router.post('/', protect, workoutSessionValidation, saveWorkoutSession);

// GET /api/workout-history - Get workout history with filtering
router.get('/', protect, getWorkoutHistory);

// GET /api/workout-history/stats - Get workout statistics
router.get('/stats', protect, getWorkoutStats);

// GET /api/workout-history/recent - Get recent workouts
router.get('/recent', protect, getRecentWorkouts);

// DELETE /api/workout-history/:id - Delete a workout history entry
router.delete('/:id', protect, deleteWorkoutHistory);

module.exports = router;
