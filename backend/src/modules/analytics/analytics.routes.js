const express = require('express');
const router = express.Router();
const { userStats, postStats, jobStats } = require('./analytics.controller');
const { protect } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');

router.get('/stats/users', protect, authorize('admin'), userStats);
router.get('/stats/posts', protect, authorize('admin'), postStats);
router.get('/stats/jobs', protect, authorize('admin'), jobStats);

module.exports = router;
