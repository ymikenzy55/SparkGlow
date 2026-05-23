const express = require('express');
const router = express.Router();
const { getProducts, getProduct, searchProducts, getFeatured, addReview } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(apiLimiter);
router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/search', searchProducts);
router.get('/:id', getProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
