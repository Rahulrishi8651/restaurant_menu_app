// ── authRoutes.js ─────────────────────────────────────────────
const router = require('express').Router();
const { register, login, adminLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);
router.post('/admin/login', authLimiter, adminLogin);
router.get('/me', protect, getMe);

module.exports = router;
