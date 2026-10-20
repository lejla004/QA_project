const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById } = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');
const { validateCheckout, validateIdParam } = require('../middleware/validate');

router.use(requireAuth);

router.post('/', validateCheckout, createOrder);
router.get('/', getMyOrders);
router.get('/:id', validateIdParam('id'), getOrderById);

module.exports = router;
