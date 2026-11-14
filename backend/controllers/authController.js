/**
 * Authentication Controller
 * Handles user registration, login, and profile fetching
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'sr_hackathon_vehicle_booking_secret_key_2026';

// Register User (Customer, Garage Owner, or Admin)
async function register(req, res) {
    try {
        const { name, email, password, role, contact, location } = req.body;

        if (!name || !email || !password || !contact || !location) {
            return res.status(400).json({
                success: false,
                message: 'All fields (name, email, password, contact, location) are required.'
            });
        }

        const userRole = role && ['customer', 'garage', 'admin'].includes(role) ? role : 'customer';

        // Check if user already exists
        const [existing] = await pool.query('SELECT userId FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email address already exists.'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (name, role, email, password, contact, location) VALUES (?, ?, ?, ?, ?, ?)',
            [name, userRole, email, hashedPassword, contact, location]
        );

        const newUserId = result.insertId;

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUserId, email, role: userRole, name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            user: {
                userId: newUserId,
                name,
                email,
                role: userRole,
                contact,
                location
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during registration.',
            error: error.message
        });
    }
}

// Login User
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        // Fetch user from DB
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.userId, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            success: true,
            message: 'Login successful.',
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                contact: user.contact,
                location: user.location
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during login.',
            error: error.message
        });
    }
}

// Get logged-in user profile
async function getMe(req, res) {
    try {
        const [users] = await pool.query(
            'SELECT userId, name, role, email, contact, location, createdAt FROM users WHERE userId = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('getMe error:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
    }
}

module.exports = {
    register,
    login,
    getMe
};
