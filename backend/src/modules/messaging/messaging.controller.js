const Message = require('./message.model');

// @route GET /api/messaging/chat-history/:roomId
const getChatHistory = async (req, res) => {
  const { roomId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  try {
    const messages = await Message.find({ room: roomId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/messaging/my-rooms
const getMyRooms = async (req, res) => {
  try {
    const rooms = await Message.aggregate([
      { $group: { _id: '$room', lastMessage: { $last: '$text' }, lastTime: { $last: '$createdAt' } } },
      { $match: { _id: { $regex: req.user._id.toString() } } },
      { $sort: { lastTime: -1 } },
    ]);
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getChatHistory, getMyRooms };
