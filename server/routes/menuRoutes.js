// ── menuRoutes.js ─────────────────────────────────────────────
const router = require('express').Router();
const {
  getMenuItems, getCategories, getMenuItemById,
  createMenuItem, updateMenuItem, deleteMenuItem,
} = require('../controllers/menuController');
const { requireAdmin } = require('../middleware/adminMiddleware');
const upload = require('../config/multer');

router.get('/',            getMenuItems);
router.get('/categories',  getCategories);
router.get('/:id',         getMenuItemById);
router.post('/',           requireAdmin, upload.single('image'), createMenuItem);
router.put('/:id',         requireAdmin, upload.single('image'), updateMenuItem);
router.delete('/:id',      requireAdmin, deleteMenuItem);

module.exports = router;
