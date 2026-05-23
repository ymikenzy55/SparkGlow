const express = require('express');
const router = express.Router();
const { getCategories, getCategory } = require('../controllers/categoryController');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(apiLimiter);
router.get('/', getCategories);
router.get('/:slug', getCategory);

module.exports = router;
