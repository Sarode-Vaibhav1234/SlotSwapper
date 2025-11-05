// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Create user
    const user = await User.create({ name, email, password });

    // 2. Respond with token (simplified for now, see sendTokenResponse)
    const token = user.getSignedJwtToken();
    res.status(201).json({ success: true, token });
  } catch (error) {
    // Handle validation errors (e.g., duplicate email)
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. Basic validation
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide an email and password' });
  }

  // 2. Check for user (select: true to include password)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  // 3. Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  // 4. Respond with token
  const token = user.getSignedJwtToken();
  res.status(200).json({ success: true, token });
});

module.exports = router;