const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user data to request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No authentication token. Authorization denied.' });
  }

  try {
    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'default_secret_dev_only';
    const decoded = jwt.verify(token, jwtSecret);

    // Attach user data to request
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid. Authorization denied.' });
  }
};