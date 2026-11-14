/**
 * Booking Controller
 * Manages appointment creation, garage status updates, and booking history
 */

const { pool } = require('../config/db');

// 1. Create a new booking (Customer)
async function createBooking(req, res) {
    try {
        const userId = req.user.userId;
        const { vehicleId, centerId, serviceType, date, timeSlot } = req.body;

        if (!vehicleId || !centerId || !serviceType || !date || !timeSlot) {
            return res.status(400).json({
                success: false,
                message: 'All booking fields (vehicleId, centerId, serviceType, date, timeSlot) are required.'
            });
        }

        // Verify vehicle belongs to user
        const [vehicle] = await pool.query(
            'SELECT vehicleId, registrationNumber, model FROM vehicles WHERE vehicleId = ? AND userId = ?',
            [vehicleId, userId]
        );
        if (vehicle.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Selected vehicle does not belong to your account.'
            });
        }

        // Verify service center exists
        const [center] = await pool.query(
            'SELECT centerId, name FROM service_centers WHERE centerId = ?',
            [centerId]
        );
        if (center.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Selected service center not found.'
            });
        }

        // Insert booking with initial status 'Pending'
        const [result] = await pool.query(
            `INSERT INTO bookings (userId, vehicleId, centerId, serviceType, date, timeSlot, status, remarks)
             VALUES (?, ?, ?, ?, ?, ?, 'Pending', 'Awaiting garage confirmation')`,
            [userId, vehicleId, centerId, serviceType, date, timeSlot]
        );

        return res.status(201).json({
            success: true,
            message: 'Appointment booking submitted successfully. Current status is Pending.',
            bookingId: result.insertId,
            status: 'Pending'
        });
    } catch (error) {
        console.error('Create booking error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while creating booking.',
            error: error.message
        });
    }
}

// 2. Get bookings for the logged-in customer
async function getCustomerBookings(req, res) {
    try {
        // Can be called via /api/bookings/my or /api/bookings/user/:userId
        const userId = req.params.userId || req.user.userId;

        const [bookings] = await pool.query(
            `SELECT b.bookingId, b.userId, b.vehicleId, b.centerId, b.serviceType, 
                    DATE_FORMAT(b.date, '%Y-%m-%d') as date, b.timeSlot, b.status, b.remarks, b.createdAt,
                    v.registrationNumber, v.model as vehicleModel, v.type as vehicleType,
                    sc.name as centerName, sc.address as centerAddress, sc.contact as centerContact,
                    f.feedbackId, f.rating, f.comment as feedbackComment
             FROM bookings b
             JOIN vehicles v ON b.vehicleId = v.vehicleId
             JOIN service_centers sc ON b.centerId = sc.centerId
             LEFT JOIN feedback f ON b.bookingId = f.bookingId
             WHERE b.userId = ?
             ORDER BY b.createdAt DESC`,
            [userId]
        );

        return res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get customer bookings error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching bookings.',
            error: error.message
        });
    }
}

// 3. Get bookings for a specific service center (Garage Owner)
async function getGarageBookings(req, res) {
    try {
        const centerId = req.params.centerId;

        // Verify the user owns this center (or is admin)
        if (req.user.role !== 'admin') {
            const [center] = await pool.query(
                'SELECT centerId FROM service_centers WHERE centerId = ? AND ownerId = ?',
                [centerId, req.user.userId]
            );
            if (center.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You do not own this service center.'
                });
            }
        }

        const [bookings] = await pool.query(
            `SELECT b.bookingId, b.userId, b.vehicleId, b.centerId, b.serviceType, 
                    DATE_FORMAT(b.date, '%Y-%m-%d') as date, b.timeSlot, b.status, b.remarks, b.createdAt,
                    u.name as customerName, u.contact as customerContact, u.email as customerEmail,
                    v.registrationNumber, v.model as vehicleModel, v.type as vehicleType
             FROM bookings b
             JOIN users u ON b.userId = u.userId
             JOIN vehicles v ON b.vehicleId = v.vehicleId
             WHERE b.centerId = ?
             ORDER BY b.createdAt DESC`,
            [centerId]
        );

        return res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get garage bookings error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching center bookings.',
            error: error.message
        });
    }
}

// 4. Update booking status (Garage Owner: Pending -> Confirmed/Rejected -> Completed)
async function updateBookingStatus(req, res) {
    try {
        const bookingId = req.params.id;
        const { status, remarks } = req.body;

        const validStatuses = ['Pending', 'Confirmed', 'Rejected', 'Completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Get booking and verify garage ownership
        const [booking] = await pool.query(
            'SELECT b.*, sc.ownerId FROM bookings b JOIN service_centers sc ON b.centerId = sc.centerId WHERE b.bookingId = ?',
            [bookingId]
        );

        if (booking.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        if (booking[0].ownerId !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You are not authorized to update this booking.'
            });
        }

        const defaultRemarks = remarks || (
            status === 'Confirmed' ? 'Appointment confirmed. Please arrive on time.' :
            status === 'Rejected' ? 'Slot unavailable. Please select another slot.' :
            status === 'Completed' ? 'Service completed successfully.' : 'Status updated.'
        );

        await pool.query(
            'UPDATE bookings SET status = ?, remarks = ? WHERE bookingId = ?',
            [status, defaultRemarks, bookingId]
        );

        // If completed, optionally update lastServiceDate on the vehicle
        if (status === 'Completed') {
            await pool.query(
                'UPDATE vehicles SET lastServiceDate = CURRENT_DATE WHERE vehicleId = ?',
                [booking[0].vehicleId]
            );
        }

        return res.json({
            success: true,
            message: `Booking status successfully updated to ${status}.`,
            bookingId,
            status,
            remarks: defaultRemarks
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating booking status.',
            error: error.message
        });
    }
}

// 5. Admin Metrics & Activity Monitor
async function getAdminMetrics(req, res) {
    try {
        const [[usersCount]] = await pool.query('SELECT COUNT(*) as total FROM users');
        const [[bookingsCount]] = await pool.query('SELECT COUNT(*) as total FROM bookings');
        const [[centersCount]] = await pool.query('SELECT COUNT(*) as total FROM service_centers');
        const [[vehiclesCount]] = await pool.query('SELECT COUNT(*) as total FROM vehicles');

        const [recentBookings] = await pool.query(
            `SELECT b.bookingId, b.serviceType, DATE_FORMAT(b.date, '%Y-%m-%d') as date, b.status,
                    u.name as customerName, sc.name as centerName
             FROM bookings b
             JOIN users u ON b.userId = u.userId
             JOIN service_centers sc ON b.centerId = sc.centerId
             ORDER BY b.createdAt DESC LIMIT 10`
        );

        const [statusBreakdown] = await pool.query(
            'SELECT status, COUNT(*) as count FROM bookings GROUP BY status'
        );

        return res.json({
            success: true,
            metrics: {
                totalUsers: usersCount.total,
                totalBookings: bookingsCount.total,
                totalCenters: centersCount.total,
                totalVehicles: vehiclesCount.total
            },
            statusBreakdown,
            recentBookings
        });
    } catch (error) {
        console.error('Admin metrics error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching metrics.',
            error: error.message
        });
    }
}

module.exports = {
    createBooking,
    getCustomerBookings,
    getGarageBookings,
    updateBookingStatus,
    getAdminMetrics
};
