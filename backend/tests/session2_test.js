/**
 * Session 2 Test Suite: Auth, Vehicles & Service Centers
 * Tests all endpoints against the live MySQL database.
 */

const { app, startServer } = require('../server');

async function runTests() {
    console.log('🧪 Starting Session 2 Automated Test Suite...\n');
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

        // 1. Test Customer Login
        console.log('--- 1. Testing Auth: Login ---');
        const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'rahul@gmail.com',
                password: 'customer123'
            })
        });
        const loginData = await loginRes.json();
        assert(loginRes.status === 200 && loginData.success, 'Login demo customer (rahul@gmail.com)');
        assert(loginData.token && loginData.user.role === 'customer', 'Received valid JWT token with customer role');
        const customerToken = loginData.token;

        // 2. Test Get Profile (Protected)
        console.log('\n--- 2. Testing Auth: Protected Profile ---');
        const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        const meData = await meRes.json();
        assert(meRes.status === 200 && meData.user.email === 'rahul@gmail.com', 'Get current logged-in user profile');

        // 3. Test Register New User
        console.log('\n--- 3. Testing Auth: Registration ---');
        const testEmail = `testuser_${Date.now()}@gmail.com`;
        const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Ananya Verma',
                email: testEmail,
                password: 'password123',
                role: 'customer',
                contact: '9876543211',
                location: 'Warangal'
            })
        });
        const regData = await regRes.json();
        assert(regRes.status === 201 && regData.success, `Register new customer (${testEmail})`);

        // 4. Test Get Customer Vehicles
        console.log('\n--- 4. Testing Vehicle Management ---');
        const vehRes = await fetch(`${BASE_URL}/api/vehicles`, {
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        const vehData = await vehRes.json();
        assert(vehRes.status === 200 && vehData.vehicles.length >= 2, `Fetch customer vehicles (found: ${vehData.vehicles.length})`);

        // 5. Test Add New Vehicle
        const addVehRes = await fetch(`${BASE_URL}/api/vehicles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customerToken}`
            },
            body: JSON.stringify({
                registrationNumber: 'TS 03 ZZ 9999',
                model: 'Honda City ZX',
                type: 'car',
                lastServiceDate: '2026-10-01'
            })
        });
        const addVehData = await addVehRes.json();
        assert(addVehRes.status === 201 && addVehData.vehicle.registrationNumber === 'TS 03 ZZ 9999', 'Add new vehicle for customer');

        // 6. Test Service Centers API (Public)
        console.log('\n--- 5. Testing Service Centers ---');
        const centersRes = await fetch(`${BASE_URL}/api/centers`);
        const centersData = await centersRes.json();
        assert(centersRes.status === 200 && centersData.centers.length >= 3, `Fetch all service centers (count: ${centersData.centers.length})`);

        const speedy = centersData.centers.find(c => c.name.includes('Speedy Auto Care'));
        assert(speedy && speedy.priceList['Oil Change'] === 600, 'Verify Speedy Auto Care has Oil Change at ₹600');
        assert(speedy && speedy.priceList['Full Service'] === 1500, 'Verify Speedy Auto Care has Full Service at ₹1500');
        assert(speedy && speedy.priceList['Washing'] === 300, 'Verify Speedy Auto Care has Washing at ₹300');

        // 7. Test Garage Owner Profile & Center
        console.log('\n--- 6. Testing Garage Owner Authentication & Center ---');
        const garageLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'speedy@garage.com',
                password: 'garage123'
            })
        });
        const garageLoginData = await garageLoginRes.json();
        assert(garageLoginRes.status === 200 && garageLoginData.user.role === 'garage', 'Garage owner login');

        const garageCenterRes = await fetch(`${BASE_URL}/api/centers/owner/me`, {
            headers: { 'Authorization': `Bearer ${garageLoginData.token}` }
        });
        const garageCenterData = await garageCenterRes.json();
        assert(garageCenterRes.status === 200 && garageCenterData.center.name.includes('Speedy Auto Care'), 'Garage owner fetches owned center');

        console.log(`\n========================================`);
        console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
        console.log(`========================================\n`);

    } catch (err) {
        console.error('Fatal error in tests:', err);
        failed++;
    } finally {
        if (server) {
            server.close();
        }
        process.exit(failed > 0 ? 1 : 0);
    }
}

runTests();
