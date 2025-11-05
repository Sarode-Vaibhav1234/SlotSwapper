const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes by ensuring a valid JWT is present
exports.protect = async (req, res, next) => {
  let token;

  // Check for 'Bearer token' in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route (no token)' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to the request object (excluding password for security)
    req.user = await User.findById(decoded.id).select('-password');

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, error: 'Not authorized to access this route (token invalid)' });
  }
};