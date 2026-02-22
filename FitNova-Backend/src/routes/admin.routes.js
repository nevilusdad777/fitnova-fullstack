const express = require('express');
const router = express.Router();
const {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin
} = require('../controllers/admin.controller');
const { protectAdmin, requireSuperAdmin } = require('../middlewares/admin-auth.middleware');

// All routes require superadmin privileges
router.use(protectAdmin);
router.use(requireSuperAdmin);

// Admin management (superadmin only)
router.route('/admins')
  .get(getAllAdmins)
  .post(createAdmin);

router.route('/admins/:id')
  .get(getAdminById)
  .put(updateAdmin)
  .delete(deleteAdmin);

module.exports = router;
