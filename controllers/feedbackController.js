const Feedback = require('../models/Feedback');

// @desc    Create new feedback
// @route   POST /api/v1/feedback
// @access  Public
exports.createFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.create(req.body);

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    // Basic error handling (e.g., validation errors)
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};