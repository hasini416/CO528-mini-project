const express = require('express');
const router = express.Router();
const { createProject, listProjects, myProjects, inviteUser, uploadDoc } = require('./research.controller');
const { protect } = require('../../middleware/auth');
const { upload } = require('../../config/cloudinary');

router.post('/create-project', protect, createProject);
router.get('/list-projects', protect, listProjects);
router.get('/my-projects', protect, myProjects);
router.post('/invite-user', protect, inviteUser);
router.post('/upload-doc', protect, upload.single('document'), uploadDoc);

module.exports = router;
