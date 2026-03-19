const express = require('express');
const router = express.Router();
const { createEvent, listEvents, rsvpEvent } = require('./events.controller');
const { protect } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { upload } = require('../../config/cloudinary');

router.post('/create-event', protect, authorize('admin', 'alumni'), upload.single('image'), createEvent);
router.get('/list-events', protect, listEvents);
router.post('/rsvp/:id', protect, rsvpEvent);

module.exports = router;
