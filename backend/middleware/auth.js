/**
 * Authentication Middleware
 * Verifies JWT token in Authorization header
 */

const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <TOKEN>

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No authentication token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sr_hackathon_vehicle_booking_secret_key_2026');
        req.user = decoded; // Contains userId, email, role, name
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired authentication token.'
        });
    }
}

// Role-based authorization middleware
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
}

module.exports = {
    verifyToken,
    authorizeRoles
};
