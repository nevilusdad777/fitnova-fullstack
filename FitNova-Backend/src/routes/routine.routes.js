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
    body('exercises')
        .isArray({ min: 1 })
        .withMessage('At least one exercise is required'),
    body('exercises.*.exerciseId')
        .notEmpty()
        .withMessage('Exercise ID is required'),
    body('exercises.*.name')
        .notEmpty()
        .withMessage('Exercise name is required'),
    body('exercises.*.sets')
        .isInt({ min: 1 })
        .withMessage('Sets must be at least 1'),
    body('exercises.*.reps')
        .isInt({ min: 1 })
        .withMessage('Reps must be at least 1'),
    body('exercises.*.restTime')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Rest time must be a positive number')
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
