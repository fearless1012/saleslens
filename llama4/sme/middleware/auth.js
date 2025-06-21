const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'Invalid token. User not found.' });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      
      next();
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Server error in authentication' });
  }
};

// Admin role middleware
const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
  });
};

module.exports = auth;
module.exports.adminAuth = adminAuth;
