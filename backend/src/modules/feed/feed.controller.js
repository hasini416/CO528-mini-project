const Post = require('./post.model');
const Like = require('./like.model');
const Comment = require('./comment.model');
const Notification = require('../notifications/notification.model');
const { upload } = require('../../config/cloudinary');

// @route POST /api/feed/create-post
const createPost = async (req, res) => {
  const { text } = req.body;
  try {
    const postData = { user: req.user._id, text };
    if (req.file) {
      postData.mediaUrl = req.file.path;
      postData.mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }
    const post = await Post.create(postData);
    await post.populate('user', 'name avatar role');
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/feed/get-feed
const getFeed = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const posts = await Post.find()
      .populate('user', 'name avatar role department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Post.countDocuments();
    res.json({ success: true, posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/feed/like-post/:id
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const existingLike = await Like.findOne({ post: post._id, user: req.user._id });
    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();
      return res.json({ success: true, liked: false, likesCount: post.likesCount });
    }

    await Like.create({ post: post._id, user: req.user._id });
    post.likesCount += 1;
    await post.save();

    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        type: 'like',
        message: `${req.user.name} liked your post`,
        triggeredBy: req.user._id,
      });
    }
    res.json({ success: true, liked: true, likesCount: post.likesCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/feed/comment/:id
const commentOnPost = async (req, res) => {
  const { text, parentComment } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.create({
      post: post._id, user: req.user._id, text,
      parentComment: parentComment || null,
    });
    await comment.populate('user', 'name avatar');
    post.commentsCount += 1;
    await post.save();

    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        type: 'comment',
        message: `${req.user.name} commented on your post`,
        triggeredBy: req.user._id,
      });
    }
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/feed/comments/:id
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id, parentComment: null })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createPost, getFeed, likePost, commentOnPost, getComments };
