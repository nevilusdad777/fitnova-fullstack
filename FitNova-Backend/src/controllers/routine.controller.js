const WorkoutRoutine = require('../models/WorkoutRoutine');
const { validationResult } = require('express-validator');

// Create a new workout routine
const createRoutine = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, targetBodyParts, exercises } = req.body;

        const routine = await WorkoutRoutine.create({
            user: req.user._id,
            name,
            description,
            targetBodyParts,
            exercises
        });

        res.status(201).json({
            success: true,
            data: routine,
            message: 'Routine created successfully'
        });
    } catch (error) {
        console.error('Error creating routine:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get all routines for the user
const getRoutines = async (req, res) => {
    try {
        const { bodyPart, isActive } = req.query;
        
        const query = { user: req.user._id };
        
        if (bodyPart) {
            query.targetBodyParts = bodyPart.toLowerCase();
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const routines = await WorkoutRoutine.find(query)
            .sort({ createdAt: -1 })
            .populate('exercises.exerciseId', 'name bodyPart difficulty');

        res.json({
            success: true,
            data: routines,
            count: routines.length
        });
    } catch (error) {
        console.error('Error fetching routines:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get a specific routine by ID
const getRoutineById = async (req, res) => {
    try {
        const routine = await WorkoutRoutine.findById(req.params.id)
            .populate('exercises.exerciseId', 'name bodyPart difficulty description');

        if (!routine) {
            return res.status(404).json({ 
                success: false,
                message: 'Routine not found' 
            });
        }

        // Check if routine belongs to user
        if (routine.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to access this routine' 
            });
        }

        res.json({
            success: true,
            data: routine
        });
    } catch (error) {
        console.error('Error fetching routine:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Update a routine
const updateRoutine = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const routine = await WorkoutRoutine.findById(req.params.id);

        if (!routine) {
            return res.status(404).json({ 
                success: false,
                message: 'Routine not found' 
            });
        }

        // Check if routine belongs to user
        if (routine.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to update this routine' 
            });
        }

        const { name, description, targetBodyParts, exercises, isActive } = req.body;

        if (name) routine.name = name;
        if (description !== undefined) routine.description = description;
        if (targetBodyParts) routine.targetBodyParts = targetBodyParts;
        if (exercises) routine.exercises = exercises;
        if (isActive !== undefined) routine.isActive = isActive;

        const updatedRoutine = await routine.save();

        res.json({
            success: true,
            data: updatedRoutine,
            message: 'Routine updated successfully'
        });
    } catch (error) {
        console.error('Error updating routine:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Delete a routine
const deleteRoutine = async (req, res) => {
    try {
        const routine = await WorkoutRoutine.findById(req.params.id);

        if (!routine) {
            return res.status(404).json({ 
                success: false,
                message: 'Routine not found' 
            });
        }

        // Check if routine belongs to user
        if (routine.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to delete this routine' 
            });
        }

        await WorkoutRoutine.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Routine deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting routine:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Set a routine as active (can have multiple active routines)
const toggleRoutineActive = async (req, res) => {
    try {
        const routine = await WorkoutRoutine.findById(req.params.id);

        if (!routine) {
            return res.status(404).json({ 
                success: false,
                message: 'Routine not found' 
            });
        }

        // Check if routine belongs to user
        if (routine.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to modify this routine' 
            });
        }

        routine.isActive = !routine.isActive;
        await routine.save();

        res.json({
            success: true,
            data: routine,
            message: `Routine ${routine.isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Error toggling routine status:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

module.exports = {
    createRoutine,
    getRoutines,
    getRoutineById,
    updateRoutine,
    deleteRoutine,
    toggleRoutineActive
};
