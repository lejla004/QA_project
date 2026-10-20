const express = require('express');
const router = express.Router();
const { getCart, addItem, updateItem, removeItem } = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');
const { validateCartItem, validateQuantity, validateIdParam } = require('../middleware/validate');

// All cart routes require a logged-in customer
router.use(requireAuth);

router.get('/', getCart);
router.post('/items', validateCartItem, addItem);
router.put('/items/:id', validateIdParam('id'), validateQuantity, updateItem);
router.delete('/items/:id', validateIdParam('id'), removeItem);

module.exports = router;
