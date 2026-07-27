const express = require('express');
const router = express.Router();
const { getLandingContent, updateLandingContent } = require('../controllers/landing-content.controller');
const { protectAdmin } = require('../middlewares/admin-auth.middleware');

// Admin-protected routes
router.get('/', protectAdmin, getLandingContent);
router.put('/', protectAdmin, updateLandingContent);

module.exports = router;
