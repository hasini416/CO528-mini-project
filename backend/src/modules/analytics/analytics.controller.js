const User = require('../users/user.model');
const Post = require('../feed/post.model');
const Like = require('../feed/like.model');
const Job = require('../jobs/job.model');
const Application = require('../jobs/application.model');
const Event = require('../events/event.model');

// @route GET /api/analytics/stats/users
const userStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const alumni = await User.countDocuments({ role: 'alumni' });
    const admins = await User.countDocuments({ role: 'admin' });
    const recent = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    res.json({ success: true, stats: { total, students, alumni, admins, newLast30Days: recent } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/analytics/stats/posts
const postStats = async (req, res) => {
  try {
    const total = await Post.countDocuments();
    const totalLikes = await Like.countDocuments();
    const mostLiked = await Post.find()
      .populate('user', 'name avatar')
      .sort({ likesCount: -1 })
      .limit(5);
    const recentPosts = await Post.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    res.json({ success: true, stats: { total, totalLikes, mostLiked, recentLast7Days: recentPosts } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/analytics/stats/jobs
const jobStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const topJobs = await Application.aggregate([
      { $group: { _id: '$job', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' } },
      { $unwind: '$job' },
      { $project: { 'job.title': 1, 'job.company': 1, count: 1 } },
    ]);
    res.json({
      success: true,
      stats: { totalJobs, activeJobs, totalApplications, pendingApplications, topJobs },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { userStats, postStats, jobStats };
