const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/heroBannerController');

router.get('/', ctrl.getHeroBanners);

module.exports = router;
