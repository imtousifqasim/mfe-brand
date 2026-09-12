@echo off
setlocal enabledelayedexpansion
title MFE BRAND - Atelier Dev Server (Local + Mobile IP)
cls

echo ====================================================================
echo                   MFE BRAND - HAUTE COUTURE
echo                Development Server (Local + Mobile)
echo ====================================================================
echo.

:: Detect local IPv4 address
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1).IPAddress"') do (
    set LOCAL_IP=%%i
)

if "%LOCAL_IP%"=="" (
    set LOCAL_IP=YOUR_IP_ADDRESS
)

echo [✓] Ready to connect:
echo.
echo     💻 Computer Browser:  http://localhost:3000
echo     📱 Mobile Phone:      http://%LOCAL_IP%:3000
echo.
echo     [!] Note: Ensure your mobile phone is connected to the
echo         same Wi-Fi network as this PC.
echo.
echo ====================================================================
echo Starting Next.js development server on 0.0.0.0:3000 ...
echo ====================================================================
echo.

npm run dev:network

pause
