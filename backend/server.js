/**
 * Vehicle Service Booking System - Backend Server
 * SR University Web Technologies & Mobile Programming Hackathon 2026
 * Tech Stack: Node.js, Express.js, MySQL
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const { testConnection } = require('./config/db');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const centerRoutes = require('./routes/centerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Vehicle Service Booking System API is running smoothly.',
        time: new Date().toISOString()
    });
});

// Root route fallback to frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global 404 handler for unknown API routes
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Requested API endpoint not found.'
    });
});

// Start server
async function startServer() {
    await testConnection();
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
    return server;
}

// Only auto-start when run directly
if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
