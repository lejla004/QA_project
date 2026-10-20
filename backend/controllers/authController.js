const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 10;

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, 'customer']
    );

    // Every new customer gets an empty cart
    await pool.query('INSERT INTO carts (user_id) VALUES (?)', [result.insertId]);

    const user = { id: result.insertId, name: name.trim(), email: email.toLowerCase().trim(), role: 'customer' };
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.status(200).json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

// Logout is stateless (JWT). The client discards the token.
// The endpoint exists so the frontend has a clear, explicit action to call.
async function logout(req, res, next) {
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
}

module.exports = { register, login, logout };
