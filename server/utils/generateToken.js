// ── generateToken.js ──────────────────────────────────────────
const jwt = require('jsonwebtoken');

const generateToken = (userId, role = 'customer') => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const generateAdminToken = (adminId) => {
  return jwt.sign(
    { id: adminId, role: 'admin' },
    process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

module.exports = { generateToken, generateAdminToken };
