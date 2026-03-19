const express = require('express');
const router = express.Router();
const { getChatHistory, getMyRooms } = require('./messaging.controller');
const { protect } = require('../../middleware/auth');

router.get('/chat-history/:roomId', protect, getChatHistory);
router.get('/my-rooms', protect, getMyRooms);

module.exports = router;
