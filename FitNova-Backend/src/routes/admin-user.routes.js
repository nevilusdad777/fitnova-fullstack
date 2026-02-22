const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  getUserRoutines,
  getUserWorkoutHistory,
  getUserDiet,
  deleteUserWorkout,
  deleteUserDiet
} = require('../controllers/admin-user.controller');
const { protectAdmin } = require('../middlewares/admin-auth.middleware');

// All routes are protected by admin authentication
router.use(protectAdmin);

// User statistics
router.get('/stats/overview', getUserStats);

// User management
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// User Activity
router.get('/:id/routines', getUserRoutines);
router.get('/:id/workouts', getUserWorkoutHistory);
router.delete('/:userId/workouts/:workoutId', deleteUserWorkout);
router.get('/:id/diet', getUserDiet);
router.delete('/:userId/diet/:date', deleteUserDiet);

module.exports = router;
