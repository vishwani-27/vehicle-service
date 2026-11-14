/**
 * Service Center Routes
 * /api/centers
 */

const express = require('express');
const router = express.Router();
const {
    getAllCenters,
    getCenterById,
    addCenter,
    getMyCenter,
    updateCenter
} = require('../controllers/centerController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Public routes (anyone/customer can view centers)
router.get('/', getAllCenters);
router.get('/owner/me', verifyToken, authorizeRoles('garage', 'admin'), getMyCenter);
router.get('/:id', getCenterById);

// Protected routes (Garage owner / Admin)
router.post('/', verifyToken, authorizeRoles('garage', 'admin'), addCenter);
router.put('/:id', verifyToken, authorizeRoles('garage', 'admin'), updateCenter);

module.exports = router;
