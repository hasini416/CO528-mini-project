const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead, markRead } = require('./notifications.controller');
const { protect } = require('../../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/mark-read', protect, markAllRead);
router.put('/:id/read', protect, markRead);

module.exports = router;
