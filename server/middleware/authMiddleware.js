/**
 * Auth Middleware
 * Verifies JWT tokens for protected routes.
 */

const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/sendResponse');

/**
 * Protect any authenticated route (user or admin).
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired. Please login again.');
    }
    return sendError(res, 401, 'Invalid token.');
  }
};

/**
 * Optional auth — attaches user if token present, but doesn't block.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
      // Ignore invalid token for optional auth
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
