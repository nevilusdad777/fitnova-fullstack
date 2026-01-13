const express = require('express');
const router = express.Router();
const foodController = require('../controllers/food.controller');
const { protect } = require('../middlewares/auth.middleware');

// Public routes
router.get('/search', foodController.searchFoods);
router.get('/categories', foodController.getCategories);
router.get('/popular', foodController.getPopularFoods);
router.get('/', foodController.getAllFoods);
router.get('/:id', foodController.getFoodById);

// Protected routes
router.post('/', protect, foodController.createFood);

module.exports = router;
