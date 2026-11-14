/**
 * Offline / Demo Data Module
 * Preloaded data per Problem Statement Section 7.4 (Data Simulation / Offline Use)
 * Used when MySQL is not available (e.g. on Render free tier without cloud DB)
 */

const bcrypt = require('bcryptjs');

// Pre-hashed passwords (generated from bcryptjs)
const DEMO_USERS = [
    { userId: 1, name: 'System Administrator', role: 'admin', email: 'admin@vehicleservice.com', password: '$2b$10$MhX1sVKzaQXLIC5S0B1.M.OO5WgUuOBkMy.yG9GrEm2WySMmuokh6', contact: '9876543210', location: 'Warangal, Telangana', createdAt: '2026-11-14T00:00:00Z' },
    { userId: 2, name: 'Speedy Auto Care (Ramesh)', role: 'garage', email: 'speedy@garage.com', password: '$2b$10$91wuCyQfldIo8hMQO3oTUuFVQ0XKXXBWxzj3qogndkWYh0QD665Ay', contact: '9848012345', location: 'Hanamkonda, Warangal', createdAt: '2026-11-14T00:00:00Z' },
    { userId: 3, name: 'Apex Motors Workshop (Suresh)', role: 'garage', email: 'apex@garage.com', password: '$2b$10$91wuCyQfldIo8hMQO3oTUuFVQ0XKXXBWxzj3qogndkWYh0QD665Ay', contact: '9848056789', location: 'Kazipet, Warangal', createdAt: '2026-11-14T00:00:00Z' },
    { userId: 4, name: 'City Bike & Car Care (Mahesh)', role: 'garage', email: 'city@garage.com', password: '$2b$10$91wuCyQfldIo8hMQO3oTUuFVQ0XKXXBWxzj3qogndkWYh0QD665Ay', contact: '9848098765', location: 'Subedari, Hanamkonda', createdAt: '2026-11-14T00:00:00Z' },
    { userId: 5, name: 'Rahul Sharma', role: 'customer', email: 'rahul@gmail.com', password: '$2b$10$CwTXJEjBvzRpijBr.X3OOeSLhdWD/Jhb5jXJtyswpQzMBB8WgBlX6', contact: '9123456780', location: 'SR University Campus, Warangal', createdAt: '2026-11-14T00:00:00Z' }
];

const DEMO_CENTERS = [
    {
        centerId: 1, ownerId: 2, name: 'Speedy Auto Care',
        address: 'Plot 12, Main Road, Hanamkonda', contact: '9848012345',
        serviceTypes: ['Oil Change', 'Full Service', 'Washing', 'Brake Inspection', 'Wheel Alignment'],
        priceList: { 'Oil Change': 600, 'Full Service': 1500, 'Washing': 300, 'Brake Inspection': 450, 'Wheel Alignment': 500 },
        availableSlots: ['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM'],
        isApproved: 1, createdAt: '2026-11-14T00:00:00Z'
    },
    {
        centerId: 2, ownerId: 3, name: 'Apex Motors Multi-brand Workshop',
        address: 'Near Railway Station, Kazipet', contact: '9848056789',
        serviceTypes: ['Oil Change', 'Full Service', 'Washing', 'Engine Tuning', 'AC Servicing'],
        priceList: { 'Oil Change': 650, 'Full Service': 1600, 'Washing': 300, 'Engine Tuning': 800, 'AC Servicing': 1200 },
        availableSlots: ['09:30 AM - 11:30 AM', '11:30 AM - 01:30 PM', '02:30 PM - 04:30 PM', '04:30 PM - 06:30 PM'],
        isApproved: 1, createdAt: '2026-11-14T00:00:00Z'
    },
    {
        centerId: 3, ownerId: 4, name: 'City Bike & Car Care Station',
        address: 'Opposite Bus Stand, Subedari, Hanamkonda', contact: '9848098765',
        serviceTypes: ['Oil Change', 'Full Service', 'Washing', 'Battery Check & Charge'],
        priceList: { 'Oil Change': 600, 'Full Service': 1400, 'Washing': 250, 'Battery Check & Charge': 350 },
        availableSlots: ['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM'],
        isApproved: 1, createdAt: '2026-11-14T00:00:00Z'
    }
];

const DEMO_VEHICLES = [
    { vehicleId: 1, userId: 5, registrationNumber: 'TS 03 EA 4521', model: 'Hyundai i20 Asta', type: 'car', lastServiceDate: '2026-08-15', createdAt: '2026-11-14T00:00:00Z' },
    { vehicleId: 2, userId: 5, registrationNumber: 'TS 03 FA 8812', model: 'Yamaha FZ-S V3', type: 'bike', lastServiceDate: '2026-09-10', createdAt: '2026-11-14T00:00:00Z' }
];

// In-memory mutable stores for demo mode bookings and feedback
let demoBookings = [];
let demoFeedback = [];
let nextBookingId = 1;
let nextFeedbackId = 1;
let nextUserId = 6;
let nextVehicleId = 3;

// Mutable copy of users and vehicles so registration / vehicle add works in demo
let demoUsers = [...DEMO_USERS];
let demoVehicles = [...DEMO_VEHICLES];

module.exports = {
    DEMO_USERS,
    DEMO_CENTERS,
    DEMO_VEHICLES,
    get demoUsers() { return demoUsers; },
    get demoVehicles() { return demoVehicles; },
    get demoBookings() { return demoBookings; },
    get demoFeedback() { return demoFeedback; },
    addDemoUser(user) { user.userId = nextUserId++; demoUsers.push(user); return user; },
    addDemoVehicle(v) { v.vehicleId = nextVehicleId++; demoVehicles.push(v); return v; },
    addDemoBooking(b) { b.bookingId = nextBookingId++; b.createdAt = new Date().toISOString(); demoBookings.push(b); return b; },
    addDemoFeedback(f) { f.feedbackId = nextFeedbackId++; f.createdAt = new Date().toISOString(); demoFeedback.push(f); return f; }
};
