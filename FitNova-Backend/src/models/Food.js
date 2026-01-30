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
    enum: ['protein', 'carbs', 'vegetables', 'fruits', 'dairy', 'fats', 'snacks', 'beverages', 'grains']
  },
  isVegetarian: {
    type: Boolean,
    required: true,
    default: true
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
  fiber: {
    type: Number,
    default: 0,
    min: 0
  },
  servingSize: {
    type: Number,
    required: true,
    min: 0
  },
  servingUnit: {
    type: String,
    required: true,
    enum: ['g', 'ml', 'cup', 'piece', 'tbsp', 'tsp', 'oz']
  },
  verified: {
    type: Boolean,
    default: false
  },
  image: {
    type: String, // URL of the food image
    default: null
  },
  apiId: {
    type: String, // ID from the external API (e.g., Spoonacular ID)
    unique: true,
    sparse: true // Allows null/undefined values to not conflict
  },
  apiSource: {
    type: String,
    enum: ['USDA', 'Spoonacular', 'OpenFoodFacts', 'manual', 'user', 'Curated (Indian)'],
    default: 'manual'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

foodSchema.index({ name: 'text' });
foodSchema.index({ category: 1 });
foodSchema.index({ isVegetarian: 1 });

module.exports = mongoose.model('Food', foodSchema);