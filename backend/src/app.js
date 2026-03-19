const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Message = require('./modules/messaging/message.model');
const Notification = require('./modules/notifications/notification.model');
const User = require('./modules/users/user.model');

// Route imports
const userRoutes = require('./modules/users/user.routes');
const feedRoutes = require('./modules/feed/feed.routes');
const jobsRoutes = require('./modules/jobs/jobs.routes');
const eventsRoutes = require('./modules/events/events.routes');
const researchRoutes = require('./modules/research/research.routes');
const messagingRoutes = require('./modules/messaging/messaging.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// API Routes
app.use('/api', userRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error' });
});

// ─── Socket.IO (Real-time Messaging) ──────────────────────────────────────────
const onlineUsers = new Map(); // userId -> socketId

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user._id.toString();
  onlineUsers.set(userId, socket.id);
  io.emit('users:online', Array.from(onlineUsers.keys()));
  console.log(`🟢 Socket connected: ${socket.user.name} (${socket.id})`);

  // Join a DM or group room
  socket.on('room:join', (roomId) => {
    socket.join(roomId);
    socket.emit('room:joined', { roomId });
  });

  // Send a message
  socket.on('message:send', async ({ roomId, text }) => {
    try {
      const message = await Message.create({ room: roomId, sender: userId, text });
      await message.populate('sender', 'name avatar');
      io.to(roomId).emit('message:receive', message);

      // Notify other users in the room
      const roomSockets = await io.in(roomId).fetchSockets();
      const roomUserIds = roomSockets.map((s) => s.user._id.toString()).filter((id) => id !== userId);
      for (const recipientId of roomUserIds) {
        await Notification.create({
          recipient: recipientId,
          type: 'new_message',
          message: `${socket.user.name} sent you a message`,
          triggeredBy: userId,
        });
      }
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Typing indicator
  socket.on('typing:start', ({ roomId }) => {
    socket.to(roomId).emit('typing:start', { userId, name: socket.user.name });
  });
  socket.on('typing:stop', ({ roomId }) => {
    socket.to(roomId).emit('typing:stop', { userId });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('users:online', Array.from(onlineUsers.keys()));
    console.log(`🔴 Socket disconnected: ${socket.user.name}`);
  });
});

module.exports = { app, server };
