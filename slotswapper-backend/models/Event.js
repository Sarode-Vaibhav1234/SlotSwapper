// models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  owner: { // Link to its owner (userId)
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'], // The required enum
    default: 'BUSY',
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);