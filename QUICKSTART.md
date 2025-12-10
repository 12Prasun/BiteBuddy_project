# 🚀 BiteBuddy Development - Quick Help

## TL;DR - Get Running in 5 Minutes

### 1. Install MongoDB
```powershell
winget install MongoDB.Server
```

### 2. Create .env (Already done for you)
Check if `.env` exists in project root with:
```
MONGO_URI=mongodb://localhost:27017/bitebuddy
```

### 3. Start Backend
```powershell
cd c:\Users\hp\OneDrive\Desktop\bitebuddy
npm start
```
You should see: `BiteBuddy API listening on port 5000`

### 4. Start Frontend (New Terminal)
```powershell
cd c:\Users\hp\OneDrive\Desktop\bitebuddy\frontend
npm start
```

### 5. Open App
- Go to: http://localhost:3000
- Backend API: http://localhost:5000

---

## What's the Issue?

**Current Problem**: MongoDB Atlas connection is blocked (IP whitelist issue)

**Solution**: Use local MongoDB instead (already set up in `.env`)

---

## Files Created for You

1. **`.env`** - Environment configuration (already created with local MongoDB)
2. **`SETUP_GUIDE.md`** - Complete setup instructions
3. **`MONGODB_SETUP.md`** - MongoDB installation details
4. **`setup-dev.bat`** - Automated setup script (batch)
5. **`setup-dev.ps1`** - Automated setup script (PowerShell)

---

## Quick Fixes for Common Problems

### MongoDB Not Found
```powershell
# Install:
winget install MongoDB.Server

# Or download from:
https://www.mongodb.com/try/download/community
```

### MongoDB Not Running
```powershell
# Start service:
net start MongoDB

# Check if running:
tasklist | findstr mongod
```

### Port 5000 Already in Use
```powershell
# Kill process on port 5000:
netstat -ano | findstr :5000
taskkill /PID XXXX /F
```

### "Can't find module" Error
```powershell
# Reinstall dependencies:
npm install
cd frontend && npm install
```

---

## Testing Everything Works

### Test MongoDB Connection
```powershell
mongosh
> use bitebuddy
> db.version()
# Should show MongoDB version
> exit
```

### Test Backend API
```powershell
# In PowerShell:
Invoke-WebRequest http://localhost:5000/health

# Or use curl:
curl http://localhost:5000/health
```

### Test Frontend
Open browser: http://localhost:3000

---

## Helpful Commands

```powershell
# List all running processes:
tasklist | findstr node
tasklist | findstr mongod

# Check if MongoDB service is running:
Get-Service MongoDB

# Start MongoDB service:
net start MongoDB

# Stop MongoDB service:
net stop MongoDB

# View running port connections:
netstat -ano | findstr :5000
netstat -ano | findstr :3000
netstat -ano | findstr :27017

# Kill a process by PID:
taskkill /PID 1234 /F
```

---

## Folder Structure

```
bitebuddy/
├── backend/          ← Backend API (Node.js)
├── frontend/         ← Frontend (React)
├── config/           ← Environment configs
├── migrations/       ← Database migrations
├── tests/            ← Unit tests
├── .env              ← Your local configuration
├── package.json      ← Backend dependencies
└── docker-compose.yml ← Docker setup (optional)
```

---

## What You Have Now (Phase 5-6)

✅ **Complete Testing Framework**
- 46+ unit tests
- Jest configuration
- Test coverage reports

✅ **Docker Support**
- Containerized backend
- Containerized frontend
- Docker Compose for orchestration

✅ **CI/CD Pipeline**
- GitHub Actions workflow
- Automated testing on push
- Automated Docker builds

✅ **Multi-Cloud Deployment Guides**
- AWS deployment (630+ lines)
- Azure deployment (520+ lines)
- General deployment guide

✅ **Production-Ready Infrastructure**
- Database migrations system
- Logging system
- Performance monitoring
- Environment configurations

---

## Next Steps

1. **Install MongoDB** using `winget install MongoDB.Server`
2. **Start MongoDB service**: `net start MongoDB`
3. **Run backend**: `npm start` (should show "connected")
4. **Run frontend**: `cd frontend && npm start`
5. **Access app**: http://localhost:3000

---

## Documentation Files

- **SETUP_GUIDE.md** - Complete setup instructions
- **MONGODB_SETUP.md** - MongoDB installation details
- **DEPLOYMENT.md** - Deployment guide
- **DEPLOY_AWS.md** - AWS deployment
- **DEPLOY_AZURE.md** - Azure deployment
- **PHASE5.md** - Testing & DevOps documentation
- **PHASE6.md** - Deployment infrastructure documentation
- **PROJECT_SUMMARY.md** - Complete project overview

---

## Still Need Help?

Check these files in order:
1. `SETUP_GUIDE.md` - Complete walkthrough
2. `MONGODB_SETUP.md` - MongoDB-specific help
3. Check the "Troubleshooting" section in `SETUP_GUIDE.md`

---

**Status**: ✅ Development environment ready (once MongoDB is installed)
**Last Updated**: Phase 5-6 Complete (Commit: c781d2d)
**All Files**: Created and committed to GitHub
