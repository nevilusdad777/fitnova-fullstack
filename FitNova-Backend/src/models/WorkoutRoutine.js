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
    schedule: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        isRestDay: {
            type: Boolean,
            default: false
        },
        exercises: [routineExerciseSchema]
    }],
    // Legacy support (optional, can be removed if specific migration script is run)
    exercises: {
        type: [routineExerciseSchema],
        default: undefined
    },
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
    if (this.schedule && this.schedule.length > 0) {
        // Estimate duration: Sum of all exercises across all days
        let totalDuration = 0;
        
        this.schedule.forEach(day => {
            if (!day.isRestDay && day.exercises) {
                const dayDuration = day.exercises.reduce((total, ex) => {
                    const exerciseTime = (ex.sets * ex.reps * 3) + (ex.sets * ex.restTime);
                    return total + exerciseTime;
                }, 0);
                totalDuration += dayDuration;
            }
        });
        
        // Average daily duration (excluding rest days)
        const activeDays = this.schedule.filter(d => !d.isRestDay).length || 1;
        this.estimatedDuration = Math.ceil((totalDuration / activeDays) / 60); // Average minutes per workout

        // Estimate calories: rough estimate based on exercise count and duration
        this.estimatedCalories = Math.ceil(this.estimatedDuration * 5);
    }
    next();
});

module.exports = mongoose.model('WorkoutRoutine', workoutRoutineSchema);
