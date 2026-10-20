const express = require('express');
const router = express.Router();
const { getAllOrders, updateOrderStatus } = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateOrderStatus, validateIdParam } = require('../middleware/validate');

router.use(requireAuth, requireAdmin);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', validateIdParam('id'), validateOrderStatus, updateOrderStatus);

module.exports = router;
