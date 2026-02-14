# 🚀 SkyMind AI - Complete Hackathon Submission Guide

## ⏰ Timeline: 5 Days to Submission (Feb 15)

### Day 1 (Today): Backend Setup ✅
- [x] Backend code created
- [ ] Deploy to Vultr
- [ ] Get Gemini API key
- [ ] Test endpoints

### Day 2: Frontend Integration
- [ ] Add dashboard to your repo
- [ ] Integrate AI module
- [ ] Test locally
- [ ] Deploy frontend

### Day 3: Polish & Testing
- [ ] Multi-drone scenario (combined_drone_spot)
- [ ] Improve AI prompts
- [ ] Add more dashboard features
- [ ] Test end-to-end

### Day 4: Demo & Documentation
- [ ] Record demo video
- [ ] Update README
- [ ] Prepare pitch
- [ ] Test on different browsers

### Day 5: Submission
- [ ] Final testing
- [ ] Create X post
- [ ] Submit to lablab.ai
- [ ] Backup everything

---

## 📋 Step-by-Step Deployment

### 1️⃣ Get Gemini API Key (5 minutes)

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Select "Create API key in new project"
4. Copy the key (starts with `AIza...`)
5. Save it securely

**Free tier includes:**
- 15 requests per minute
- 1,500 requests per day
- More than enough for the hackathon

---

### 2️⃣ Deploy Backend to Vultr (30 minutes)

**A. Create Vultr Account**
1. Go to https://www.vultr.com/
2. Sign up (use GitHub or email)
3. Add payment method (won't be charged during free trial)

**B. Deploy Server**
1. Click "Deploy +"
2. Choose:
   - **Type:** Cloud Compute - Regular Performance
   - **Location:** New York or closest to you
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** $6/month (2GB RAM, 55GB SSD)
3. Click "Deploy Now"
4. Wait 2-3 minutes for server to start
5. Copy the IP address and root password

**C. SSH into Server**
```bash
# From your terminal
ssh root@YOUR_VULTR_IP
# Enter the password when prompted
```

**D. Install Node.js**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git

# Verify
node --version  # Should show v20.x
npm --version   # Should show 10.x
```

**E. Deploy Backend**
```bash
# Create directory
mkdir -p /var/www/skymind-backend
cd /var/www/skymind-backend

# Copy files (you'll need to upload them)
# Option 1: Use git (recommended)
git clone https://github.com/YOUR_USERNAME/SkyMind.git
cd SkyMind/backend

# Option 2: Manual upload using scp from your local machine
# scp -r ~/skymind-backend/* root@YOUR_VULTR_IP:/var/www/skymind-backend/

# Install dependencies
npm install

# Create .env file
nano .env
```

**Add to .env:**
```
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_KEY_HERE
PORT=3000
NODE_ENV=production
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

**F. Start Server with PM2**
```bash
# Install PM2 (process manager)
npm install -g pm2

# Start server
pm2 start server.js --name skymind

# Make it start on reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs skymind
```

**G. Configure Firewall**
```bash
# Allow necessary ports
ufw allow 22    # SSH
ufw allow 3000  # Backend API
ufw enable

# Check status
ufw status
```

**H. Test Backend**
```bash
# From your local machine
curl http://YOUR_VULTR_IP:3000/health

# Should return:
# {"status":"ok","service":"SkyMind AI Backend"}
```

✅ **Backend is now live!**

---

### 3️⃣ Integrate Frontend (1-2 hours)

**A. Add Files to Your Repo**
```bash
cd /tmp/skymind  # Your cloned repo

# Create frontend integration folder
mkdir -p mujoco_wasm/examples/skymind

# Copy the files I created
cp ~/skymind-frontend/skymind-ai.js mujoco_wasm/examples/skymind/
cp ~/skymind-frontend/dashboard.html mujoco_wasm/examples/skymind/
cp ~/skymind-frontend/INTEGRATION_GUIDE.js mujoco_wasm/examples/skymind/
```

**B. Modify Your index.html**

Add this right before `</body>`:
```html
<!-- SkyMind AI Dashboard -->
<iframe 
  src="examples/skymind/dashboard.html" 
  style="position:fixed;top:0;right:0;width:340px;height:100vh;border:none;z-index:9999;"
  id="skymind-dashboard">
</iframe>
```

**C. Modify Your main.js**

At the top, add:
```javascript
import { SkyMindAI } from './skymind/skymind-ai.js';

// Initialize (replace with your Vultr IP)
const skyMindAI = new SkyMindAI('http://YOUR_VULTR_IP:3000');
window.skyMindAI = skyMindAI;
```

In your main loop (find the function that runs every frame), add:
```javascript
let frameCount = 0;
let batteryLevel = 100;

// Inside your animation/render loop
async function updateWithAI() {
  if (frameCount % 60 === 0) { // Every second
    const dronePos = getPosition(simulation, droneBodyId);
    batteryLevel = Math.max(0, batteryLevel - 0.1); // Drain battery
    
    await skyMindAI.sendTelemetry(dronePos, batteryLevel);
    
    // Update dashboard
    if (window.updateSkyMindDashboard) {
      window.updateSkyMindDashboard({
        position: { x: dronePos[0], y: dronePos[1], z: dronePos[2] },
        battery: batteryLevel
      });
    }
  }
  
  if (frameCount % 300 === 0) { // Every 5 seconds
    const decision = await skyMindAI.getAIDecision(
      dronePos, batteryLevel, [0, 0, 0], []
    );
    
    if (window.updateSkyMindDashboard) {
      window.updateSkyMindDashboard({
        decision: decision,
        logMessage: `${decision.action}: ${decision.reasoning}`
      });
    }
  }
  
  frameCount++;
}
```

**D. Test Locally**
```bash
cd mujoco_wasm
python -m http.server 8000

# Open browser: http://localhost:8000
# You should see the dashboard on the right
```

**E. Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd mujoco_wasm
vercel --prod

# Copy the URL (e.g., https://skymind.vercel.app)
```

---

### 4️⃣ Create Demo Video (1 hour)

**What to Show:**
1. **Opening (10 sec):** "SkyMind AI - Autonomous Drone Fleet Orchestrator"
2. **Problem (15 sec):** "Warehouse drone fleets need intelligent coordination"
3. **Solution (20 sec):** Show your dashboard + simulation running
4. **AI in Action (30 sec):** 
   - Point to AI decisions in dashboard
   - Show drone responding
   - Highlight Gemini reasoning
5. **Architecture (15 sec):** Quick diagram showing Vultr + Gemini + MuJoCo
6. **Call to Action (10 sec):** "Built for lablab.ai AI Meets Robotics Hackathon"

**Tools:**
- Screen recording: OBS Studio (free) or Loom
- Video editing: DaVinci Resolve (free) or CapCut
- Length: 90 seconds max
- Format: MP4, 1080p

**Upload to:**
- YouTube (unlisted or public)
- Copy the link

---

### 5️⃣ Create X (Twitter) Post (MANDATORY)

**Template:**
```
🚁 Just built SkyMind AI for @lablabai @Surgexyz_ AI Meets Robotics Hackathon!

AI-powered autonomous drone fleet orchestrator:
✅ Google Gemini for mission planning
✅ Vultr backend coordination
✅ Real-time MuJoCo simulation
✅ Live AI decision dashboard

🎥 Demo: [YOUR_YOUTUBE_LINK]
💻 Code: https://github.com/Tasfia-17/SkyMind
🌐 Live: [YOUR_VERCEL_URL]

#AIRobotics #LabLabAI #SurgeXYZ #Gemini #Vultr

[Attach a screenshot or short video clip]
```

**CRITICAL:**
1. Must tag @lablabai AND @Surgexyz_
2. Must include demo video link
3. Copy the tweet URL
4. You'll paste this URL in the submission form

---

### 6️⃣ Submit to lablab.ai (30 minutes)

**Go to:** https://lablab.ai/event/launch-fund-ai-meets-robotics

**Fill out:**
- **Project Title:** SkyMind AI - Autonomous Drone Fleet Orchestrator
- **Short Description:** AI-powered drone fleet coordination platform using Gemini for mission planning, Vultr for backend orchestration, and MuJoCo for digital twin simulation.
- **Long Description:** (See template below)
- **Cover Image:** Screenshot of your dashboard + simulation
- **Video Presentation:** Your YouTube link
- **GitHub Repository:** https://github.com/Tasfia-17/SkyMind
- **Demo URL:** Your Vercel URL
- **X Post Link:** YOUR TWEET URL (MANDATORY)
- **Technologies:** Gemini AI, Vultr, MuJoCo, WebAssembly, Node.js
- **Track:** Track 1 - Autonomous Robotics Control in Simulation

**Long Description Template:**
```
SkyMind AI is an autonomous drone fleet orchestration platform designed for warehouse operations. It combines Google Gemini's reasoning capabilities with Vultr's cloud infrastructure and MuJoCo's physics simulation to create an intelligent, scalable robotics coordination system.

PROBLEM:
Modern warehouses are deploying drone fleets for inventory inspection, but coordinating multiple autonomous agents requires centralized AI decision-making that adapts to real-time conditions.

SOLUTION:
SkyMind AI provides:
- Gemini-powered mission planning with natural language reasoning
- Vultr backend as the central coordination layer
- Real-time MuJoCo digital twin for validation
- Live dashboard showing AI decisions and fleet status

ARCHITECTURE:
1. Browser-based MuJoCo simulation sends telemetry to Vultr backend
2. Vultr backend calls Gemini API for mission planning
3. Gemini analyzes drone state, battery, obstacles and returns decisions
4. Backend logs all missions and telemetry in SQLite
5. Dashboard displays real-time AI reasoning and fleet metrics

TECHNICAL STACK:
- Frontend: MuJoCo WASM, Three.js, vanilla JavaScript
- Backend: Node.js, Express, SQLite (deployed on Vultr)
- AI: Google Gemini 2.0 Flash for decision-making
- Simulation: MuJoCo physics engine with PID control

INNOVATION:
Unlike traditional hard-coded robotics systems, SkyMind uses Gemini's reasoning to make context-aware decisions. The AI can explain its choices ("Rerouting due to low battery"), making the system transparent and debuggable.

BUSINESS VALUE:
Warehouse operators can deploy this as a SaaS platform to:
- Reduce manual drone coordination
- Optimize battery usage and flight paths
- Scale to hundreds of drones with centralized AI
- Validate operations in digital twin before real deployment

Built in 8 days for the lablab.ai AI Meets Robotics Hackathon.
```

---

## ✅ Pre-Submission Checklist

### Technical Requirements
- [ ] Vultr backend deployed and accessible
- [ ] Gemini API integrated and working
- [ ] Frontend shows dashboard with AI decisions
- [ ] GitHub repo is public
- [ ] Demo is deployed (Vercel/Netlify)
- [ ] All code is documented

### Submission Requirements
- [ ] Demo video created (90 sec max)
- [ ] Video uploaded to YouTube
- [ ] X post created with @lablabai @Surgexyz_
- [ ] X post includes video link
- [ ] X post URL copied
- [ ] Cover image created
- [ ] README updated with architecture

### Testing
- [ ] Backend health check works
- [ ] Telemetry is being sent
- [ ] AI decisions are returned
- [ ] Dashboard updates in real-time
- [ ] Works in Chrome/Firefox
- [ ] Mobile responsive (bonus)

---

## 🎯 Judging Criteria Alignment

**Application of Technology (25%):**
- ✅ Gemini 2.0 Flash for mission planning
- ✅ Vultr as central backend
- ✅ MuJoCo for physics simulation
- ✅ Real-time AI decision-making

**Presentation (25%):**
- ✅ Live dashboard showing AI reasoning
- ✅ Professional demo video
- ✅ Clear architecture explanation
- ✅ Transparent AI decisions

**Business Value (25%):**
- ✅ Solves real warehouse problem
- ✅ Scalable SaaS model
- ✅ Reduces operational costs
- ✅ Digital twin validation

**Originality (25%):**
- ✅ Transparent AI reasoning (not black box)
- ✅ Browser-based physics simulation
- ✅ Real-time coordination layer
- ✅ Explainable autonomy

---

## 🆘 Troubleshooting

**Backend won't start:**
```bash
pm2 logs skymind
# Check for errors, usually missing GEMINI_API_KEY
```

**CORS errors:**
```bash
# Already handled in server.js, but if issues persist:
# Add to Vultr firewall: allow from your domain
```

**Gemini API errors:**
```bash
# Check your API key is valid
# Verify you're not hitting rate limits (15 req/min)
# Use fallback mode if Gemini fails
```

**Dashboard not showing:**
```bash
# Check browser console for errors
# Verify iframe src path is correct
# Test dashboard.html standalone first
```

---

## 📞 Support

**If you get stuck:**
1. Check the INTEGRATION_GUIDE.js file
2. Test each component separately
3. Use browser DevTools console
4. Check PM2 logs on Vultr: `pm2 logs skymind`

**Resources:**
- Gemini API Docs: https://ai.google.dev/docs
- Vultr Docs: https://www.vultr.com/docs/
- MuJoCo Docs: https://mujoco.readthedocs.io/

---

## 🏆 You're Ready to Win!

Your project has:
- ✅ Strong technical foundation (MuJoCo simulation)
- ✅ Required AI integration (Gemini)
- ✅ Mandatory backend (Vultr)
- ✅ Professional presentation (Dashboard)
- ✅ Clear business value (Warehouse operations)
- ✅ Real innovation (Explainable AI decisions)

**This is a top-tier submission. Execute the plan and you're in the running for prizes!**

Good luck! 🚀
