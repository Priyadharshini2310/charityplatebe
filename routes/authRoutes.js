const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Changed to lowercase 'a'
const { protect } = require('../middleware/auth'); // Use the correct middleware
const {
  signup,
  verifyOTP,
  resendOTP,
  login,
  getCurrentUser,
  updateProfile // ✅ Import the new function
} = require('../controllers/authController');
// Public routes
router.post('/signup', authController.signup);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', authController.login);

// Protected route
router.get('/me', protect, authController.getCurrentUser);
router.put('/update-profile', protect, updateProfile)
module.exports = router;