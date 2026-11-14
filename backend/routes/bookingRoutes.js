/**
 * Booking Routes
 * /api/bookings
 */

const express = require('express');
const router = express.Router();
const {
    createBooking,
    getCustomerBookings,
    getGarageBookings,
    updateBookingStatus,
    getAdminMetrics
} = require('../controllers/bookingController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// All booking routes require authentication
router.use(verifyToken);

// Customer routes
router.post('/', createBooking);
router.get('/my', getCustomerBookings);
router.get('/user/:userId', getCustomerBookings);

// Garage routes
router.get('/center/:centerId', authorizeRoles('garage', 'admin'), getGarageBookings);
router.put('/:id/status', authorizeRoles('garage', 'admin'), updateBookingStatus);

// Admin metrics route
router.get('/admin/metrics', authorizeRoles('admin'), getAdminMetrics);

module.exports = router;
