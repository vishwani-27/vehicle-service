/**
 * Vehicle Routes
 * /api/vehicles
 */

const express = require('express');
const router = express.Router();
const { addVehicle, getMyVehicles, deleteVehicle } = require('../controllers/vehicleController');
const { verifyToken } = require('../middleware/auth');

// All vehicle operations require authentication
router.use(verifyToken);

router.post('/', addVehicle);
router.get('/', getMyVehicles);
router.delete('/:id', deleteVehicle);

module.exports = router;
