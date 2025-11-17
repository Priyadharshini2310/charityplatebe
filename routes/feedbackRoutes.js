const express = require('express');
const { createFeedback } = require('../controllers/feedbackController');

const router = express.Router();

router.route('/').post(createFeedback);

module.exports = router;