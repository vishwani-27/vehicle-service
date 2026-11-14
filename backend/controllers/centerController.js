/**
 * Service Center Controller
 * Manages service centers, pricing, and available slots
 */

const { pool } = require('../config/db');

// Helper to safely parse JSON or return original
function safeJsonParse(data, fallback = []) {
    if (!data) return fallback;
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data);
    } catch {
        return fallback;
    }
}

// Format center record for API responses
function formatCenter(center) {
    return {
        ...center,
        serviceTypes: safeJsonParse(center.serviceTypes, []),
        priceList: safeJsonParse(center.priceList, {}),
        availableSlots: safeJsonParse(center.availableSlots, [
            '09:00 AM - 11:00 AM',
            '11:00 AM - 01:00 PM',
            '02:00 PM - 04:00 PM',
            '04:00 PM - 06:00 PM'
        ])
    };
}

// Get all service centers (public/customer)
async function getAllCenters(req, res) {
    try {
        const { search, approvedOnly } = req.query;
        let query = 'SELECT * FROM service_centers';
        const params = [];

        // By default show approved centers unless admin requests all
        const filterApproved = approvedOnly !== 'false';
        if (filterApproved) {
            query += ' WHERE isApproved = 1';
        }

        if (search) {
            query += filterApproved ? ' AND' : ' WHERE';
            query += ' (name LIKE ? OR address LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY createdAt DESC';

        const [centers] = await pool.query(query, params);
        const formatted = centers.map(formatCenter);

        return res.json({
            success: true,
            count: formatted.length,
            centers: formatted
        });
    } catch (error) {
        console.error('Get all centers error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching service centers.',
            error: error.message
        });
    }
}

// Get single service center by ID
async function getCenterById(req, res) {
    try {
        const centerId = req.params.id;
        const [centers] = await pool.query('SELECT * FROM service_centers WHERE centerId = ?', [centerId]);

        if (centers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service center not found.'
            });
        }

        return res.json({
            success: true,
            center: formatCenter(centers[0])
        });
    } catch (error) {
        console.error('Get center by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching center details.',
            error: error.message
        });
    }
}

// Add a new service center (Garage Owner)
async function addCenter(req, res) {
    try {
        const ownerId = req.user.userId;
        const { name, address, contact, serviceTypes, priceList, availableSlots } = req.body;

        if (!name || !address || !contact) {
            return res.status(400).json({
                success: false,
                message: 'Center name, address, and contact number are required.'
            });
        }

        // Standard default services & pricing if none provided
        const defaultServices = serviceTypes || ["Oil Change", "Full Service", "Washing"];
        const defaultPriceList = priceList || { "Oil Change": 600, "Full Service": 1500, "Washing": 300 };
        const defaultSlots = availableSlots || [
            "09:00 AM - 11:00 AM",
            "11:00 AM - 01:00 PM",
            "02:00 PM - 04:00 PM",
            "04:00 PM - 06:00 PM"
        ];

        const [result] = await pool.query(
            'INSERT INTO service_centers (ownerId, name, address, contact, serviceTypes, priceList, availableSlots, isApproved) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
            [
                ownerId,
                name.trim(),
                address.trim(),
                contact.trim(),
                JSON.stringify(defaultServices),
                JSON.stringify(defaultPriceList),
                JSON.stringify(defaultSlots)
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Service center registered successfully.',
            centerId: result.insertId
        });
    } catch (error) {
        console.error('Add center error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while registering service center.',
            error: error.message
        });
    }
}

// Get center owned by logged-in garage owner
async function getMyCenter(req, res) {
    try {
        const ownerId = req.user.userId;
        const [centers] = await pool.query('SELECT * FROM service_centers WHERE ownerId = ?', [ownerId]);

        if (centers.length === 0) {
            return res.json({
                success: true,
                center: null,
                message: 'No service center registered under your account yet.'
            });
        }

        return res.json({
            success: true,
            center: formatCenter(centers[0])
        });
    } catch (error) {
        console.error('Get my center error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching your center.',
            error: error.message
        });
    }
}

// Update center services and prices (Garage Owner)
async function updateCenter(req, res) {
    try {
        const centerId = req.params.id;
        const ownerId = req.user.userId;
        const { name, address, contact, serviceTypes, priceList, availableSlots } = req.body;

        // Verify ownership (or admin)
        const [existing] = await pool.query('SELECT * FROM service_centers WHERE centerId = ?', [centerId]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Service center not found.' });
        }

        if (existing[0].ownerId !== ownerId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You do not have permission to update this center.' });
        }

        const updatedName = name || existing[0].name;
        const updatedAddress = address || existing[0].address;
        const updatedContact = contact || existing[0].contact;
        const updatedServices = serviceTypes ? JSON.stringify(serviceTypes) : existing[0].serviceTypes;
        const updatedPrices = priceList ? JSON.stringify(priceList) : existing[0].priceList;
        const updatedSlots = availableSlots ? JSON.stringify(availableSlots) : existing[0].availableSlots;

        await pool.query(
            'UPDATE service_centers SET name = ?, address = ?, contact = ?, serviceTypes = ?, priceList = ?, availableSlots = ? WHERE centerId = ?',
            [updatedName, updatedAddress, updatedContact, updatedServices, updatedPrices, updatedSlots, centerId]
        );

        return res.json({
            success: true,
            message: 'Service center updated successfully.'
        });
    } catch (error) {
        console.error('Update center error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating service center.',
            error: error.message
        });
    }
}

module.exports = {
    getAllCenters,
    getCenterById,
    addCenter,
    getMyCenter,
    updateCenter
};
