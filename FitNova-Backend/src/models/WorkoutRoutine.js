const mongoose = require('mongoose');

const routineExerciseSchema = new mongoose.Schema({
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
    },
    name: {
        type: String,
        required: true  // Cached for quick display
    },
    bodyPart: {
        type: String,
        required: true
    },
    sets: {
        type: Number,
        required: true,
        min: 1,
        default: 3
    },
    reps: {
        type: Number,
        required: true,
        min: 1,
        default: 12
    },
    restTime: {
        type: Number,
        required: true,
        default: 60  // seconds
    },
    notes: {
        type: String,
        default: ''
    }
});

const workoutRoutineSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    targetBodyParts: [{
        type: String,
        enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio'],
        lowercase: true
    }],
    exercises: [routineExerciseSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    estimatedDuration: {
        type: Number,  // in minutes
        default: 0
    },
    estimatedCalories: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
workoutRoutineSchema.index({ user: 1, isActive: 1 });
workoutRoutineSchema.index({ user: 1, targetBodyParts: 1 });

// Calculate estimated duration and calories before saving
workoutRoutineSchema.pre('save', function(next) {
    if (this.exercises && this.exercises.length > 0) {
        // Estimate duration: (sets * reps * 3 seconds per rep) + rest time
        this.estimatedDuration = Math.ceil(
            this.exercises.reduce((total, ex) => {
                const exerciseTime = (ex.sets * ex.reps * 3) + (ex.sets * ex.restTime);
                return total + exerciseTime;
            }, 0) / 60  // Convert to minutes
        );

        // Estimate calories: rough estimate based on exercise count and duration
        this.estimatedCalories = Math.ceil(this.estimatedDuration * 5);
    }
    next();
});

module.exports = mongoose.model('WorkoutRoutine', workoutRoutineSchema);
