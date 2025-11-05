// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
// protect middleware is already applied in server.js

// @desc    Get user's own events
// @route   GET /api/v1/events
// @access  Private (User sees their calendar)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user.id }).sort('startTime');
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Create a new event
// @route   POST /api/v1/events
// @access  Private
router.post('/', async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      owner: req.user.id,
      status: 'BUSY' // Default status
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Update an event (e.g., change status to SWAPPABLE)
// @route   PUT /api/v1/events/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Authorization check: Make sure user owns the event
    if (event.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this event' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;