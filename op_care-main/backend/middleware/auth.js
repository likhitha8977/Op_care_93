const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Regular authentication middleware
exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin role verification middleware
exports.adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Doctor role verification middleware
exports.doctorMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctor role required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Combined authentication and admin middleware
exports.auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
