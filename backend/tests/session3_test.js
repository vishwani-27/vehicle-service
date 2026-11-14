/**
 * Session 3 Test Suite: Booking Workflow, Status Engine & Feedback
 * End-to-end verification of the booking lifecycle
 */

const { startServer } = require('../server');

async function runTests() {
    console.log('🧪 Starting Session 3 Automated Test Suite...\n');
    let server;
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  ✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${message}`);
            failed++;
        }
    }

    try {
        server = await startServer();
        const BASE_URL = 'http://localhost:5000';

        // 1. Log in Customer & Garage Owner
        const custLogin = await (await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'rahul@gmail.com', password: 'customer123' })
        })).json();
        const custToken = custLogin.token;

        const garageLogin = await (await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'speedy@garage.com', password: 'garage123' })
        })).json();
        const garageToken = garageLogin.token;

        // 2. Customer creates an appointment booking
        console.log('--- 1. Testing Appointment Booking Creation ---');
        const bookRes = await fetch(`${BASE_URL}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${custToken}`
            },
            body: JSON.stringify({
                vehicleId: 1, // Rahul's Hyundai i20
                centerId: 1,  // Speedy Auto Care
                serviceType: 'Full Service',
                date: '2026-11-25',
                timeSlot: '09:00 AM - 11:00 AM'
            })
        });
        const bookData = await bookRes.json();
        assert(bookRes.status === 201 && bookData.success, 'Customer creates new service booking');
        assert(bookData.status === 'Pending', 'Initial status is correctly set to "Pending"');
        const bookingId = bookData.bookingId;

        // 3. Customer checks their bookings list
        console.log('\n--- 2. Testing Customer Booking Tracking ---');
        const myBookRes = await fetch(`${BASE_URL}/api/bookings/my`, {
            headers: { 'Authorization': `Bearer ${custToken}` }
        });
        const myBookData = await myBookRes.json();
        const foundBooking = myBookData.bookings.find(b => b.bookingId === bookingId);
        assert(foundBooking !== undefined, 'Booking appears in customer booking history');
        assert(foundBooking.centerName === 'Speedy Auto Care', 'Joined service center name is accurate');
        assert(foundBooking.registrationNumber === 'TS 03 EA 4521', 'Joined vehicle registration is accurate');

        // 4. Garage owner views incoming bookings for Center 1
        console.log('\n--- 3. Testing Garage Management & Approval ---');
        const garageBookRes = await fetch(`${BASE_URL}/api/bookings/center/1`, {
            headers: { 'Authorization': `Bearer ${garageToken}` }
        });
        const garageBookData = await garageBookRes.json();
        const garageFound = garageBookData.bookings.find(b => b.bookingId === bookingId);
        assert(garageFound !== undefined, 'Garage sees the new booking in their dashboard list');
        assert(garageFound.customerName === 'Rahul Sharma', 'Customer name is visible to garage');

        // 5. Garage confirms booking
        const confirmRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${garageToken}`
            },
            body: JSON.stringify({
                status: 'Confirmed',
                remarks: 'Slot approved. Please arrive 10 minutes early.'
            })
        });
        const confirmData = await confirmRes.json();
        assert(confirmRes.status === 200 && confirmData.status === 'Confirmed', 'Garage confirms appointment');

        // 6. Garage marks service as Completed
        console.log('\n--- 4. Testing Service Completion ---');
        const completeRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${garageToken}`
            },
            body: JSON.stringify({
                status: 'Completed',
                remarks: 'Full service completed. Engine oil changed and brakes inspected.'
            })
        });
        const completeData = await completeRes.json();
        assert(completeRes.status === 200 && completeData.status === 'Completed', 'Garage marks appointment as Completed');

        // 7. Customer submits review/feedback
        console.log('\n--- 5. Testing Customer Feedback & Rating ---');
        const feedbackRes = await fetch(`${BASE_URL}/api/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${custToken}`
            },
            body: JSON.stringify({
                bookingId: bookingId,
                rating: 5,
                comment: 'Excellent service by Speedy Auto Care! The vehicle runs very smoothly now.'
            })
        });
        const feedbackData = await feedbackRes.json();
        assert(feedbackRes.status === 201 && feedbackData.success, 'Customer submits 5-star feedback');

        // 8. Public center reviews check
        const centerFeedbackRes = await fetch(`${BASE_URL}/api/feedback/center/1`);
        const centerFeedbackData = await centerFeedbackRes.json();
        assert(centerFeedbackRes.status === 200 && centerFeedbackData.count >= 1, 'Feedback is publicly visible on service center profile');

        // 9. Admin metrics test
        console.log('\n--- 6. Testing Admin Metrics ---');
        const adminLogin = await (await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@vehicleservice.com', password: 'admin123' })
        })).json();
        const adminRes = await fetch(`${BASE_URL}/api/bookings/admin/metrics`, {
            headers: { 'Authorization': `Bearer ${adminLogin.token}` }
        });
        const adminData = await adminRes.json();
        assert(adminRes.status === 200 && adminData.metrics.totalBookings >= 1, 'Admin monitors total bookings and metrics');

        console.log(`\n========================================`);
        console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
        console.log(`========================================\n`);

    } catch (err) {
        console.error('Fatal test error:', err);
        failed++;
    } finally {
        if (server) server.close();
        process.exit(failed > 0 ? 1 : 0);
    }
}

runTests();
