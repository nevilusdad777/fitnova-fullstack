const express = require('express');
const router = express.Router();
const { getLandingContent, updateLandingContent } = require('../controllers/landing-content.controller');
const { protectAdmin } = require('../middlewares/admin-auth.middleware');

// Public — no auth required
router.get('/', getLandingContent);

module.exports = router;
