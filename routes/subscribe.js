const express = require('express');
const router = express.Router();
const { sendSubscriptionEmail } = require('../services/emailService');

// Newsletter subscription endpoint
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    await sendSubscriptionEmail(email);
    
    res.status(200).json({ 
      success: true, 
      message: 'Subscription successful! Check your email.' 
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ 
      error: 'Failed to send confirmation email. Please try again.' 
    });
  }
});

module.exports = router;