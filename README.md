# 🚗 Vehicle Service Booking System
**SR University Web Technologies and Mobile Programming Hackathon 2026**  
**Problem Statement 20**

---

## 📌 Project Overview
A full-stack, genuine student-developed web application that allows vehicle owners to book servicing appointments at nearby garages or service centers online. The system allows users to select service types (Oil Change, Full Service, Washing, etc.), choose preferred dates and time slots, and track real-time booking status, while garage owners manage slots, approvals, and service completion.

---

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (Zero heavy frameworks, clean & faculty-friendly)
- **Backend:** Node.js, Express.js
- **Database:** MySQL Server 8.0 (`vehicle_service_db`)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs password hashing

---

## 🚀 How to Run in VS Code

### Step 1: Open Project in VS Code
Open VS Code and choose **File > Open Folder...**, then select:
```
C:\Users\vishw\VehicleServiceBooking
```

### Step 2: Start the Backend Server
Open the integrated terminal (`Ctrl + \``) in VS Code and run:
```bash
npm start
```
*(Or double-click `start.bat` in the project root)*  
You will see:
```
✅ Connected to MySQL Database (vehicle_service_db) successfully.
🚀 Server running at http://localhost:5000
```

### Step 3: Run Frontend via "Go Live" (Live Server)
1. Right-click on `frontend/index.html` in VS Code and click **"Open with Live Server"** (or click **Go Live** at the bottom right corner of VS Code).
2. Your browser will automatically open:
   ```
   http://127.0.0.1:5500/frontend/index.html   (or http://127.0.0.1:5500)
   ```
3. The frontend is automatically configured to talk to your backend on `http://localhost:5000/api`!
4. *(Alternatively, you can also directly open `http://localhost:5000` in your browser)*

---

## 👥 Demo Accounts (Preloaded for Hackathon Presentation)

Use the top demo bar in the application to switch roles with a single click, or use these credentials:

| Role | Email | Password | Access / Features |
| :--- | :--- | :--- | :--- |
| **Customer** | `rahul@gmail.com` | `customer123` | View vehicles, step-by-step booking, track booking status, leave reviews |
| **Garage Owner** | `speedy@garage.com` | `garage123` | Speedy Auto Care dashboard, approve/reject bookings, mark completed |
| **Garage Owner 2** | `apex@garage.com` | `garage123` | Apex Motors Workshop dashboard |
| **System Admin** | `admin@vehicleservice.com` | `admin123` | System KPI metrics, total bookings monitor, recent activity |

---

## 📋 Database Tables (MySQL)
1. `users` – User accounts with roles (`customer`, `garage`, `admin`)
2. `vehicles` – Customer vehicles with registration number and type (`car`, `bike`)
3. `service_centers` – Partner garages with pricing, service list, and time slots
4. `bookings` – Real booking requests with live status (`Pending`, `Confirmed`, `Rejected`, `Completed`)
5. `feedback` – Customer ratings (1–5 stars) and review comments for completed jobs

---

## 🧪 Automated Testing
Run the complete automated test suites anytime:
```bash
node backend/tests/session2_test.js
node backend/tests/session3_test.js
```
