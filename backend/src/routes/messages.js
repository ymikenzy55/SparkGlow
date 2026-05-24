const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendMessage, getMyMessages, markMyRepliesRead } = require('../controllers/messageController');

router.post('/', sendMessage);
router.get('/mine', protect, getMyMessages);
router.put('/mine/read', protect, markMyRepliesRead);

module.exports = router;
