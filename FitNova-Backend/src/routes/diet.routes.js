const express = require('express');
const router = express.Router();
const { getTodayMeals, logMeal, updateMeal, deleteMeal, getMealHistory, searchFood, getAllFoods, getFoodById, seedFoods } = require('../controllers/diet.controller');
const { protect } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

// Meal Routes
router.get('/today', protect, getTodayMeals);
router.get('/history', protect, getMealHistory);

// Food Database Routes
router.post('/foods/seed', seedFoods);
router.get('/foods', protect, getAllFoods);
router.get('/foods/search', protect, searchFood);
router.get('/foods/:id', protect, getFoodById);

// Meal Logging
router.post('/log', protect, [
  body('mealType').isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Valid meal type is required'),
  body('foods').isArray({ min: 1 }).withMessage('At least one food item is required')
], logMeal);

router.put('/:id', protect, updateMeal);
router.delete('/:id', protect, deleteMeal);

module.exports = router;