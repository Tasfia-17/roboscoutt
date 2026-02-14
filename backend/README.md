# SkyMind AI Backend

AI-powered autonomous drone fleet orchestration backend for the SkyMind platform.

## 🚀 Quick Deploy to Vultr

### 1. Get Gemini API Key
```bash
# Visit: https://aistudio.google.com/app/apikey
# Create new API key (free tier available)
```

### 2. Deploy to Vultr VM

**Create Vultr VM:**
- Go to https://my.vultr.com/
- Deploy New Server
- Choose: Cloud Compute - Regular Performance
- Location: Choose closest to you
- Server Type: Ubuntu 22.04 LTS
- Plan: $6/month (2GB RAM)

**SSH into your Vultr VM:**
```bash
ssh root@YOUR_VULTR_IP
```

**Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version  # Should show v20.x
```

**Deploy the backend:**
```bash
# Clone your repo
git clone https://github.com/Tasfia-17/SkyMind.git
cd SkyMind

# Create backend directory
mkdir -p backend
cd backend

# Upload these files (or copy from your local)
# - server.js
# - package.json
# - .env

# Install dependencies
npm install

# Set your Gemini API key
nano .env
# Add: GEMINI_API_KEY=your_actual_key_here

# Start the server
npm start
```

**Keep it running (use PM2):**
```bash
npm install -g pm2
pm2 start server.js --name skymind
pm2 startup
pm2 save
```

**Open firewall:**
```bash
ufw allow 3000
ufw allow 22
ufw enable
```

### 3. Test Your Backend

```bash
# From your local machine
curl http://YOUR_VULTR_IP:3000/health

# Should return:
# {"status":"ok","service":"SkyMind AI Backend"}
```

## 📡 API Endpoints

### POST /telemetry
Send drone state to backend.

```javascript
fetch('http://YOUR_VULTR_IP:3000/telemetry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    drone_id: 'drone_1',
    position: { x: 1.5, y: 2.0, z: 3.0 },
    battery: 85,
    status: 'active'
  })
});
```

### POST /mission
Get AI decision from Gemini.

```javascript
const response = await fetch('http://YOUR_VULTR_IP:3000/mission', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    drone_id: 'drone_1',
    position: { x: 1.5, y: 2.0, z: 3.0 },
    battery: 85,
    velocity: { x: 0.1, y: 0, z: 0 },
    obstacles: []
  })
});

const decision = await response.json();
// Returns: { action: "patrol", target: {x, y, z}, reasoning: "..." }
```

### GET /stats
Get dashboard statistics.

```bash
curl http://YOUR_VULTR_IP:3000/stats
```

### GET /history
Get mission and telemetry history.

```bash
curl http://YOUR_VULTR_IP:3000/history
```

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run locally
npm start

# Test
curl http://localhost:3000/health
```

## 🏗 Architecture

```
Browser (MuJoCo Sim)
    ↓ WebSocket/REST
Vultr VM Backend (Node.js + Express)
    ↓ API Call
Google Gemini AI (Decision Making)
    ↓ Response
SQLite Database (Telemetry + Missions)
    ↓ Return Decision
Browser (Execute Command)
```

## 📊 Database Schema

**telemetry table:**
- id, timestamp, drone_id, position_x, position_y, position_z, battery, status

**missions table:**
- id, timestamp, drone_id, action, target_x, target_y, target_z, reasoning

## 🔐 Security Notes

- Never commit `.env` file
- Use environment variables for API keys
- Enable Vultr firewall
- Use HTTPS in production (add nginx reverse proxy)

## 📝 License

MIT License - Part of SkyMind AI Fleet Orchestrator
