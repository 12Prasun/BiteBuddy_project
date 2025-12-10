# BiteBuddy Development Environment Setup Guide

## Quick Start (3 Steps)

### Step 1: Install MongoDB Locally

**Option A: Windows Package Manager (Easiest)**
```powershell
winget install MongoDB.Server
```

**Option B: Download Installer**
1. Visit: https://www.mongodb.com/try/download/community
2. Download Windows installer
3. Run installer and select "Install MongoDB as a Service"

**Option C: Chocolatey**
```powershell
choco install mongodb-community
```

### Step 2: Verify MongoDB is Running
```powershell
tasklist | findstr mongod
# Should show mongod.exe

# Or check service:
Get-Service MongoDB
```

### Step 3: Start BiteBuddy

**Terminal 1 - Backend:**
```powershell
cd c:\Users\hp\OneDrive\Desktop\bitebuddy
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\hp\OneDrive\Desktop\bitebuddy\frontend
npm start
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Detailed Setup Instructions

### MongoDB Installation Details

#### What is MongoDB?
MongoDB is a NoSQL database that stores data in JSON-like documents. BiteBuddy uses it to store:
- User accounts
- Food items and categories
- Orders and order status
- Reviews and ratings

#### Windows Installation Steps

1. **Download**
   - Visit: https://www.mongodb.com/try/download/community
   - Select "Community Server"
   - Choose Windows platform
   - Download the `.msi` file

2. **Install**
   - Run the downloaded `.msi` file
   - Accept the license agreement
   - Keep default installation path: `C:\Program Files\MongoDB\Server\[version]`
   - **Important**: Check "Install MongoDB as a Service"
   - Complete the installation

3. **Verify Installation**
   ```powershell
   mongod --version
   # Output should show version like: db version v6.0.0
   ```

4. **Start the Service**
   ```powershell
   # MongoDB should start automatically
   # Verify it's running:
   tasklist | findstr mongod
   
   # If not running, start it:
   net start MongoDB
   ```

5. **Test Connection**
   ```powershell
   mongosh
   
   # You should see:
   # test>
   
   # Create the bitebuddy database:
   test> use bitebuddy
   switched to db bitebuddy
   
   # Exit:
   exit
   ```

### Environment Setup

A `.env` file has been created for you with these settings:
```
MONGO_URI=mongodb://localhost:27017/bitebuddy
PORT=5000
NODE_ENV=development
JWT_SECRET=dev_secret_key
CORS_ORIGIN=http://localhost:3000
```

This connects to your local MongoDB instance.

### Starting the Application

#### Method 1: Manual Start (Recommended for Development)

**Terminal 1 - Backend API:**
```powershell
cd c:\Users\hp\OneDrive\Desktop\bitebuddy
npm start
```

Expected output:
```
> backend@1.0.0 start
> node backend/index.js

BiteBuddy API listening on port 5000
Environment: development
connected
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\hp\OneDrive\Desktop\bitebuddy\frontend
npm start
```

Expected output:
```
On Your Network: http://192.168.x.x:3000
Compiled successfully!
```

#### Method 2: Automated Setup Script

**Option A: Batch Script (Command Prompt)**
```powershell
cd c:\Users\hp\OneDrive\Desktop\bitebuddy
setup-dev.bat
```

**Option B: PowerShell Script**
```powershell
cd c:\Users\hp\OneDrive\Desktop\bitebuddy
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup-dev.ps1
```

---

## Accessing the Application

Once both servers are running:

1. **Frontend**: http://localhost:3000
   - Browse food items
   - Add to cart
   - Place orders
   - Track orders

2. **Backend API**: http://localhost:5000
   - API endpoints for all features
   - Available at: http://localhost:5000/api/...

---

## Troubleshooting

### MongoDB Issues

**Problem**: "MongoDB service not running"
```powershell
# Solution: Start the service manually
net start MongoDB

# Or if that fails, restart the service:
net stop MongoDB
net start MongoDB
```

**Problem**: Port 27017 already in use
```powershell
# Find what's using it:
netstat -ano | findstr :27017

# Kill the process (replace XXXX with PID):
taskkill /PID XXXX /F

# Start MongoDB fresh:
net start MongoDB
```

**Problem**: "Connection refused" when starting backend
```
Error: Could not connect to any servers in your MongoDB cluster
```
**Solution**:
1. Verify MongoDB is running: `tasklist | findstr mongod`
2. Check port 27017: `netstat -ano | findstr :27017`
3. Restart MongoDB service: `net stop MongoDB; net start MongoDB`

### Node.js Issues

**Problem**: "npm: command not found"
```powershell
# Solution: Install Node.js from https://nodejs.org/
# Then restart PowerShell/Command Prompt
```

**Problem**: Port 5000 already in use
```powershell
# Find process:
netstat -ano | findstr :5000

# Kill it (replace XXXX with PID):
taskkill /PID XXXX /F
```

**Problem**: Port 3000 already in use
```powershell
# Find process:
netstat -ano | findstr :3000

# Kill it:
taskkill /PID XXXX /F
```

### Dependencies Issues

**Problem**: "Module not found" errors
```powershell
# Solution: Reinstall dependencies
cd c:\Users\hp\OneDrive\Desktop\bitebuddy
rm -r node_modules
npm install

# For frontend:
cd frontend
rm -r node_modules
npm install
```

---

## Development Features

### Live Code Reloading
- **Backend**: Automatically restarts when you save changes (with nodemon)
- **Frontend**: Automatically recompiles when you save changes

### Testing
```powershell
# Run all tests:
npm test

# Run with coverage:
npm test -- --coverage

# Run specific test file:
npm test -- validation.test.js
```

### Database

**View data using MongoDB Compass (GUI)**
1. Download: https://www.mongodb.com/products/compass
2. Install and open
3. Connect to: `mongodb://localhost:27017`
4. Browse collections in `bitebuddy` database

**Or use MongoDB Shell**
```powershell
mongosh

# Show all databases:
show dbs

# Use bitebuddy database:
use bitebuddy

# Show collections:
show collections

# View users:
db.users.find()

# View orders:
db.orders.find()

# Count documents:
db.users.countDocuments()
```

---

## Production Deployment

For deploying to production, use the guides:
- `DEPLOY_AWS.md` - Deploy to Amazon AWS
- `DEPLOY_AZURE.md` - Deploy to Microsoft Azure
- `DEPLOYMENT.md` - General deployment guide

For production, use:
- MongoDB Atlas (Cloud) instead of local MongoDB
- Environment variables from `config/env.production`
- Docker Compose for containerized deployment

---

## Common Commands

```powershell
# Start backend
npm start

# Start frontend
cd frontend && npm start

# Stop services
Ctrl + C (in each terminal)

# Check MongoDB status
tasklist | findstr mongod
Get-Service MongoDB

# View MongoDB shell
mongosh

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
npm install

# Run tests
npm test

# Build frontend for production
cd frontend && npm run build

# View logs
# Backend: Check terminal output
# Frontend: Check terminal output
```

---

## File Structure

```
bitebuddy/
├── backend/
│   ├── index.js           (Main server file)
│   ├── db.js              (Database connection)
│   ├── models/            (Data schemas)
│   ├── Routes/            (API endpoints)
│   └── utils/             (Utilities: logger, monitor, etc.)
│
├── frontend/
│   ├── public/            (Static files)
│   ├── src/               (React components)
│   │   ├── screens/       (Pages: Home, Cart, Login, etc.)
│   │   ├── components/    (Reusable components)
│   │   └── App.js         (Main app component)
│   └── package.json
│
├── config/                (Environment configs)
├── migrations/            (Database migrations)
├── tests/                 (Unit tests)
├── docker-compose.yml     (Docker orchestration)
├── .env                   (Environment variables)
└── package.json
```

---

## Next Steps

1. ✅ Install MongoDB
2. ✅ Verify `.env` file exists
3. ✅ Start backend: `npm start`
4. ✅ Start frontend: `cd frontend && npm start`
5. ✅ Open http://localhost:3000
6. Test the application features
7. Check backend console for logs
8. Review documentation as needed

---

## Getting Help

- Backend logs: Check the terminal where `npm start` is running
- Frontend errors: Check browser console (F12)
- MongoDB issues: Use `mongosh` to test connection
- API testing: Use Postman or curl

## Resources

- MongoDB Docs: https://docs.mongodb.com/
- Node.js Docs: https://nodejs.org/docs/
- React Docs: https://react.dev/
- Express Docs: https://expressjs.com/
