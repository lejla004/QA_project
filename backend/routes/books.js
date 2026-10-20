const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  getAllCategories,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateBook, validateIdParam } = require('../middleware/validate');

// Public endpoints
router.get('/categories', getAllCategories);
router.get('/', getAllBooks);
router.get('/:id', validateIdParam('id'), getBookById);

// Admin-only endpoints
router.post('/', requireAuth, requireAdmin, validateBook, createBook);
router.put('/:id', requireAuth, requireAdmin, validateIdParam('id'), validateBook, updateBook);
router.delete('/:id', requireAuth, requireAdmin, validateIdParam('id'), deleteBook);

module.exports = router;
