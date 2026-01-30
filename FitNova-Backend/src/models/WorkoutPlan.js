const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    splitType: {
        type: String,
        enum: ['bro', 'ppl', 'upper-lower', 'full-body', 'custom'],
        required: true
    },
    fitnessLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
    },
    activeDays: [{
        type: Number, // 0-6 for Sunday-Saturday or 1-7 depending on usage
        required: true
    }],
    totalDaysPerWeek: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    schedule: [{
        dayOfWeek: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        exercises: [{
            exerciseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exercise',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            sets: {
                type: Number,
                default: 3
            },
            reps: {
                type: String, // e.g., "8-10"
                default: "10"
            },
            restSeconds: {
                type: Number,
                default: 60
            },
            notes: String
        }]
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
