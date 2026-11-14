/**
 * Vehicle Service Booking System - Frontend Application Logic
 * SR University Web Technologies & Mobile Programming Hackathon 2026
 * Pure Vanilla JavaScript (Beginner-Friendly & Easy to Explain)
 */

// 1. DYNAMIC API BASE URL
// Detects if running under VS Code Live Server (port 5500) or Express (port 5000)
const API_BASE = (window.location.port === '5500' || window.location.protocol === 'file:')
    ? 'http://localhost:5000/api'
    : '/api';

console.log('🔗 API Base URL configured to:', API_BASE);

// Application State
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let authToken = localStorage.getItem('authToken') || null;
let allCenters = [];
let userVehicles = [];

// Helper: Make API Calls with fetch
async function apiCall(endpoint, method = 'GET', data = null, needsAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (needsAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config = { method, headers };
    if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'API request failed.');
        }
        return result;
    } catch (err) {
        showToast(err.message, 'error');
        throw err;
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.className = '';
    toast.classList.add(type);
    toast.textContent = message;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3500);
}

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));

    const targetPane = document.getElementById(tabId);
    if (targetPane) targetPane.classList.add('active');

    const activeLink = document.querySelector(`.nav-links a[data-tab="${tabId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Load tab-specific data
    if (tabId === 'centers-tab') loadCenters();
    if (tabId === 'customer-tab') loadCustomerDashboard();
    if (tabId === 'garage-tab') loadGarageDashboard();
    if (tabId === 'admin-tab') loadAdminDashboard();
    if (tabId === 'book-tab') initBookingForm();
}

// Update UI based on authentication state
function updateAuthUI() {
    const authStatus = document.getElementById('auth-status');
    const customerNav = document.getElementById('nav-customer');
    const garageNav = document.getElementById('nav-garage');
    const adminNav = document.getElementById('nav-admin');

    if (currentUser && authToken) {
        authStatus.innerHTML = `
            <span class="role-pill ${currentUser.role}">${currentUser.role}</span>
            <span><strong>${currentUser.name}</strong></span>
            <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
        `;

        if (customerNav) customerNav.style.display = (currentUser.role === 'customer' || currentUser.role === 'admin') ? 'inline-block' : 'none';
        if (garageNav) garageNav.style.display = (currentUser.role === 'garage' || currentUser.role === 'admin') ? 'inline-block' : 'none';
        if (adminNav) adminNav.style.display = (currentUser.role === 'admin') ? 'inline-block' : 'none';
    } else {
        authStatus.innerHTML = `
            <button class="btn btn-outline btn-sm" onclick="openLoginModal()">Login</button>
            <button class="btn btn-primary btn-sm" onclick="openRegisterModal()">Register</button>
        `;
        if (customerNav) customerNav.style.display = 'none';
        if (garageNav) garageNav.style.display = 'none';
        if (adminNav) adminNav.style.display = 'none';
    }
}

// Quick Switcher for Demo
async function quickLogin(email, password) {
    try {
        const result = await apiCall('/auth/login', 'POST', { email, password }, false);
        authToken = result.token;
        currentUser = result.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        showToast(`Logged in as ${currentUser.name} (${currentUser.role})`, 'success');

        // Route to their primary view
        if (currentUser.role === 'customer') switchTab('customer-tab');
        else if (currentUser.role === 'garage') switchTab('garage-tab');
        else if (currentUser.role === 'admin') switchTab('admin-tab');
    } catch (err) {
        console.error('Quick login failed', err);
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showToast('Logged out successfully.', 'info');
    switchTab('home-tab');
}

// --- MODULE 1: Service Centers ---
async function loadCenters() {
    const container = document.getElementById('centers-grid');
    if (!container) return;
    container.innerHTML = '<p>Loading service centers from MySQL...</p>';

    try {
        const data = await apiCall('/centers', 'GET', null, false);
        allCenters = data.centers || [];

        if (allCenters.length === 0) {
            container.innerHTML = '<p>No service centers available at the moment.</p>';
            return;
        }

        container.innerHTML = allCenters.map(center => {
            const priceEntries = Object.entries(center.priceList || {});
            const pricesHtml = priceEntries.slice(0, 3).map(([s, p]) => `
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.2rem;">
                    <span>${s}:</span> <strong>₹${p}</strong>
                </div>
            `).join('');

            return `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${center.name}</div>
                            <div style="font-size: 0.85rem; color: #64748b;">📍 ${center.address}</div>
                        </div>
                        <span class="price-tag">📞 ${center.contact}</span>
                    </div>
                    <div style="margin: 0.5rem 0;">
                        <strong style="font-size: 0.85rem;">Popular Services:</strong>
                        <div class="service-chip-list">
                            ${(center.serviceTypes || []).map(s => `<span class="service-chip">${s}</span>`).join('')}
                        </div>
                    </div>
                    <div style="background: #f8fafc; padding: 0.6rem; border-radius: 6px; margin-bottom: 1rem;">
                        ${pricesHtml}
                    </div>
                    <button class="btn btn-primary" onclick="startBookingForCenter(${center.centerId})">
                        Book Appointment
                    </button>
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = `<p style="color: red;">Error loading centers: ${err.message}</p>`;
    }
}

// --- MODULE 2: Step-wise Booking Flow ---
function startBookingForCenter(centerId) {
    if (!currentUser) {
        showToast('Please login to book an appointment.', 'info');
        openLoginModal();
        return;
    }
    switchTab('book-tab');
    setTimeout(() => {
        const select = document.getElementById('book-center');
        if (select) {
            select.value = centerId;
            onCenterSelected();
        }
    }, 200);
}

async function initBookingForm() {
    if (!currentUser) {
        document.getElementById('booking-step-content').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3>Please log in to book a vehicle service appointment</h3>
                <p style="color: #64748b; margin: 1rem 0;">You can register a customer account or use the quick demo login.</p>
                <button class="btn btn-primary" onclick="quickLogin('rahul@gmail.com', 'customer123')">Login as Demo Customer (Rahul)</button>
            </div>
        `;
        return;
    }

    // Populate user vehicles & centers
    try {
        const [vehData, centData] = await Promise.all([
            apiCall('/vehicles', 'GET'),
            apiCall('/centers', 'GET', null, false)
        ]);
        userVehicles = vehData.vehicles || [];
        allCenters = centData.centers || [];

        const vehSelect = document.getElementById('book-vehicle');
        if (userVehicles.length === 0) {
            vehSelect.innerHTML = `<option value="">-- No vehicles registered. Add one below! --</option>`;
        } else {
            vehSelect.innerHTML = `<option value="">-- Select Your Vehicle --</option>` +
                userVehicles.map(v => `<option value="${v.vehicleId}">${v.model} (${v.registrationNumber}) - ${v.type.toUpperCase()}</option>`).join('');
        }

        const centSelect = document.getElementById('book-center');
        centSelect.innerHTML = `<option value="">-- Select Service Center --</option>` +
            allCenters.map(c => `<option value="${c.centerId}">${c.name} (${c.address})</option>`).join('');

        // Set min date to today
        const dateInput = document.getElementById('book-date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;

        onCenterSelected();
    } catch (err) {
        console.error('Failed to init booking form', err);
    }
}

function onCenterSelected() {
    const centerId = parseInt(document.getElementById('book-center').value, 10);
    const serviceSelect = document.getElementById('book-service');
    const slotSelect = document.getElementById('book-slot');
    const priceDisplay = document.getElementById('service-price-val');

    if (!centerId) {
        serviceSelect.innerHTML = '<option value="">-- Choose Center First --</option>';
        slotSelect.innerHTML = '<option value="">-- Choose Center First --</option>';
        priceDisplay.textContent = '₹0';
        return;
    }

    const center = allCenters.find(c => c.centerId === centerId);
    if (!center) return;

    // Populate services
    serviceSelect.innerHTML = '<option value="">-- Select Service --</option>' +
        (center.serviceTypes || []).map(s => {
            const price = center.priceList ? center.priceList[s] : '';
            return `<option value="${s}" data-price="${price}">${s} ${price ? `(₹${price})` : ''}</option>`;
        }).join('');

    // Populate slots
    slotSelect.innerHTML = '<option value="">-- Select Slot --</option>' +
        (center.availableSlots || []).map(slot => `<option value="${slot}">${slot}</option>`).join('');

    onServiceSelected();
}

function onServiceSelected() {
    const serviceSelect = document.getElementById('book-service');
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    const price = selectedOption ? selectedOption.getAttribute('data-price') : null;
    const priceDisplay = document.getElementById('service-price-val');
    priceDisplay.textContent = price ? `₹${price}` : '₹0';
}

async function submitBookingForm(event) {
    event.preventDefault();
    const vehicleId = document.getElementById('book-vehicle').value;
    const centerId = document.getElementById('book-center').value;
    const serviceType = document.getElementById('book-service').value;
    const date = document.getElementById('book-date').value;
    const timeSlot = document.getElementById('book-slot').value;

    if (!vehicleId) return showToast('Please select your vehicle or register one.', 'error');
    if (!centerId) return showToast('Please select a service center.', 'error');
    if (!serviceType) return showToast('Please select a service type.', 'error');
    if (!date) return showToast('Please select an appointment date.', 'error');
    if (!timeSlot) return showToast('Please select a time slot.', 'error');

    try {
        const result = await apiCall('/bookings', 'POST', {
            vehicleId: parseInt(vehicleId, 10),
            centerId: parseInt(centerId, 10),
            serviceType,
            date,
            timeSlot
        });

        showToast(result.message || 'Appointment booked successfully!', 'success');
        switchTab('customer-tab');
    } catch (err) {
        console.error('Booking submission failed', err);
    }
}

// --- MODULE 3: Customer Dashboard ---
async function loadCustomerDashboard() {
    if (!currentUser) return;
    document.getElementById('cust-welcome-name').textContent = currentUser.name;

    // Load Vehicles
    try {
        const vData = await apiCall('/vehicles', 'GET');
        const vehContainer = document.getElementById('cust-vehicles-list');
        if (vData.vehicles.length === 0) {
            vehContainer.innerHTML = '<p style="color: #64748b;">No vehicles registered yet. Click "+ Add Vehicle" to register one.</p>';
        } else {
            vehContainer.innerHTML = vData.vehicles.map(v => `
                <div class="card" style="padding: 1rem; border-left: 4px solid var(--primary-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong>${v.model}</strong>
                        <span class="role-pill customer">${v.type.toUpperCase()}</span>
                    </div>
                    <div style="font-size: 0.85rem; color: #475569; margin: 0.3rem 0;">Reg: <strong>${v.registrationNumber}</strong></div>
                    <div style="font-size: 0.8rem; color: #64748b;">Last Service: ${v.lastServiceDate ? v.lastServiceDate.split('T')[0] : 'None recorded'}</div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load vehicles', err);
    }

    // Load Bookings
    try {
        const bData = await apiCall('/bookings/my', 'GET');
        const bookContainer = document.getElementById('cust-bookings-list');
        if (bData.bookings.length === 0) {
            bookContainer.innerHTML = '<p style="color: #64748b;">No bookings created yet. Go to "Book Service" to schedule your first appointment.</p>';
        } else {
            bookContainer.innerHTML = bData.bookings.map(b => {
                const statusClass = b.status.toLowerCase();
                const canFeedback = b.status === 'Completed' && !b.feedbackId;

                return `
                    <div class="card" style="margin-bottom: 1rem; border-left: 4px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">
                            <div>
                                <h4 style="color: var(--primary-color);">${b.serviceType}</h4>
                                <div style="font-size: 0.9rem; font-weight: 600;">🏬 ${b.centerName}</div>
                                <div style="font-size: 0.85rem; color: #64748b;">🚗 ${b.vehicleModel} (${b.registrationNumber})</div>
                            </div>
                            <span class="status-badge ${statusClass}">${b.status}</span>
                        </div>
                        <div style="display: flex; gap: 1.5rem; margin: 0.8rem 0; font-size: 0.85rem; background: #f8fafc; padding: 0.5rem; border-radius: 4px;">
                            <div>📅 <strong>Date:</strong> ${b.date}</div>
                            <div>⏰ <strong>Slot:</strong> ${b.timeSlot}</div>
                        </div>
                        <div style="font-size: 0.85rem; color: #334155;">
                            <strong>Remarks:</strong> ${b.remarks || 'No remarks provided yet.'}
                        </div>
                        ${b.rating ? `
                            <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #f59e0b;">
                                ⭐ Rated: <strong>${b.rating}/5</strong> - "${b.feedbackComment || ''}"
                            </div>
                        ` : ''}
                        ${canFeedback ? `
                            <div style="margin-top: 0.8rem;">
                                <button class="btn btn-secondary btn-sm" onclick="openFeedbackModal(${b.bookingId}, '${b.serviceType}', '${b.centerName}')">
                                    ⭐ Leave Feedback
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('Failed to load customer bookings', err);
    }
}

// Add Vehicle Handler
async function handleAddVehicle(event) {
    event.preventDefault();
    const registrationNumber = document.getElementById('veh-reg').value;
    const model = document.getElementById('veh-model').value;
    const type = document.getElementById('veh-type').value;
    const lastServiceDate = document.getElementById('veh-last-date').value;

    try {
        await apiCall('/vehicles', 'POST', {
            registrationNumber,
            model,
            type,
            lastServiceDate: lastServiceDate || null
        });
        showToast('Vehicle added successfully!', 'success');
        closeModal('add-vehicle-modal');
        loadCustomerDashboard();
    } catch (err) {
        console.error('Add vehicle failed', err);
    }
}

// --- MODULE 4: Garage Owner Dashboard ---
async function loadGarageDashboard() {
    if (!currentUser) return;
    try {
        const centerData = await apiCall('/centers/owner/me', 'GET');
        const center = centerData.center;
        const infoBox = document.getElementById('garage-center-info');

        if (!center) {
            infoBox.innerHTML = '<p>No service center registered under your account.</p>';
            return;
        }

        infoBox.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                    <h3 style="color: var(--primary-color);">${center.name}</h3>
                    <p style="font-size: 0.9rem; color: #64748b;">📍 ${center.address} | 📞 ${center.contact}</p>
                </div>
                <span class="role-pill garage">Official Partner Garage</span>
            </div>
        `;

        // Fetch bookings for this center
        const bookData = await apiCall(`/bookings/center/${center.centerId}`, 'GET');
        const tableBody = document.getElementById('garage-bookings-body');
        const countSpan = document.getElementById('garage-booking-count');
        countSpan.textContent = `(${bookData.bookings.length} Total)`;

        if (bookData.bookings.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #64748b;">No bookings received yet.</td></tr>`;
            return;
        }

        tableBody.innerHTML = bookData.bookings.map(b => {
            const statusClass = b.status.toLowerCase();
            return `
                <tr>
                    <td>#${b.bookingId}</td>
                    <td>
                        <strong>${b.customerName}</strong><br>
                        <small style="color: #64748b;">📞 ${b.customerContact}</small>
                    </td>
                    <td>${b.vehicleModel} (${b.registrationNumber})</td>
                    <td><strong>${b.serviceType}</strong></td>
                    <td>${b.date}<br><small>${b.timeSlot}</small></td>
                    <td><span class="status-badge ${statusClass}">${b.status}</span></td>
                    <td>
                        <div style="display: flex; gap: 0.3rem; flex-wrap: wrap;">
                            ${b.status === 'Pending' ? `
                                <button class="btn btn-success btn-sm" onclick="changeStatus(${b.bookingId}, 'Confirmed')">Confirm</button>
                                <button class="btn btn-danger btn-sm" onclick="changeStatus(${b.bookingId}, 'Rejected')">Reject</button>
                            ` : ''}
                            ${b.status === 'Confirmed' ? `
                                <button class="btn btn-secondary btn-sm" onclick="changeStatus(${b.bookingId}, 'Completed')">Mark Completed</button>
                            ` : ''}
                            ${b.status === 'Completed' || b.status === 'Rejected' ? `
                                <small style="color: #64748b;">${b.remarks || 'Done'}</small>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Failed to load garage dashboard', err);
    }
}

async function changeStatus(bookingId, status) {
    let remarks = '';
    if (status === 'Confirmed') {
        remarks = prompt('Enter confirmation note for customer:', 'Slot confirmed. Please arrive on time.') || 'Slot confirmed.';
    } else if (status === 'Rejected') {
        remarks = prompt('Enter rejection reason for customer:', 'Slot unavailable. Please choose another time slot.') || 'Slot unavailable.';
    } else if (status === 'Completed') {
        remarks = prompt('Enter completion remarks / summary:', 'Servicing finished. Vehicle tested and ready for pickup.') || 'Service completed.';
    }

    try {
        await apiCall(`/bookings/${bookingId}/status`, 'PUT', { status, remarks });
        showToast(`Booking #${bookingId} updated to ${status}!`, 'success');
        loadGarageDashboard();
    } catch (err) {
        console.error('Status update failed', err);
    }
}

// --- MODULE 5: Admin Dashboard ---
async function loadAdminDashboard() {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
        const data = await apiCall('/bookings/admin/metrics', 'GET');
        const m = data.metrics;

        document.getElementById('metric-users').textContent = m.totalUsers;
        document.getElementById('metric-bookings').textContent = m.totalBookings;
        document.getElementById('metric-centers').textContent = m.totalCenters;
        document.getElementById('metric-vehicles').textContent = m.totalVehicles;

        const recentTbody = document.getElementById('admin-recent-body');
        recentTbody.innerHTML = data.recentBookings.map(b => `
            <tr>
                <td>#${b.bookingId}</td>
                <td>${b.customerName}</td>
                <td>${b.centerName}</td>
                <td>${b.serviceType}</td>
                <td>${b.date}</td>
                <td><span class="status-badge ${b.status.toLowerCase()}">${b.status}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Admin metrics failed', err);
    }
}

// --- MODULE 6: Feedback Modal ---
function openFeedbackModal(bookingId, serviceType, centerName) {
    document.getElementById('feedback-booking-id').value = bookingId;
    document.getElementById('feedback-info').textContent = `Reviewing "${serviceType}" at ${centerName}`;
    openModal('feedback-modal');
}

async function submitFeedback(event) {
    event.preventDefault();
    const bookingId = document.getElementById('feedback-booking-id').value;
    const rating = document.getElementById('feedback-rating').value;
    const comment = document.getElementById('feedback-comment').value;

    try {
        await apiCall('/feedback', 'POST', {
            bookingId: parseInt(bookingId, 10),
            rating: parseInt(rating, 10),
            comment
        });
        showToast('Feedback submitted successfully! Thank you.', 'success');
        closeModal('feedback-modal');
        loadCustomerDashboard();
    } catch (err) {
        console.error('Feedback submission failed', err);
    }
}

// --- Modal Utilities ---
function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
}

function openLoginModal() { openModal('login-modal'); }
function openRegisterModal() { openModal('register-modal'); }

async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const res = await apiCall('/auth/login', 'POST', { email, password }, false);
        authToken = res.token;
        currentUser = res.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        closeModal('login-modal');
        showToast(`Welcome back, ${currentUser.name}!`, 'success');
        if (currentUser.role === 'customer') switchTab('customer-tab');
        else if (currentUser.role === 'garage') switchTab('garage-tab');
        else if (currentUser.role === 'admin') switchTab('admin-tab');
    } catch (err) {
        console.error('Login error', err);
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    const contact = document.getElementById('reg-contact').value;
    const location = document.getElementById('reg-location').value;

    try {
        const res = await apiCall('/auth/register', 'POST', { name, email, password, role, contact, location }, false);
        authToken = res.token;
        currentUser = res.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        closeModal('register-modal');
        showToast(`Account created successfully as ${role}!`, 'success');
        if (role === 'customer') switchTab('customer-tab');
        else if (role === 'garage') switchTab('garage-tab');
    } catch (err) {
        console.error('Registration error', err);
    }
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    loadCenters();

    // Default demo login on initial visit if none logged in
    if (!currentUser) {
        quickLogin('rahul@gmail.com', 'customer123');
    }
});
