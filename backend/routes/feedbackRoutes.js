/**
 * Feedback Routes
 * /api/feedback
 */

const express = require('express');
const router = express.Router();
const { addFeedback, getCenterFeedback } = require('../controllers/feedbackController');
const { verifyToken } = require('../middleware/auth');

// Public route to view garage feedback
router.get('/center/:centerId', getCenterFeedback);

// Customer submits feedback (requires auth)
router.post('/', verifyToken, addFeedback);

module.exports = router;
