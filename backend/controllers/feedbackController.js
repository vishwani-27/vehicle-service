/**
 * Feedback Controller
 * Allows customers to rate and review completed service appointments
 */

const { pool } = require('../config/db');

// Add feedback for a completed booking
async function addFeedback(req, res) {
    try {
        const userId = req.user.userId;
        const { bookingId, rating, comment } = req.body;

        if (!bookingId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID and numerical rating (1 to 5) are required.'
            });
        }

        const numericRating = parseInt(rating, 10);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5.'
            });
        }

        // Verify booking exists, belongs to user, and is 'Completed'
        const [bookings] = await pool.query(
            'SELECT * FROM bookings WHERE bookingId = ? AND userId = ?',
            [bookingId, userId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or does not belong to your account.'
            });
        }

        if (bookings[0].status !== 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Feedback can only be submitted for completed services.'
            });
        }

        // Check if feedback already submitted
        const [existing] = await pool.query(
            'SELECT feedbackId FROM feedback WHERE bookingId = ?',
            [bookingId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Feedback has already been submitted for this booking.'
            });
        }

        // Insert feedback
        const [result] = await pool.query(
            'INSERT INTO feedback (bookingId, userId, rating, comment) VALUES (?, ?, ?, ?)',
            [bookingId, userId, numericRating, comment || '']
        );

        return res.status(201).json({
            success: true,
            message: 'Thank you! Your feedback has been submitted successfully.',
            feedbackId: result.insertId,
            rating: numericRating,
            comment
        });
    } catch (error) {
        console.error('Add feedback error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while submitting feedback.',
            error: error.message
        });
    }
}

// Get feedback for a service center
async function getCenterFeedback(req, res) {
    try {
        const centerId = req.params.centerId;

        const [feedbacks] = await pool.query(
            `SELECT f.feedbackId, f.rating, f.comment, f.createdAt,
                    u.name as customerName, b.serviceType
             FROM feedback f
             JOIN bookings b ON f.bookingId = b.bookingId
             JOIN users u ON f.userId = u.userId
             WHERE b.centerId = ?
             ORDER BY f.createdAt DESC`,
            [centerId]
        );

        const avgRating = feedbacks.length > 0
            ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
            : 0;

        return res.json({
            success: true,
            count: feedbacks.length,
            averageRating: parseFloat(avgRating),
            feedback: feedbacks
        });
    } catch (error) {
        console.error('Get feedback error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching feedback.',
            error: error.message
        });
    }
}

module.exports = {
    addFeedback,
    getCenterFeedback
};
