const express = require('express');
const router = express.Router();
const {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getFoodStats
} = require('../controllers/admin-food.controller');
const { protectAdmin } = require('../middlewares/admin-auth.middleware');

// All routes are protected by admin authentication
router.use(protectAdmin);

// Food statistics
router.get('/stats/overview', getFoodStats);

// Food management
router.route('/')
  .get(getAllFoods)
  .post(createFood);

router.route('/:id')
  .get(getFoodById)
  .put(updateFood)
  .delete(deleteFood);

module.exports = router;
