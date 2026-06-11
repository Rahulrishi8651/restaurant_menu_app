/**
 * Order Controller
 * Place orders, track status, and manage order lifecycle.
 */

const { query, getClient } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/sendResponse');
const logger = require('../utils/logger');

// ── POST /api/orders — Place a new order ──────────────────────
const placeOrder = async (req, res) => {
  const {
    items,            // [{ menu_item_id, quantity, special_instructions }]
    delivery_address,
    delivery_name,
    delivery_phone,
    delivery_notes,
    payment_method = 'cod',
    payment_id,
  } = req.body;

  if (!items || items.length === 0) return sendError(res, 400, 'Order must have at least one item');
  if (!delivery_address) return sendError(res, 400, 'Delivery address is required');

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Fetch item prices from DB to prevent client-side price tampering
    const itemIds = items.map((i) => i.menu_item_id);
    const { rows: menuItems } = await client.query(
      `SELECT id, name, price, image_url, is_available
       FROM menu_items WHERE id = ANY($1::uuid[])`,
      [itemIds]
    );

    const menuMap = {};
    for (const m of menuItems) {
      if (!m.is_available) {
        await client.query('ROLLBACK');
        return sendError(res, 400, `"${m.name}" is currently unavailable`);
      }
      menuMap[m.id] = m;
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = items.map((item) => {
      const menuItem = menuMap[item.menu_item_id];
      if (!menuItem) throw new Error(`Item ${item.menu_item_id} not found`);
      const itemSubtotal = menuItem.price * item.quantity;
      subtotal += itemSubtotal;
      return {
        menu_item_id: item.menu_item_id,
        item_name: menuItem.name,
        item_image: menuItem.image_url,
        unit_price: menuItem.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        special_instructions: item.special_instructions || null,
      };
    });

    const TAX_RATE = 0.05;       // 5% GST
    const DELIVERY_FEE = 30;
    const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
    const totalAmount = subtotal + taxAmount + DELIVERY_FEE;
    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000); // +45 min

    // Generate order number
    const { rows: numRows } = await client.query('SELECT generate_order_number() AS order_number');
    const orderNumber = numRows[0].order_number;

    // Insert order
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders
         (user_id, order_number, subtotal, tax_amount, delivery_fee, total_amount,
          delivery_address, delivery_name, delivery_phone, delivery_notes,
          payment_method, payment_status, payment_id, estimated_delivery)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [req.user.id, orderNumber, subtotal, taxAmount, DELIVERY_FEE, totalAmount,
       delivery_address, delivery_name, delivery_phone, delivery_notes,
       payment_method,
       payment_id ? 'paid' : 'pending',
       payment_id || null,
       estimatedDelivery]
    );
    const order = orderRows[0];

    // Insert order items
    for (const oi of orderItemsData) {
      await client.query(
        `INSERT INTO order_items
           (order_id, menu_item_id, item_name, item_image, unit_price, quantity, subtotal, special_instructions)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [order.id, oi.menu_item_id, oi.item_name, oi.item_image,
         oi.unit_price, oi.quantity, oi.subtotal, oi.special_instructions]
      );
    }

    // Insert initial status history
    await client.query(
      'INSERT INTO order_status_history (order_id, status, note) VALUES ($1, $2, $3)',
      [order.id, 'pending', 'Order received successfully']
    );

    await client.query('COMMIT');

    logger.info(`Order placed: ${orderNumber} by user ${req.user.id}`);
    return sendSuccess(res, 201, 'Order placed successfully', {
      order_id: order.id,
      order_number: orderNumber,
      total_amount: totalAmount,
      estimated_delivery: estimatedDelivery,
      status: 'pending',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('placeOrder error:', err.message);
    return sendError(res, 500, 'Failed to place order');
  } finally {
    client.release();
  }
};

// ── GET /api/orders/my — Current user's orders ────────────────
const getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const { rows: countRows } = await query(
      'SELECT COUNT(*) FROM orders WHERE user_id = $1',
      [req.user.id]
    );

    const { rows } = await query(
      `SELECT o.id, o.order_number, o.status, o.total_amount,
              o.payment_method, o.payment_status, o.created_at,
              o.estimated_delivery, o.delivered_at,
              JSON_AGG(JSON_BUILD_OBJECT(
                'item_name', oi.item_name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'image_url', oi.item_image
              ) ORDER BY oi.created_at) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset]
    );

    return sendSuccess(res, 200, 'Orders fetched', {
      orders: rows,
      pagination: {
        total: parseInt(countRows[0].count),
        page: parseInt(page), limit: parseInt(limit),
      },
    });
  } catch (err) {
    logger.error('getMyOrders error:', err.message);
    return sendError(res, 500, 'Failed to fetch orders');
  }
};

// ── GET /api/orders/:id/track — Public order tracking ─────────
const trackOrder = async (req, res) => {
  try {
    // Allow track by id or order_number
    const { rows } = await query(
      `SELECT o.id, o.order_number, o.status, o.estimated_delivery,
              o.delivered_at, o.total_amount, o.delivery_address,
              JSON_AGG(JSON_BUILD_OBJECT(
                'status', sh.status,
                'note', sh.note,
                'timestamp', sh.created_at
              ) ORDER BY sh.created_at) AS history,
              JSON_AGG(DISTINCT JSON_BUILD_OBJECT(
                'item_name', oi.item_name,
                'quantity', oi.quantity,
                'image_url', oi.item_image
              )) AS items
       FROM orders o
       JOIN order_status_history sh ON sh.order_id = o.id
       JOIN order_items oi ON oi.order_id = o.id
       WHERE (o.id::TEXT = $1 OR o.order_number = $1)
         AND (o.user_id = $2 OR $3 = 'admin')
       GROUP BY o.id`,
      [req.params.id, req.user?.id, req.user?.role]
    );

    if (rows.length === 0) return sendError(res, 404, 'Order not found');
    return sendSuccess(res, 200, 'Order tracked', rows[0]);
  } catch (err) {
    logger.error('trackOrder error:', err.message);
    return sendError(res, 500, 'Failed to track order');
  }
};

module.exports = { placeOrder, getMyOrders, trackOrder };
