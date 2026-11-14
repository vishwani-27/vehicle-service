-- ========================================================
-- Seed Data for Vehicle Service Booking System
-- SR University Hackathon 2026
-- ========================================================

USE vehicle_service_db;

-- Clear previous data safely in order of foreign key constraints
DELETE FROM feedback;
DELETE FROM bookings;
DELETE FROM service_centers;
DELETE FROM vehicles;
DELETE FROM users;

-- 1. Insert Initial Users (Admin, Garage Owners, Customer)
INSERT INTO users (userId, name, role, email, password, contact, location) VALUES
(1, 'System Administrator', 'admin', 'admin@vehicleservice.com', '$2b$10$MhX1sVKzaQXLIC5S0B1.M.OO5WgUuOBkMy.yG9GrEm2WySMmuokh6', '9876543210', 'Warangal, Telangana'),
(2, 'Speedy Auto Care (Ramesh)', 'garage', 'speedy@garage.com', '$2b$10$91wuCyQfldIo8hMQO3oTUuFVQ0XKXXBWxzj3qogndkWYh0QD665Ay', '9848012345', 'Hanamkonda, Warangal'),
(3, 'Apex Motors Workshop (Suresh)', 'garage', 'apex@garage.com', '$2b$10$91wuCyQfldIo8hMQO3oTUuFVQ0XKXXBWxzj3qogndkWYh0QD665Ay', '9848056789', 'Kazipet, Warangal'),
(4, 'City Bike & Car Care (Mahesh)', 'garage', 'city@garage.com', '$2b$10$91wuCyQfldIo8hMQO3oTUuFVQ0XKXXBWxzj3qogndkWYh0QD665Ay', '9848098765', 'Subedari, Hanamkonda'),
(5, 'Rahul Sharma', 'customer', 'rahul@gmail.com', '$2b$10$CwTXJEjBvzRpijBr.X3OOeSLhdWD/Jhb5jXJtyswpQzMBB8WgBlX6', '9123456780', 'SR University Campus, Warangal');

-- 2. Insert Service Centers (Preload 3 garages with exact question paper prices)
INSERT INTO service_centers (centerId, ownerId, name, address, contact, serviceTypes, priceList, availableSlots, isApproved) VALUES
(1, 2, 'Speedy Auto Care', 'Plot 12, Main Road, Hanamkonda', '9848012345',
 '["Oil Change", "Full Service", "Washing", "Brake Inspection", "Wheel Alignment"]',
 '{"Oil Change": 600, "Full Service": 1500, "Washing": 300, "Brake Inspection": 450, "Wheel Alignment": 500}',
 '["09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM"]',
 1),

(2, 3, 'Apex Motors Multi-brand Workshop', 'Near Railway Station, Kazipet', '9848056789',
 '["Oil Change", "Full Service", "Washing", "Engine Tuning", "AC Servicing"]',
 '{"Oil Change": 650, "Full Service": 1600, "Washing": 300, "Engine Tuning": 800, "AC Servicing": 1200}',
 '["09:30 AM - 11:30 AM", "11:30 AM - 01:30 PM", "02:30 PM - 04:30 PM", "04:30 PM - 06:30 PM"]',
 1),

(3, 4, 'City Bike & Car Care Station', 'Opposite Bus Stand, Subedari, Hanamkonda', '9848098765',
 '["Oil Change", "Full Service", "Washing", "Battery Check & Charge"]',
 '{"Oil Change": 600, "Full Service": 1400, "Washing": 250, "Battery Check & Charge": 350}',
 '["09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM"]',
 1);

-- 3. Insert Vehicles for Demo Customer (Rahul)
INSERT INTO vehicles (vehicleId, userId, registrationNumber, model, type, lastServiceDate) VALUES
(1, 5, 'TS 03 EA 4521', 'Hyundai i20 Asta', 'car', '2026-08-15'),
(2, 5, 'TS 03 FA 8812', 'Yamaha FZ-S V3', 'bike', '2026-09-10');
