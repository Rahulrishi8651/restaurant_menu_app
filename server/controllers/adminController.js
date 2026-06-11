/**
 * Admin Controller
 * Dashboard analytics, order management, user management.
 */

const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/sendResponse');
const logger = require('../utils/logger');

// ── GET /api/admin/dashboard ──────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [ordersStats, revenueStats, topItems, recentOrders] = await Promise.all([
      // Order counts by status
      query(`
        SELECT
          COUNT(*) FILTER (WHERE status != 'cancelled')                    AS total_orders,
          COUNT(*) FILTER (WHERE status = 'pending')                       AS pending_orders,
          COUNT(*) FILTER (WHERE status = 'preparing')                     AS preparing_orders,
          COUNT(*) FILTER (WHERE status = 'out_for_delivery')              AS out_for_delivery,
          COUNT(*) FILTER (WHERE status = 'delivered')                     AS delivered_orders,
          COUNT(*) FILTER (WHERE status = 'cancelled')                     AS cancelled_orders,
          COUNT(*) FILTER (WHERE status IN ('pending','confirmed','preparing','out_for_delivery')) AS active_orders
        FROM orders
      `),
      // Revenue metrics
      query(`
        SELECT
              COALESCE(SUM(o.total_amount) FILTER (WHERE o.status = 'delivered'), 0) AS total_revenue,
              COALESCE(SUM(o.total_amount) FILTER (
                WHERE o.status = 'delivered'
                AND o.created_at >= DATE_TRUNC('month', NOW())
              ), 0) AS monthly_revenue,
              COALESCE(SUM(o.total_amount) FILTER (
                WHERE o.status = 'delivered'
                AND o.created_at >= CURRENT_DATE
              ), 0) AS today_revenue,
              COALESCE(SUM(
                (oi.unit_price - COALESCE(m.cost_price, 0)) * oi.quantity
             ) FILTER (WHERE o.status = 'delivered'), 0) AS total_profit
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN menu_items m ON m.id = oi.menu_item_id;
      `),
      // Top 5 selling items
      query(`
        SELECT
          oi.item_name,
          SUM(oi.quantity)::INT   AS total_sold,
          SUM(oi.subtotal)        AS total_revenue,
          mi.image_url
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
        WHERE o.status = 'delivered'
        GROUP BY oi.item_name, mi.image_url
        ORDER BY total_sold DESC
        LIMIT 5
      `),
      // Recent 5 orders
      query(`
        SELECT o.id, o.order_number, o.status, o.total_amount,
               o.payment_method, o.created_at,
               u.name AS customer_name, u.phone AS customer_phone
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
        LIMIT 5
      `),
    ]);

    return sendSuccess(res, 200, 'Dashboard stats fetched', {
      orders: ordersStats.rows[0],
      revenue: revenueStats.rows[0],
      top_items: topItems.rows,
      recent_orders: recentOrders.rows,
    });
  } catch (err) {
    logger.error('getDashboardStats error:', err.message);
    return sendError(res, 500, 'Failed to fetch dashboard stats');
  }
};

// ── GET /api/admin/analytics?period=30 ───────────────────────
const getSalesAnalytics = async (req, res) => {
  const days = parseInt(req.query.period) || 30;

  try {
    const [daily, monthly] = await Promise.all([
      // Daily revenue for past N days
      query(`
        SELECT
          DATE(created_at)                   AS date,
          COUNT(*)::INT                      AS order_count,
          COALESCE(SUM(total_amount), 0)     AS revenue
        FROM orders
        WHERE status = 'delivered'
          AND created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),
      // Monthly revenue for past 12 months
      query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
          DATE_TRUNC('month', created_at)                      AS month_date,
          COUNT(*)::INT                                        AS order_count,
          COALESCE(SUM(total_amount), 0)                       AS revenue
        FROM orders
        WHERE status = 'delivered'
          AND created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month_date ASC
      `),
    ]);

    return sendSuccess(res, 200, 'Analytics fetched', {
      daily: daily.rows,
      monthly: monthly.rows,
    });
  } catch (err) {
    logger.error('getSalesAnalytics error:', err.message);
    return sendError(res, 500, 'Failed to fetch analytics');
  }
};

// ── GET /api/admin/orders ─────────────────────────────────────
const getAllOrders = async (req, res) => {
  const {
    page = 1, limit = 15,
    status, search,
    sort = 'created_at', order = 'DESC',
  } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const conditions = [];
  const params = [];
  let idx = 1;

  if (status) { conditions.push(`o.status = $${idx++}`); params.push(status); }
  if (search) {
    conditions.push(`(o.order_number ILIKE $${idx} OR u.name ILIKE $${idx} OR u.email ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderSql = `ORDER BY o.${sort === 'total_amount' ? 'total_amount' : 'created_at'} ${order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;

  try {
    const { rows: countRows } = await query(
      `SELECT COUNT(*) FROM orders o LEFT JOIN users u ON u.id = o.user_id ${where}`,
      params
    );

    const { rows } = await query(
      `SELECT o.id, o.order_number, o.status, o.total_amount,
              o.payment_method, o.payment_status, o.created_at,
              o.delivery_address, o.delivery_phone,
              u.name AS customer_name, u.email AS customer_email,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id)::INT AS item_count
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ${where}
       ${orderSql}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    return sendSuccess(res, 200, 'Orders fetched', {
      orders: rows,
      pagination: { total: parseInt(countRows[0].count), page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    logger.error('getAllOrders error:', err.message);
    return sendError(res, 500, 'Failed to fetch orders');
  }
};

// ── PUT /api/admin/orders/:id/status ─────────────────────────
const updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;
  const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  if (!VALID_STATUSES.includes(status)) {
    return sendError(res, 400, `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}`);
  }

  try {
    const { rows } = await query(
      `UPDATE orders SET
         status = $1,
         delivered_at = CASE WHEN $1 = 'delivered' THEN NOW() ELSE delivered_at END
       WHERE id = $2
       RETURNING id, order_number, status`,
      [status, req.params.id]
    );

    if (rows.length === 0) return sendError(res, 404, 'Order not found');

    // Record status change
    await query(
      'INSERT INTO order_status_history (order_id, status, note, changed_by) VALUES ($1,$2,$3,$4)',
      [req.params.id, status, note || `Status updated to ${status}`, req.user.id]
    );

    logger.info(`Order ${rows[0].order_number} status → ${status} by admin ${req.user.id}`);
    return sendSuccess(res, 200, 'Order status updated', rows[0]);
  } catch (err) {
    logger.error('updateOrderStatus error:', err.message);
    return sendError(res, 500, 'Failed to update order status');
  }
};

// ── GET /api/admin/users ──────────────────────────────────────
const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const conditions = ["role = 'customer'"];
  const params = [];
  let idx = 1;

  if (search) {
    conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  try {
    const [countRes, usersRes] = await Promise.all([
      query(`SELECT COUNT(*) FROM users ${where}`, params),
      query(
        `SELECT u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
                COUNT(o.id)::INT AS total_orders,
                COALESCE(SUM(o.total_amount) FILTER (WHERE o.status = 'delivered'), 0) AS total_spent
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id
         ${where}
         GROUP BY u.id
         ORDER BY u.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, parseInt(limit), offset]
      ),
    ]);

    return sendSuccess(res, 200, 'Users fetched', {
      users: usersRes.rows,
      pagination: { total: parseInt(countRes.rows[0].count), page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    logger.error('getAllUsers error:', err.message);
    return sendError(res, 500, 'Failed to fetch users');
  }
};

module.exports = { getDashboardStats, getSalesAnalytics, getAllOrders, updateOrderStatus, getAllUsers };
