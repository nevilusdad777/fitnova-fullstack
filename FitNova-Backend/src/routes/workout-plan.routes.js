const express = require('express');
const router = express.Router();
const { generatePlan, savePlan, getActivePlan, updatePlan, deletePlan } = require('../controllers/workout-plan.controller');
const { protect } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

router.post('/generate', protect, [
    body('splitType').isIn(['bro', 'ppl', 'upper-lower', 'full-body', 'custom']).withMessage('Invalid split type'),
    body('fitnessLevel').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid fitness level')
], generatePlan);

router.post('/', protect, savePlan);
router.get('/active', protect, getActivePlan);
router.put('/:id', protect, updatePlan);
router.delete('/:id', protect, deletePlan);

module.exports = router;
