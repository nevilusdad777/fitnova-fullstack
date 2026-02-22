const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth.middleware');
const {
    createRoutine,
    getRoutines,
    getRoutineById,
    updateRoutine,
    deleteRoutine,
    toggleRoutineActive
} = require('../controllers/routine.controller');

// Validation rules
const routineValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Routine name is required')
        .isLength({ max: 100 })
        .withMessage('Routine name must be less than 100 characters'),
    body('targetBodyParts')
        .optional()
        .isArray()
        .withMessage('Target body parts must be an array'),
    body('schedule')
        .isArray()
        .withMessage('Schedule must be an array'),
    body('schedule.*.day')
        .notEmpty()
        .withMessage('Day is required')
        .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
        .withMessage('Invalid day'),
    body('schedule.*.exercises')
        .optional()
        .isArray()
        .withMessage('Exercises must be an array'),
    body('schedule.*.exercises.*.exerciseId')
        .notEmpty()
        .withMessage('Exercise ID is required'),
    body('schedule.*.exercises.*.name')
        .notEmpty()
        .withMessage('Exercise name is required'),
    body('schedule.*.exercises.*.sets')
        .isInt({ min: 1 })
        .withMessage('Sets must be at least 1'),
    body('schedule.*.exercises.*.reps')
        .isInt({ min: 1 })
        .withMessage('Reps must be at least 1')
];

// Routes
// GET /api/routines - Get all routines for the user
router.get('/', protect, getRoutines);

// GET /api/routines/:id - Get a specific routine
router.get('/:id', protect, getRoutineById);

// POST /api/routines - Create a new routine
router.post('/', protect, routineValidation, createRoutine);

// PUT /api/routines/:id - Update a routine
router.put('/:id', protect, routineValidation, updateRoutine);

// DELETE /api/routines/:id - Delete a routine
router.delete('/:id', protect, deleteRoutine);

// PATCH /api/routines/:id/toggle - Toggle routine active status
router.patch('/:id/toggle', protect, toggleRoutineActive);

module.exports = router;
