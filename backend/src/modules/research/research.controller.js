const Project = require('./project.model');
const Notification = require('../notifications/notification.model');
const User = require('../users/user.model');
const { upload } = require('../../config/cloudinary');

// @route POST /api/research/create-project
const createProject = async (req, res) => {
  const { title, description, tags } = req.body;
  try {
    const project = await Project.create({
      owner: req.user._id, title, description, tags,
      collaborators: [req.user._id],
    });
    await project.populate('owner', 'name avatar');
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/research/list-projects
const listProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isOpen: true })
      .populate('owner', 'name avatar')
      .populate('collaborators', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/research/my-projects
const myProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    }).populate('owner', 'name avatar').populate('collaborators', 'name avatar');
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/research/invite-user
const inviteUser = async (req, res) => {
  const { projectId, userId } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Only the project owner can invite users' });

    if (project.collaborators.includes(userId))
      return res.status(400).json({ success: false, message: 'User already a collaborator' });

    project.collaborators.push(userId);
    await project.save();

    await Notification.create({
      recipient: userId,
      type: 'research_invite',
      message: `${req.user.name} invited you to collaborate on: ${project.title}`,
      triggeredBy: req.user._id,
    });
    res.json({ success: true, message: 'User invited', project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/research/upload-doc
const uploadDoc = async (req, res) => {
  const { projectId } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    const isCollaborator = project.collaborators.some(
      (c) => c.toString() === req.user._id.toString()
    );
    if (!isCollaborator)
      return res.status(403).json({ success: false, message: 'Not a collaborator' });
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });

    project.documents.push({
      name: req.file.originalname,
      url: req.file.path,
      uploadedBy: req.user._id,
    });
    await project.save();
    res.json({ success: true, message: 'Document uploaded', project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createProject, listProjects, myProjects, inviteUser, uploadDoc };
