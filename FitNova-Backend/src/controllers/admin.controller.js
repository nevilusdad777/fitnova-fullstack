const Admin = require('../models/Admin');

// @desc    Get all admins
// @route   GET /admin/admins
// @access  Private (Superadmin)
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json({
      admins,
      total: admins.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single admin by ID
// @route   GET /admin/admins/:id
// @access  Private (Superadmin)
const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new admin (by superadmin)
// @route   POST /admin/admins
// @access  Private (Superadmin)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin'
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin
// @route   PUT /admin/admins/:id
// @access  Private (Superadmin)
const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Update allowed fields
    admin.name = req.body.name || admin.name;
    admin.role = req.body.role || admin.role;
    admin.isActive = req.body.isActive !== undefined ? req.body.isActive : admin.isActive;

    const updatedAdmin = await admin.save();

    res.json({
      message: 'Admin updated successfully',
      admin: {
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        isActive: updatedAdmin.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete admin
// @route   DELETE /admin/admins/:id
// @access  Private (Superadmin)
const deleteAdmin = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await Admin.findByIdAndDelete(req.params.id);

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin
};
