# BiteBuddy Development Setup Script for PowerShell
# Run: .\setup-dev.ps1

Write-Host ""
Write-Host "========================================"
Write-Host "  BiteBuddy Development Setup" -ForegroundColor Cyan
Write-Host "========================================"
Write-Host ""

# Check MongoDB
Write-Host "Checking for MongoDB..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version 2>&1
    Write-Host "[OK] MongoDB found" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] MongoDB is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install MongoDB Community Edition:"
    Write-Host "1. Visit: https://www.mongodb.com/try/download/community"
    Write-Host "2. Download and run the Windows installer"
    Write-Host "3. Select 'Install MongoDB as a Service'"
    Write-Host ""
    Write-Host "Or use: winget install MongoDB.Server"
    Write-Host ""
    exit 1
}

# Check if MongoDB service is running
Write-Host ""
Write-Host "Checking if MongoDB service is running..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($null -eq $mongoProcess) {
    Write-Host "[WARNING] MongoDB service not running" -ForegroundColor Yellow
    Write-Host "Attempting to start MongoDB service..." -ForegroundColor Yellow
    try {
        Start-Service MongoDB -ErrorAction Stop
        Write-Host "[OK] MongoDB service started" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "[WARNING] Could not auto-start MongoDB service" -ForegroundColor Yellow
        Write-Host "Try running as Administrator or: net start MongoDB"
    }
} else {
    Write-Host "[OK] MongoDB is running" -ForegroundColor Green
}

# Check .env file
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path .env)) {
    Write-Host "[WARNING] .env file not found" -ForegroundColor Yellow
    Write-Host "Creating .env with local MongoDB settings..." -ForegroundColor Yellow
    
    @"
# MongoDB Configuration - Using local MongoDB for development
MONGO_URI=mongodb://localhost:27017/bitebuddy

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=dev_secret_key_change_in_production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Email Configuration (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=BiteBuddy <noreply@bitebuddy.com>

# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
"@ | Out-File -FilePath .env -Encoding UTF8
    
    Write-Host "[OK] .env created" -ForegroundColor Green
} else {
    Write-Host "[OK] .env file exists" -ForegroundColor Green
}

# Check Node.js
Write-Host ""
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/"
    exit 1
}

# Check dependencies
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (!(Test-Path node_modules)) {
    Write-Host "Installing Node dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "[OK] Dependencies already installed" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "========================================"
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "To start BiteBuddy:"
Write-Host ""
Write-Host "1. Terminal 1 (Backend):"
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Terminal 2 (Frontend):"
Write-Host "   cd frontend" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then open: http://localhost:3000"
Write-Host ""
Write-Host "Backend API: http://localhost:5000"
Write-Host ""
