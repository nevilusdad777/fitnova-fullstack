const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Protect admin routes
const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if it's an admin token (we'll add adminType to the token payload)
      if (decoded.adminType !== 'admin') {
        return res.status(401).json({ message: 'Not authorized as admin' });
      }

      // Get admin from token
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }

      if (!req.admin.isActive) {
        return res.status(401).json({ message: 'Admin account is deactivated' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Require superadmin privileges
const requireSuperAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Superadmin privileges required.' });
  }
};

module.exports = { protectAdmin, requireSuperAdmin };
