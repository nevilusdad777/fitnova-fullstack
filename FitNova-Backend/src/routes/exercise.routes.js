const express = require('express');
const router = express.Router();
const {
  getExercises,
  getAllExercises,
  searchExercises,
  getExerciseById,
  getExercisesByBodyPart,
  getBodyParts,
  getEquipmentTypes,
  seedExercises
} = require('../controllers/exercise.controller');
const { protect } = require('../middlewares/auth.middleware');

// Metadata routes
router.get('/body-parts', getBodyParts);
router.get('/equipment-types', getEquipmentTypes);

// Exercise routes
router.get('/search', searchExercises);
router.get('/all', getAllExercises);
router.get('/body-part/:bodyPart', getExercisesByBodyPart);
router.get('/:id', getExerciseById);
router.get('/', protect, getExercises); // Legacy route

// Seed route
router.post('/seed', seedExercises);

module.exports = router;
