const Event = require('./event.model');
const RSVP = require('./rsvp.model');
const Notification = require('../notifications/notification.model');
const User = require('../users/user.model');
const { upload } = require('../../config/cloudinary');

// @route POST /api/events/create-event
const createEvent = async (req, res) => {
  const { title, description, eventDate, location, capacity, type } = req.body;
  try {
    const eventData = { createdBy: req.user._id, title, description, eventDate, location, capacity, type };
    if (req.file) eventData.imageUrl = req.file.path;

    const event = await Event.create(eventData);
    await event.populate('createdBy', 'name avatar');

    const allUsers = await User.find({}, '_id');
    const notifications = allUsers
      .filter((u) => u._id.toString() !== req.user._id.toString())
      .map((u) => ({
        recipient: u._id,
        type: 'event_created',
        message: `New event: ${title} on ${new Date(eventDate).toDateString()}`,
        triggeredBy: req.user._id,
      }));
    await Notification.insertMany(notifications);

    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/events/list-events
const listEvents = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const events = await Event.find({ isActive: true })
      .populate('createdBy', 'name avatar')
      .sort({ eventDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Event.countDocuments({ isActive: true });
    res.json({ success: true, events, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/events/rsvp/:id
const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const existingRsvp = await RSVP.findOne({ event: event._id, user: req.user._id });
    if (existingRsvp) {
      await RSVP.deleteOne({ _id: existingRsvp._id });
      event.rsvpCount = Math.max(0, event.rsvpCount - 1);
      await event.save();
      return res.json({ success: true, rsvped: false, rsvpCount: event.rsvpCount });
    }

    if (event.rsvpCount >= event.capacity)
      return res.status(400).json({ success: false, message: 'Event is at capacity' });

    await RSVP.create({ event: event._id, user: req.user._id });
    event.rsvpCount += 1;
    await event.save();

    await Notification.create({
      recipient: event.createdBy,
      type: 'rsvp',
      message: `${req.user.name} RSVP'd to your event: ${event.title}`,
      triggeredBy: req.user._id,
    });

    res.json({ success: true, rsvped: true, rsvpCount: event.rsvpCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createEvent, listEvents, rsvpEvent };
