const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    eventDate: { type: Date, required: true },
    location: { type: String, default: 'TBD' },
    capacity: { type: Number, default: 100 },
    rsvpCount: { type: Number, default: 0 },
    type: { type: String, enum: ['workshop', 'seminar', 'social', 'other'], default: 'other' },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
