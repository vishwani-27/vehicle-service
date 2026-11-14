-- ========================================================
-- Vehicle Service Booking System - Database Schema (MySQL)
-- SR University Hackathon 2026
-- ========================================================

CREATE DATABASE IF NOT EXISTS vehicle_service_db;
USE vehicle_service_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role ENUM('customer', 'garage', 'admin') NOT NULL DEFAULT 'customer',
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    location VARCHAR(150) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
    vehicleId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    registrationNumber VARCHAR(30) NOT NULL,
    model VARCHAR(100) NOT NULL,
    type ENUM('car', 'bike') NOT NULL DEFAULT 'car',
    lastServiceDate DATE NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

-- 3. SERVICE CENTERS TABLE
CREATE TABLE IF NOT EXISTS service_centers (
    centerId INT AUTO_INCREMENT PRIMARY KEY,
    ownerId INT NULL,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    serviceTypes TEXT NOT NULL,       -- JSON string of services offered
    priceList TEXT NOT NULL,          -- JSON string mapping service -> price
    availableSlots TEXT NOT NULL,     -- e.g. "09:00 AM - 11:00 AM, 11:00 AM - 01:00 PM, 02:00 PM - 04:00 PM, 04:00 PM - 06:00 PM"
    isApproved BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ownerId) REFERENCES users(userId) ON DELETE SET NULL
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    bookingId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    vehicleId INT NOT NULL,
    centerId INT NOT NULL,
    serviceType VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    timeSlot VARCHAR(50) NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Rejected', 'Completed') NOT NULL DEFAULT 'Pending',
    remarks TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (vehicleId) REFERENCES vehicles(vehicleId) ON DELETE CASCADE,
    FOREIGN KEY (centerId) REFERENCES service_centers(centerId) ON DELETE CASCADE
);

-- 5. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
    feedbackId INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT NOT NULL,
    userId INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingId) REFERENCES bookings(bookingId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);
