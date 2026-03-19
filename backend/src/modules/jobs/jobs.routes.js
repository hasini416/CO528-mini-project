const express = require('express');
const router = express.Router();
const { postJob, listJobs, applyJob, getApplications } = require('./jobs.controller');
const { protect } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { upload } = require('../../config/cloudinary');

router.post('/post-job', protect, authorize('alumni', 'admin'), postJob);
router.get('/list-jobs', protect, listJobs);
router.post('/apply-job/:id', protect, authorize('student'), upload.single('resume'), applyJob);
router.get('/applications', protect, getApplications);

module.exports = router;
