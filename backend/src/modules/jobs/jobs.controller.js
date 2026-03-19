const Job = require('./job.model');
const Application = require('./application.model');
const Notification = require('../notifications/notification.model');
const User = require('../users/user.model');

// @route POST /api/jobs/post-job  (alumni/admin only)
const postJob = async (req, res) => {
  const { title, company, location, type, description, requirements, salary, deadline } = req.body;
  try {
    const job = await Job.create({
      postedBy: req.user._id, title, company, location, type,
      description, requirements, salary, deadline,
    });
    await job.populate('postedBy', 'name email avatar');

    // Notify all students
    const students = await User.find({ role: 'student' }, '_id');
    const notifications = students.map((s) => ({
      recipient: s._id,
      type: 'new_job',
      message: `New ${type}: ${title} at ${company}`,
      triggeredBy: req.user._id,
    }));
    await Notification.insertMany(notifications);

    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/jobs/list-jobs
const listJobs = async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;
  const filter = { isActive: true };
  if (type) filter.type = type;
  try {
    const jobs = await Job.find(filter)
      .populate('postedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Job.countDocuments(filter);
    res.json({ success: true, jobs, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/jobs/apply-job/:id
const applyJob = async (req, res) => {
  const { coverLetter } = req.body;
  try {
    const job = await Job.findById(req.params.id);
    if (!job || !job.isActive) return res.status(404).json({ success: false, message: 'Job not found' });

    const existing = await Application.findOne({ job: job._id, applicant: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already applied' });

    const appData = { job: job._id, applicant: req.user._id, coverLetter };
    if (req.file) appData.resumeUrl = req.file.path;

    const application = await Application.create(appData);
    await Notification.create({
      recipient: job.postedBy,
      type: 'job_applied',
      message: `${req.user.name} applied to your job: ${job.title}`,
      triggeredBy: req.user._id,
    });
    res.status(201).json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/jobs/applications
const getApplications = async (req, res) => {
  try {
    let applications;
    if (req.user.role === 'admin') {
      applications = await Application.find().populate('job applicant', 'title company name email avatar');
    } else if (req.user.role === 'alumni') {
      const myJobs = await Job.find({ postedBy: req.user._id }, '_id');
      applications = await Application.find({ job: { $in: myJobs } })
        .populate('job', 'title company')
        .populate('applicant', 'name email avatar');
    } else {
      applications = await Application.find({ applicant: req.user._id })
        .populate('job', 'title company type');
    }
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { postJob, listJobs, applyJob, getApplications };
