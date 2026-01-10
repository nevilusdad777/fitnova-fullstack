const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['veg', 'non-veg']
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    required: true,
    min: 0
  },
  carbs: {
    type: Number,
    required: true,
    min: 0
  },
  fat: {
    type: Number,
    required: true,
    min: 0
  },
  servingSize: {
    type: Number,
    required: true,
    min: 0
  },
  servingUnit: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

foodSchema.index({ name: 'text' });

module.exports = mongoose.model('Food', foodSchema);