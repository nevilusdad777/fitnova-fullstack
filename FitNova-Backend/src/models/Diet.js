const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: false,
    default: ''
  },
  name: {
    type: String,
    required: true
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
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  unit: {
    type: String,
    required: true
  },
  servingSize: {
    type: Number,
    required: false,
    min: 0
  }
});

const mealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  },
  foods: [foodItemSchema],
  totalCalories: {
    type: Number,
    required: true,
    min: 0
  },
  totalProtein: {
    type: Number,
    required: true,
    min: 0
  },
  totalCarbs: {
    type: Number,
    required: true,
    min: 0
  },
  totalFat: {
    type: Number,
    required: true,
    min: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedFoodIndices: {
    type: [Number],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meal', mealSchema);