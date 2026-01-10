const mongoose = require('mongoose');

const trackerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  caloriesConsumed: {
    type: Number,
    default: 0,
    min: 0
  },
  caloriesBurned: {
    type: Number,
    default: 0,
    min: 0
  },
  waterIntake: {
    type: Number,
    default: 0,
    min: 0
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

trackerSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Tracker', trackerSchema);