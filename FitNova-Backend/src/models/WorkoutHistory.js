const mongoose = require('mongoose');

const completedExerciseSchema = new mongoose.Schema({
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise'
    },
    name: {
        type: String,
        required: true
    },
    bodyPart: {
        type: String,
        required: true
    },
    targetSets: {
        type: Number,
        required: true
    },
    completedSets: {
        type: Number,
        required: true,
        default: 0
    },
    targetReps: {
        type: Number,
        required: true
    },
    completedReps: {
        type: Number,
        default: 0
    },
    restTime: {
        type: Number,
        default: 60
    },
    caloriesBurned: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: ''
    }
});

const workoutHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    routineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutRoutine'
    },
    routineName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    exercises: [completedExerciseSchema],
    totalCaloriesBurned: {
        type: Number,
        required: true,
        default: 0
    },
    duration: {
        type: Number,  // in minutes
        required: true,
        default: 0
    },
    completedAt: {
        type: Date,
        default: Date.now
    },
    bodyPartsWorked: [{
        type: String,
        enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio']
    }],
    sessionNotes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
workoutHistorySchema.index({ user: 1, date: -1 });
workoutHistorySchema.index({ user: 1, routineId: 1 });
workoutHistorySchema.index({ user: 1, bodyPartsWorked: 1 });

// Extract body parts worked before saving
workoutHistorySchema.pre('save', function(next) {
    if (this.exercises && this.exercises.length > 0) {
        const bodyParts = new Set();
        this.exercises.forEach(ex => {
            if (ex.bodyPart) {
                bodyParts.add(ex.bodyPart.toLowerCase());
            }
        });
        this.bodyPartsWorked = Array.from(bodyParts);
    }
    next();
});

module.exports = mongoose.model('WorkoutHistory', workoutHistorySchema);
