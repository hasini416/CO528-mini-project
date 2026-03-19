const express = require('express');
const router = express.Router();
const { createPost, getFeed, likePost, commentOnPost, getComments } = require('./feed.controller');
const { protect } = require('../../middleware/auth');
const { upload } = require('../../config/cloudinary');

router.post('/create-post', protect, upload.single('media'), createPost);
router.get('/get-feed', protect, getFeed);
router.post('/like-post/:id', protect, likePost);
router.post('/comment/:id', protect, commentOnPost);
router.get('/comments/:id', protect, getComments);

module.exports = router;
