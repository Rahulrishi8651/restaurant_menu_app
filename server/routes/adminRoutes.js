// ── adminRoutes.js ────────────────────────────────────────────
const router = require('express').Router();
const {
  getDashboardStats, getSalesAnalytics,
  getAllOrders, updateOrderStatus, getAllUsers,
} = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All admin routes require admin JWT
router.use(requireAdmin);

router.get('/dashboard',         getDashboardStats);
router.get('/analytics',         getSalesAnalytics);
router.get('/orders',            getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users',             getAllUsers);

module.exports = router;
