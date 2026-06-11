/**
 * Menu Controller
 * CRUD for menu items + categories. Admin-protected writes.
 */

const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/sendResponse');
const logger = require('../utils/logger');
const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── GET /api/menu — List with pagination & filters ────────────
const getMenuItems = async (req, res) => {
  const {
    page = 1, limit = 12,
    category, search,
    is_veg, is_featured,
    sort = 'name', order = 'ASC',
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const conditions = ['m.is_available = TRUE'];
  const params = [];
  let paramIdx = 1;

  if (category) {
    conditions.push(`c.slug = $${paramIdx++}`);
    params.push(category);
  }
  if (search) {
    conditions.push(`(m.name ILIKE $${paramIdx} OR m.description ILIKE $${paramIdx})`);
    params.push(`%${search}%`);
    paramIdx++;
  }
  if (is_veg === 'true') {
    conditions.push('m.is_veg = TRUE');
  }
  if (is_featured === 'true') {
    conditions.push('m.is_featured = TRUE');
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const validSorts = { name: 'm.name', price: 'm.price', rating: 'm.rating', created_at: 'm.created_at' };
  const sortCol = validSorts[sort] || 'm.name';
  const sortDir = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  try {
    const countResult = await query(
      `SELECT COUNT(*) FROM menu_items m
       LEFT JOIN categories c ON m.category_id = c.id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const { rows } = await query(
      `SELECT m.id, m.name, m.slug, m.description, m.price, m.image_url,
              m.is_veg, m.is_featured, m.spice_level, m.prep_time_min,
              m.calories, m.tags, m.rating, m.rating_count,
              c.id AS category_id, c.name AS category_name, c.slug AS category_slug
       FROM menu_items m
       LEFT JOIN categories c ON m.category_id = c.id
       ${whereClause}
       ORDER BY ${sortCol} ${sortDir}
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, parseInt(limit), offset]
    );

    return sendSuccess(res, 200, 'Menu items fetched', {
      items: rows,
      pagination: {
        total, page: parseInt(page), limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    logger.error('getMenuItems error:', err.message);
    return sendError(res, 500, 'Failed to fetch menu items');
  }
};

// ── GET /api/menu/categories ──────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT c.*, COUNT(m.id)::INT AS item_count
       FROM categories c
       LEFT JOIN menu_items m ON m.category_id = c.id AND m.is_available = TRUE
       WHERE c.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.display_order`
    );
    return sendSuccess(res, 200, 'Categories fetched', rows);
  } catch (err) {
    logger.error('getCategories error:', err.message);
    return sendError(res, 500, 'Failed to fetch categories');
  }
};

// ── GET /api/menu/:id ─────────────────────────────────────────
const getMenuItemById = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT m.*, c.name AS category_name, c.slug AS category_slug
       FROM menu_items m
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE m.id = $1 OR m.slug = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return sendError(res, 404, 'Menu item not found');
    return sendSuccess(res, 200, 'Menu item fetched', rows[0]);
  } catch (err) {
    logger.error('getMenuItemById error:', err.message);
    return sendError(res, 500, 'Failed to fetch menu item');
  }
};

// ── POST /api/menu — Create item (Admin) ──────────────────────
const createMenuItem = async (req, res) => {
  const {
    category_id, name, description, price, cost_price,
    is_veg, is_featured, spice_level, prep_time_min, calories, tags,
  } = req.body;

  if (!name || !price) return sendError(res, 400, 'Name and price are required');

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  const slug = slugify(name);

  try {
    const { rows } = await query(
      `INSERT INTO menu_items
         (category_id, name, slug, description, price, cost_price, image_url,
          is_veg, is_featured, spice_level, prep_time_min, calories, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [category_id, name, slug, description, price, cost_price || 0, image_url,
       is_veg || false, is_featured || false, spice_level || 0,
       prep_time_min || 15, calories, tags || []]
    );
    logger.info(`Menu item created: ${name}`);
    return sendSuccess(res, 201, 'Menu item created', rows[0]);
  } catch (err) {
    console.error("FULL ERROR:", err);

    logger.error(`createMenuItem error: ${err.message}`);

    if (err.code === '23505') {
        return sendError(res, 409, 'Item with this name already exists');
    }

    return sendError(res, 500, err.message);
  }
};

// ── PUT /api/menu/:id — Update item (Admin) ───────────────────
const updateMenuItem = async (req, res) => {
  const {
    category_id, name, description, price, cost_price,
    is_veg, is_featured, is_available, spice_level, prep_time_min, calories, tags,
  } = req.body;

  try {
    const { rows: existing } = await query('SELECT id FROM menu_items WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return sendError(res, 404, 'Menu item not found');

    const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const { rows } = await query(
      `UPDATE menu_items SET
         category_id   = COALESCE($1,  category_id),
         name          = COALESCE($2,  name),
         description   = COALESCE($3,  description),
         price         = COALESCE($4,  price),
         cost_price    = COALESCE($5,  cost_price),
         image_url     = COALESCE($6,  image_url),
         is_veg        = COALESCE($7,  is_veg),
         is_featured   = COALESCE($8,  is_featured),
         is_available  = COALESCE($9,  is_available),
         spice_level   = COALESCE($10, spice_level),
         prep_time_min = COALESCE($11, prep_time_min),
         calories      = COALESCE($12, calories),
         tags          = COALESCE($13, tags)
       WHERE id = $14
       RETURNING *`,
      [category_id, name, description, price, cost_price,
       image_url, is_veg, is_featured, is_available,
       spice_level, prep_time_min, calories, tags, req.params.id]
    );
    logger.info(`Menu item updated: ${req.params.id}`);
    return sendSuccess(res, 200, 'Menu item updated', rows[0]);
  } catch (err) {
    logger.error('updateMenuItem error:', err.message);
    return sendError(res, 500, 'Failed to update menu item');
  }
};




// ── DELETE /api/menu/:id — Delete item (Admin) ────────────────
const deleteMenuItem = async (req, res) => {
  try {
    const { rows } = await query(
      'DELETE FROM menu_items WHERE id = $1 RETURNING id, name',
      [req.params.id]
    );
    if (rows.length === 0) return sendError(res, 404, 'Menu item not found');
    logger.info(`Menu item deleted: ${rows[0].name}`);
    return sendSuccess(res, 200, 'Menu item deleted', { id: req.params.id });
  } catch (err) {
    logger.error('deleteMenuItem error:', err.message);
    return sendError(res, 500, 'Failed to delete menu item');
  }
};

module.exports = {
  getMenuItems, getCategories, getMenuItemById,
  createMenuItem, updateMenuItem, deleteMenuItem,
};
