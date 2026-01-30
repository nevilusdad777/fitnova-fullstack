const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/auth.middleware');
const { 
  getAllUsers, 
  deleteUser, 
  getDashboardStats,
  getAllExercises,
  getAllFoods
} = require('../controllers/admin.controller');

// All routes are protected and require admin role
router.use(protect, admin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getDashboardStats);
router.get('/exercises', getAllExercises);
router.get('/foods', getAllFoods);

module.exports = router;
