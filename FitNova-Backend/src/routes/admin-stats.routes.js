const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUserGrowth
} = require('../controllers/admin-stats.controller');
const { protectAdmin } = require('../middlewares/admin-auth.middleware');

// All routes are protected by admin authentication
router.use(protectAdmin);

// Statistics routes
router.get('/dashboard', getDashboardStats);
router.get('/users/growth', getUserGrowth);

module.exports = router;
