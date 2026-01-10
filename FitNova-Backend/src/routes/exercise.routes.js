const express = require('express');
const router = express.Router();
const { getExercises, seedExercises } = require('../controllers/exercise.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', protect, getExercises);
router.post('/seed', seedExercises); // Public for initial setup ease, or protect if needed

module.exports = router;
