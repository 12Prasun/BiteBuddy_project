# Setting Up Local MongoDB for BiteBuddy Development

## Quick Setup Guide for Windows

### Option 1: MongoDB Community Edition (Recommended)

#### Step 1: Download MongoDB
1. Visit: https://www.mongodb.com/try/download/community
2. Select Windows as your platform
3. Download the `.msi` installer (latest version)

#### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Click "Next" through the setup wizard
3. When prompted, check "Install MongoDB as a Service"
4. Keep the default installation path: `C:\Program Files\MongoDB\Server\[version]`
5. Complete the installation

#### Step 3: Verify Installation
```powershell
# Open PowerShell and run:
mongod --version
```

#### Step 4: Start MongoDB Service
```powershell
# MongoDB should start automatically as a Windows service
# To verify it's running:
Get-Service | grep -i mongodb

# Or check if process is running:
tasklist | findstr mongod
```

#### Step 5: Connect and Verify
```powershell
# Open a new PowerShell window and run:
mongosh

# You should see a MongoDB shell prompt:
# test> 

# Create the bitebuddy database:
test> use bitebuddy
switched to db bitebuddy

# Exit MongoDB shell:
exit
```

### Option 2: MongoDB via Chocolatey (If you have it installed)
```powershell
choco install mongodb-community
```

### Option 3: MongoDB via Windows Package Manager
```powershell
winget install MongoDB.Server
```

## Running BiteBuddy After MongoDB Setup

```powershell
cd c:\Users\hp\OneDrive\Desktop\bitebuddy

# Start the backend
npm start
```

You should see:
```
BiteBuddy API listening on port 5000
connected
```

The "connected" message confirms MongoDB is working!

## Troubleshooting

### MongoDB Service Won't Start
```powershell
# Try starting it manually:
net start MongoDB
```

### Port 27017 Already in Use
```powershell
# Find process using port 27017:
netstat -ano | findstr :27017

# Kill the process (replace XXXX with PID):
taskkill /PID XXXX /F
```

### Can't find mongod command
```powershell
# Add MongoDB to PATH:
$env:Path += ";C:\Program Files\MongoDB\Server\[version]\bin"

# Or set permanently in System Variables:
# Control Panel > System > Environment Variables > Add: C:\Program Files\MongoDB\Server\[version]\bin
```

## Default MongoDB Connection
- **Host**: localhost
- **Port**: 27017
- **Database**: bitebuddy
- **URI**: mongodb://localhost:27017/bitebuddy

## Next Steps

After MongoDB is installed and running:

1. Start the backend: `npm start`
2. In another terminal, start the frontend: `cd frontend && npm start`
3. Access the app at http://localhost:3000

## Alternative: MongoDB Atlas (Cloud)

If you prefer to use MongoDB Atlas:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `.env` with your MongoDB Atlas URI
6. **Important**: Add your IP to the whitelist in Atlas security settings
