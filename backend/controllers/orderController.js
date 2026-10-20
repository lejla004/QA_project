const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const { getOrCreateCartId } = require('./cartController');

async function createOrder(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { full_name, address, city, postal_code, phone_number } = req.body;
    const cartId = await getOrCreateCartId(req.user.id);

    const [items] = await connection.query(
      `SELECT ci.id AS cart_item_id, ci.quantity, b.id AS book_id, b.title, b.price, b.stock
       FROM cart_items ci
       JOIN books b ON ci.book_id = b.id
       WHERE ci.cart_id = ?
       FOR UPDATE`,
      [cartId]
    );

    if (items.length === 0) {
      throw new ApiError(400, 'Cannot check out with an empty cart.');
    }

    // Re-validate stock at checkout time in case it changed since items were added
    for (const item of items) {
      if (item.quantity > item.stock) {
        throw new ApiError(400, `"${item.title}" only has ${item.stock} unit(s) left in stock.`);
      }
    }

    await connection.beginTransaction();

    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, full_name, address, city, postal_code, phone_number, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [req.user.id, full_name.trim(), address.trim(), city.trim(), postal_code.trim(), phone_number.trim(), total.toFixed(2)]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_id, book_id, book_title, unit_price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.book_id, item.title, item.price, item.quantity]
      );

      await connection.query(
        'UPDATE books SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.book_id]
      );
    }

    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.commit();

    return res.status(201).json({
      success: true,
      data: { orderId, total: Number(total.toFixed(2)), status: 'Pending' }
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
}

async function getMyOrders(req, res, next) {
  try {
    const [orders] = await pool.query(
      `SELECT id, total_price, status, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      `SELECT id, user_id, full_name, address, city, postal_code, phone_number,
              total_price, status, created_at
       FROM orders WHERE id = ?`,
      [id]
    );

    if (orders.length === 0) {
      throw new ApiError(404, `Order with id ${id} was not found.`);
    }

    const order = orders[0];

    // Customers may only view their own orders; admins may view any order
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      throw new ApiError(403, 'You do not have access to this order.');
    }

    const [items] = await pool.query(
      `SELECT book_id, book_title, unit_price, quantity
       FROM order_items WHERE order_id = ?`,
      [id]
    );

    return res.status(200).json({ success: true, data: { ...order, items } });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, getMyOrders, getOrderById };
