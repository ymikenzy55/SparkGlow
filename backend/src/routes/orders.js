const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder } = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');

router.post('/', orderLimiter, optionalAuth, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', optionalAuth, getOrder);

module.exports = router;
