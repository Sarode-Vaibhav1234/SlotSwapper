
const mongoose = require('mongoose');

const SwapRequestSchema = new mongoose.Schema({
  requester: { // User who initiates the swap request (User A)
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  offeredSlot: { // The slot User A is offering (mySlotId)
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: true,
  },
  desiredSlot: { // The slot User B owns and User A wants (theirSlotId)
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING',
  },
}, { timestamps: true });

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);