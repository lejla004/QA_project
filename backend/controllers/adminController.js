const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

async function getAllOrders(req, res, next) {
  try {
    const { status } = req.query;
    const params = [];
    let where = '';

    if (status) {
      where = 'WHERE o.status = ?';
      params.push(status);
    }

    const [orders] = await pool.query(
      `SELECT o.id, o.user_id, u.name AS customer_name, u.email AS customer_email,
              o.total_price, o.status, o.created_at
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ${where}
       ORDER BY o.created_at DESC`,
      params
    );

    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [existing] = await pool.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, `Order with id ${id} was not found.`);
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    return res.status(200).json({ success: true, message: 'Order status updated.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllOrders, updateOrderStatus };
