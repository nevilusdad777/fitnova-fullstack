const express = require('express');
const router = express.Router();
const {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseStats
} = require('../controllers/admin-exercise.controller');
const { protectAdmin } = require('../middlewares/admin-auth.middleware');

// All routes are protected by admin authentication
router.use(protectAdmin);

// Exercise statistics
router.get('/stats/overview', getExerciseStats);

// Exercise management
router.route('/')
  .get(getAllExercises)
  .post(createExercise);

router.route('/:id')
  .get(getExerciseById)
  .put(updateExercise)
  .delete(deleteExercise);

module.exports = router;
