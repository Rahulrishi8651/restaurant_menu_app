const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { query }   = require('../config/db');
const { sendSuccess, sendError } = require('../utils/sendResponse');

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  const { rows } = await query(
    'SELECT id,name,email,phone,address,created_at FROM users WHERE id=$1', [req.user.id]
  );
  if (!rows.length) return sendError(res, 404, 'User not found');
  return sendSuccess(res, 200, 'Profile fetched', rows[0]);
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  const { name, phone, address } = req.body;
  const { rows } = await query(
    `UPDATE users SET name=COALESCE($1,name), phone=COALESCE($2,phone), address=COALESCE($3,address)
     WHERE id=$4 RETURNING id,name,email,phone,address`,
    [name, phone, address, req.user.id]
  );
  return sendSuccess(res, 200, 'Profile updated', rows[0]);
});

module.exports = router;
