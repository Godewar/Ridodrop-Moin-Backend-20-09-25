const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;


    const token = authHeader
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }


    // Support multiple possible user id fields
    const userId = decoded.id || decoded._id || decoded.user_id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send(`Role: ${req.user.role} is not allowed to access this resource`);
    }
    next();
  };
};

module.exports = auth