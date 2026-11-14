@echo off
title Initialize Database - Vehicle Service Booking System
echo ========================================================
echo  Initializing MySQL Database: vehicle_service_db
echo ========================================================
echo.
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p7893730591@V < backend\config\schema.sql
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p7893730591@V < backend\config\seed.sql
echo.
echo Database schema and seed data loaded successfully!
pause
