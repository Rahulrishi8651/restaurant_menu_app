// ── orderRoutes.js ────────────────────────────────────────────
const router = require('express').Router();
const { placeOrder, getMyOrders, trackOrder } = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/',          protect, placeOrder);
router.get('/my',         protect, getMyOrders);
router.get('/:id/track',  optionalAuth, trackOrder);

module.exports = router;

// ── adminRoutes.js ────────────────────────────────────────────
// (Save as server/routes/adminRoutes.js)
