const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { body } = require('express-validator');

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('age').isInt({ min: 10, max: 120 }).withMessage('Age must be between 10 and 120'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('height').isFloat({ min: 50, max: 300 }).withMessage('Height must be between 50 and 300'),
  body('weight').isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500'),
  body('goal').isIn(['gain', 'loss', 'maintain']).withMessage('Valid goal is required'),
  body('activityLevel').isFloat({ min: 1.2, max: 1.9 }).withMessage('Activity level must be between 1.2 and 1.9')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

module.exports = router;