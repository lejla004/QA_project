const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

const ALLOWED_SORT = { price_asc: 'b.price ASC', price_desc: 'b.price DESC' };

async function getAllBooks(req, res, next) {
  try {
    const { search, category, sort } = req.query;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('b.title LIKE ?');
      params.push(`%${search}%`);
    }
    if (category) {
      conditions.push('c.name = ?');
      params.push(category);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderClause = ALLOWED_SORT[sort] ? `ORDER BY ${ALLOWED_SORT[sort]}` : 'ORDER BY b.id ASC';

    const [rows] = await pool.query(
      `SELECT b.id, b.title, b.author, b.price, b.description, b.stock,
              c.id AS category_id, c.name AS category_name
       FROM books b
       JOIN categories c ON b.category_id = c.id
       ${whereClause}
       ${orderClause}`,
      params
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function getBookById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT b.id, b.title, b.author, b.price, b.description, b.stock,
              c.id AS category_id, c.name AS category_name
       FROM books b
       JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new ApiError(404, `Book with id ${id} was not found.`);
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function getAllCategories(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, name FROM categories ORDER BY name ASC');
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function createBook(req, res, next) {
  try {
    const { title, author, price, description, category_id, stock } = req.body;

    const [category] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (category.length === 0) {
      throw new ApiError(400, `Category with id ${category_id} does not exist.`);
    }

    const [result] = await pool.query(
      `INSERT INTO books (title, author, price, description, category_id, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title.trim(), author.trim(), price, description || null, category_id, stock]
    );

    return res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
}

async function updateBook(req, res, next) {
  try {
    const { id } = req.params;
    const { title, author, price, description, category_id, stock } = req.body;

    const [existing] = await pool.query('SELECT id FROM books WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, `Book with id ${id} was not found.`);
    }

    if (category_id) {
      const [category] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
      if (category.length === 0) {
        throw new ApiError(400, `Category with id ${category_id} does not exist.`);
      }
    }

    await pool.query(
      `UPDATE books
       SET title = ?, author = ?, price = ?, description = ?, category_id = ?, stock = ?
       WHERE id = ?`,
      [title.trim(), author.trim(), price, description || null, category_id, stock, id]
    );

    return res.status(200).json({ success: true, message: 'Book updated successfully.' });
  } catch (err) {
    next(err);
  }
}

async function deleteBook(req, res, next) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM books WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, `Book with id ${id} was not found.`);
    }

    await pool.query('DELETE FROM books WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Book deleted successfully.' });
  } catch (err) {
    // A book referenced by past order_items can still be deleted because
    // order_items.book_id uses ON DELETE SET NULL - so this should normally succeed.
    next(err);
  }
}

module.exports = {
  getAllBooks,
  getBookById,
  getAllCategories,
  createBook,
  updateBook,
  deleteBook
};
