// routes/swaps.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');
const mongoose = require('mongoose');

// --- 3. The Swap Logic ---

// @desc    Get all swappable slots from OTHER users (Marketplace)
// @route   GET /api/v1/swaps/swappable-slots
// @access  Private
router.get('/swappable-slots', async (req, res) => {
  try {
    // Return all events that are SWAPPABLE and NOT owned by the logged-in user
    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      owner: { $ne: req.user.id } // $ne = Not Equal
    }).populate('owner', 'name email'); // Populate owner's name/email for display

    res.status(200).json({ success: true, count: swappableSlots.length, data: swappableSlots });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// @desc    Initiate a swap request (User A)
// @route   POST /api/v1/swaps/request
// @access  Private
router.post('/request', async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Verify and fetch both slots within the transaction
    const mySlot = await Event.findById(mySlotId).session(session);
    const theirSlot = await Event.findById(theirSlotId).session(session);

    // Basic existence check
    if (!mySlot || !theirSlot) {
      throw new Error('One or both slots not found.');
    }

    // Validation: Check ownership and status
    if (mySlot.owner.toString() !== req.user.id) {
      throw new Error('mySlotId does not belong to the authenticated user.');
    }
    if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
      throw new Error('One or both slots are not currently SWAPPABLE.');
    }

    // 2. Create new SwapRequest
    const swapRequest = await SwapRequest.create([{
      requester: req.user.id,
      offeredSlot: mySlotId,
      desiredSlot: theirSlotId,
      status: 'PENDING',
    }], { session });

    // 3. Update status of both slots to SWAP_PENDING
    await Event.findByIdAndUpdate(mySlotId, { status: 'SWAP_PENDING' }, { session });
    await Event.findByIdAndUpdate(theirSlotId, { status: 'SWAP_PENDING' }, { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: swapRequest[0] });
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: error.message });
  }
});


// @desc    Respond to a swap request (User B)
// @route   POST /api/v1/swaps/response/:requestId
// @access  Private
router.post('/response/:requestId', async (req, res) => {
  const { accept } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Fetch the request
    const request = await SwapRequest.findById(req.params.requestId)
      .populate('offeredSlot')
      .populate('desiredSlot')
      .session(session);

    if (!request) {
      throw new Error('Swap request not found.');
    }

    // Authorization: Ensure the responder owns the desired slot
    if (request.desiredSlot.owner.toString() !== req.user.id) {
      throw new Error('Not authorized to respond to this request.');
    }

    if (request.status !== 'PENDING') {
      throw new Error(`Swap request is no longer PENDING (Current Status: ${request.status}).`);
    }

    const mySlot = request.desiredSlot; // The slot the responder (User B) owns
    const theirSlot = request.offeredSlot; // The slot the requester (User A) owns

    if (!accept) {
      // **If Rejected:**
      await SwapRequest.findByIdAndUpdate(req.params.requestId, { status: 'REJECTED' }, { session });
      // Set both slots back to SWAPPABLE
      await Event.findByIdAndUpdate(mySlot._id, { status: 'SWAPPABLE' }, { session });
      await Event.findByIdAndUpdate(theirSlot._id, { status: 'SWAPPABLE' }, { session });

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ success: true, message: 'Swap request rejected. Slots restored to SWAPPABLE.' });
    } else {
      // **If Accepted (The Key Transaction):**

      // 1. Exchange owners (The core swap)
      const originalOwnerA = theirSlot.owner; // User A
      const originalOwnerB = mySlot.owner;   // User B (req.user.id)

      await Event.findByIdAndUpdate(theirSlot._id, { owner: originalOwnerB, status: 'BUSY' }, { session });
      await Event.findByIdAndUpdate(mySlot._id, { owner: originalOwnerA, status: 'BUSY' }, { session });

      // 2. Mark SwapRequest ACCEPTED
      await SwapRequest.findByIdAndUpdate(req.params.requestId, { status: 'ACCEPTED' }, { session });

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ success: true, message: 'Swap accepted! Calendars updated.', updatedSlots: [theirSlot._id, mySlot._id] });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // In case of error (like a slot no longer being PENDING), try to revert to SWAPPABLE status just in case
    // NOTE: For brevity, full error recovery is complex; we rely on the PENDING check above.
    res.status(400).json({ success: false, error: error.message });
  }
});


// @desc    Get all pending incoming and outgoing requests
// @route   GET /api/v1/swaps/requests
// @access  Private (Notifications/Requests View)
router.get('/requests', async (req, res) => {
  try {
    // 1. Incoming Requests (Desired Slot's owner is the logged-in user)
    const incoming = await SwapRequest.find({
      status: 'PENDING',
      'desiredSlot': { $in: await Event.find({ owner: req.user.id }).select('_id') } // Find slots owned by user, then find requests for those slots
    })
      .populate({ path: 'offeredSlot', populate: { path: 'owner', select: 'name' } }) // Populate slot being offered and its owner
      .populate('desiredSlot');

    // 2. Outgoing Requests (Requester is the logged-in user)
    const outgoing = await SwapRequest.find({
      status: 'PENDING',
      requester: req.user.id
    })
      .populate({ path: 'desiredSlot', populate: { path: 'owner', select: 'name' } }) // Populate slot being desired and its owner
      .populate('offeredSlot');

    res.status(200).json({
      success: true,
      data: {
        incoming,
        outgoing
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;