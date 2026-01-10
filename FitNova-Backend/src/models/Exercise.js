const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    bodyPart: {
        type: String,
        required: true,
        enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio']
    },
    defaultSets: {
        type: Number,
        default: 3
    },
    defaultReps: {
        type: Number,
        default: 12
    },
    caloriesPerMinute: { // Estimate for calculation
        type: Number,
        default: 5
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Exercise', exerciseSchema);
