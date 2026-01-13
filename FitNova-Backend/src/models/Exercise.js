const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    bodyPart: {
        type: String,
        required: true,
        enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio', 'full-body']
    },
    equipment: {
        type: String,
        enum: ['barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'resistance-band', 'none'],
        default: 'none'
    },
    targetMuscle: {
        type: String,
        default: ''
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    instructions: [{
        type: String
    }],
    defaultSets: {
        type: Number,
        default: 3
    },
    defaultReps: {
        type: Number,
        default: 12
    },
    caloriesPerMinute: {
        type: Number,
        default: 5
    },
    gifUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

exerciseSchema.index({ name: 'text' });
exerciseSchema.index({ bodyPart: 1, difficulty: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
