@echo off
cd /d "%~dp0"
title Vehicle Service Booking System - Backend Server
echo ========================================================
echo  Vehicle Service Booking System
echo  SR University Hackathon 2026 - Problem Statement 20
echo ========================================================
echo.
echo Starting Backend Server on http://localhost:5000...
echo.
node backend/server.js
pause
