/**
 * Admin Middleware
 * Verifies admin-only JWT token (signed with ADMIN_JWT_SECRET).
 */

const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/sendResponse');

/**
 * Require valid admin token (from /api/auth/admin/login).
 * Can be chained after `protect` or used standalone.
 */
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 401, 'Admin access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    // Try admin secret first
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET);
    } catch {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    }

    if (decoded.role !== 'admin') {
      return sendError(res, 403, 'Forbidden. Admin access required.');
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Admin token expired.');
    }
    return sendError(res, 401, 'Invalid admin token.');
  }
};

module.exports = { requireAdmin };
