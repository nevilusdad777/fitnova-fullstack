const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile
} = require('../controllers/admin-auth.controller');
const { protectAdmin } = require('../middlewares/admin-auth.middleware');

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected routes
router.get('/me', protectAdmin, getAdminProfile);
router.put('/profile', protectAdmin, updateAdminProfile);

module.exports = router;
