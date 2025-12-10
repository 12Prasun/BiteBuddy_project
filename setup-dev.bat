@echo off
REM BiteBuddy Development Setup Script for Windows

echo.
echo ========================================
echo   BiteBuddy Development Setup
echo ========================================
echo.

REM Check if MongoDB is installed
echo Checking for MongoDB...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] MongoDB is not installed!
    echo.
    echo Please install MongoDB Community Edition:
    echo 1. Visit: https://www.mongodb.com/try/download/community
    echo 2. Download and run the Windows installer
    echo 3. Select "Install MongoDB as a Service"
    echo.
    echo Or use: winget install MongoDB.Server
    echo.
    pause
    exit /b 1
)

echo [OK] MongoDB found

REM Check if MongoDB service is running
echo.
echo Checking if MongoDB service is running...
tasklist | findstr /i mongod >nul 2>&1
if errorlevel 1 (
    echo [WARNING] MongoDB service not running
    echo Attempting to start MongoDB service...
    net start MongoDB >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] Could not auto-start MongoDB service
        echo Try running as Administrator or:
        echo   net start MongoDB
    ) else (
        echo [OK] MongoDB service started
    )
) else (
    echo [OK] MongoDB is running
)

REM Check if .env file exists
echo.
echo Checking environment configuration...
if not exist .env (
    echo [WARNING] .env file not found
    echo Creating .env with local MongoDB settings...
    (
        echo # MongoDB Configuration - Using local MongoDB for development
        echo MONGO_URI=mongodb://localhost:27017/bitebuddy
        echo.
        echo # Server Configuration
        echo PORT=5000
        echo NODE_ENV=development
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=dev_secret_key_change_in_production
        echo.
        echo # CORS Configuration
        echo CORS_ORIGIN=http://localhost:3000
        echo.
        echo # Email Configuration (optional
        echo EMAIL_SERVICE=gmail
        echo EMAIL_USER=
        echo EMAIL_PASSWORD=
        echo EMAIL_FROM=BiteBuddy ^<noreply@bitebuddy.com^>
        echo.
        echo # Stripe Configuration
        echo STRIPE_PUBLIC_KEY=pk_test_xxx
        echo STRIPE_SECRET_KEY=sk_test_xxx
    ) > .env
    echo [OK] .env created
) else (
    echo [OK] .env file exists
)

REM Check Node.js
echo.
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found: 
node --version

REM Install dependencies if needed
echo.
echo Checking dependencies...
if not exist node_modules (
    echo Installing Node dependencies...
    call npm install
) else (
    echo [OK] Dependencies already installed
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start BiteBuddy:
echo.
echo 1. Terminal 1 (Backend):
echo    npm start
echo.
echo 2. Terminal 2 (Frontend):
echo    cd frontend
echo    npm start
echo.
echo Then open: http://localhost:3000
echo.
echo Backend API: http://localhost:5000
echo.
pause
