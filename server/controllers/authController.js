/**
 * Auth Controller
 * Handles user registration, login, and admin login.
 */

const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { generateToken, generateAdminToken } = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/sendResponse');
const logger = require('../utils/logger');

// ── Register ──────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  // Validation
  if (!name || !email || !password) {
    return sendError(res, 400, 'Name, email, and password are required');
  }
  if (password.length < 6) {
    return sendError(res, 400, 'Password must be at least 6 characters');
  }

  try {
    // Check if email exists
    const { rows: existing } = await query(
      'SELECT id FROM users WHERE email = $1', [email.toLowerCase()]
    );
    if (existing.length > 0) {
      return sendError(res, 409, 'Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { rows } = await query(
      `INSERT INTO users (name, email, password, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, address, role, created_at`,
      [name.trim(), email.toLowerCase(), hashedPassword, phone || null, address || null]
    );

    const user = rows[0];
    const token = generateToken(user.id, user.role);

    logger.info(`New user registered: ${user.email}`);

    return sendSuccess(res, 201, 'Registration successful', {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    logger.error('Register error:', err.message);
    return sendError(res, 500, 'Server error during registration');
  }
};

// ── Login ─────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required');
  }

  try {
    const { rows } = await query(
      'SELECT id, name, email, password, role, is_active FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const user = rows[0];

    if (!user.is_active) {
      return sendError(res, 403, 'Your account has been deactivated');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user.id, user.role);

    logger.info(`User logged in: ${user.email}`);

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    logger.error('Login error:', err.message);
    return sendError(res, 500, 'Server error during login');
  }
};

// ── Admin Login ───────────────────────────────────────────────
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required');
  }

  try {
    const { rows } = await query(
      `SELECT id, name, email, password, role FROM users
       WHERE email = $1 AND role = 'admin'`,
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return sendError(res, 401, 'Invalid admin credentials');
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid admin credentials');
    }

    // Admin gets a separate token with admin secret
    const token = generateAdminToken(admin.id);

    logger.info(`Admin logged in: ${admin.email}`);

    return sendSuccess(res, 200, 'Admin login successful', {
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    logger.error('Admin login error:', err.message);
    return sendError(res, 500, 'Server error during admin login');
  }
};

// ── Get Current User Profile ──────────────────────────────────
const getMe = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'Profile fetched', rows[0]);
  } catch (err) {
    logger.error('GetMe error:', err.message);
    return sendError(res, 500, 'Server error');
  }
};

module.exports = { register, login, adminLogin, getMe };
