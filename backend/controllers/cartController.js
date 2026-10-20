const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

async function getOrCreateCartId(userId) {
  const [rows] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
  if (rows.length > 0) return rows[0].id;

  const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
  return result.insertId;
}

async function getCart(req, res, next) {
  try {
    const cartId = await getOrCreateCartId(req.user.id);

    const [items] = await pool.query(
      `SELECT ci.id, ci.quantity, b.id AS book_id, b.title, b.author, b.price, b.stock
       FROM cart_items ci
       JOIN books b ON ci.book_id = b.id
       WHERE ci.cart_id = ?
       ORDER BY ci.id ASC`,
      [cartId]
    );

    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    return res.status(200).json({
      success: true,
      data: { items, total: Number(total.toFixed(2)) }
    });
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const { book_id, quantity } = req.body;
    const cartId = await getOrCreateCartId(req.user.id);

    const [bookRows] = await pool.query('SELECT id, stock FROM books WHERE id = ?', [book_id]);
    if (bookRows.length === 0) {
      throw new ApiError(404, `Book with id ${book_id} was not found.`);
    }
    const book = bookRows[0];

    const [existingItem] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND book_id = ?',
      [cartId, book_id]
    );

    const requestedTotalQty = existingItem.length > 0
      ? existingItem[0].quantity + quantity
      : quantity;

    if (requestedTotalQty > book.stock) {
      throw new ApiError(400, `Only ${book.stock} unit(s) of this book are in stock.`);
    }

    if (existingItem.length > 0) {
      await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [requestedTotalQty, existingItem[0].id]);
    } else {
      await pool.query(
        'INSERT INTO cart_items (cart_id, book_id, quantity) VALUES (?, ?, ?)',
        [cartId, book_id, quantity]
      );
    }

    return res.status(201).json({ success: true, message: 'Item added to cart.' });
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const { id } = req.params; // cart_item id
    const { quantity } = req.body;
    const cartId = await getOrCreateCartId(req.user.id);

    const [itemRows] = await pool.query(
      `SELECT ci.id, ci.book_id, b.stock
       FROM cart_items ci
       JOIN books b ON ci.book_id = b.id
       WHERE ci.id = ? AND ci.cart_id = ?`,
      [id, cartId]
    );

    if (itemRows.length === 0) {
      throw new ApiError(404, 'Cart item not found.');
    }

    const item = itemRows[0];
    if (quantity > item.stock) {
      throw new ApiError(400, `Only ${item.stock} unit(s) of this book are in stock.`);
    }

    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, id]);

    return res.status(200).json({ success: true, message: 'Cart item updated.' });
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const { id } = req.params;
    const cartId = await getOrCreateCartId(req.user.id);

    const [itemRows] = await pool.query(
      'SELECT id FROM cart_items WHERE id = ? AND cart_id = ?',
      [id, cartId]
    );

    if (itemRows.length === 0) {
      throw new ApiError(404, 'Cart item not found.');
    }

    await pool.query('DELETE FROM cart_items WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Item removed from cart.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, getOrCreateCartId };
