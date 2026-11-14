/**
 * Vehicle Controller
 * Manages vehicles for customers
 */

const { pool } = require('../config/db');

// Add a new vehicle
async function addVehicle(req, res) {
    try {
        const userId = req.user.userId;
        const { registrationNumber, model, type, lastServiceDate } = req.body;

        if (!registrationNumber || !model) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle registration number and model are required.'
            });
        }

        const vehicleType = type && ['car', 'bike'].includes(type.toLowerCase()) ? type.toLowerCase() : 'car';
        const serviceDate = lastServiceDate || null;

        const [result] = await pool.query(
            'INSERT INTO vehicles (userId, registrationNumber, model, type, lastServiceDate) VALUES (?, ?, ?, ?, ?)',
            [userId, registrationNumber.toUpperCase().trim(), model.trim(), vehicleType, serviceDate]
        );

        return res.status(201).json({
            success: true,
            message: 'Vehicle added successfully.',
            vehicle: {
                vehicleId: result.insertId,
                userId,
                registrationNumber: registrationNumber.toUpperCase().trim(),
                model: model.trim(),
                type: vehicleType,
                lastServiceDate: serviceDate
            }
        });
    } catch (error) {
        console.error('Add vehicle error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while adding vehicle.',
            error: error.message
        });
    }
}

// Get all vehicles for logged-in user
async function getMyVehicles(req, res) {
    try {
        const userId = req.user.userId;

        const [vehicles] = await pool.query(
            'SELECT vehicleId, registrationNumber, model, type, lastServiceDate, createdAt FROM vehicles WHERE userId = ? ORDER BY createdAt DESC',
            [userId]
        );

        return res.json({
            success: true,
            count: vehicles.length,
            vehicles
        });
    } catch (error) {
        console.error('Get vehicles error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching vehicles.',
            error: error.message
        });
    }
}

// Delete a vehicle
async function deleteVehicle(req, res) {
    try {
        const userId = req.user.userId;
        const vehicleId = req.params.id;

        const [result] = await pool.query(
            'DELETE FROM vehicles WHERE vehicleId = ? AND userId = ?',
            [vehicleId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found or does not belong to your account.'
            });
        }

        return res.json({
            success: true,
            message: 'Vehicle deleted successfully.'
        });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting vehicle.',
            error: error.message
        });
    }
}

module.exports = {
    addVehicle,
    getMyVehicles,
    deleteVehicle
};
