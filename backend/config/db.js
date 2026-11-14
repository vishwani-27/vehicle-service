const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

// Track database connectivity
let dbConnected = false;

// Create connection pool for MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vehicle_service_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Helper function to test DB connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL Database (vehicle_service_db) successfully.');
        connection.release();
        dbConnected = true;
        return true;
    } catch (error) {
        console.error('❌ MySQL Database connection failed:', error.message);
        console.log('⚠️  Running in OFFLINE / DEMO mode with preloaded data (Section 7.4).');
        dbConnected = false;
        return false;
    }
}

// Check if DB is available
function isDbConnected() {
    return dbConnected;
}

module.exports = {
    pool,
    testConnection,
    isDbConnected
};
