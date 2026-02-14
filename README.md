# 🚁 SkyMind AI - Autonomous Drone Fleet Orchestrator

> **AI-powered drone fleet with Gemini 3 Flash making real-time autonomous decisions**  
> Built for [lablab.ai AI Meets Robotics Hackathon](https://lablab.ai/event/launch-fund-ai-meets-robotics)

[![Demo](https://img.shields.io/badge/Demo-Live-success)](https://sky-mind-nine.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Hackathon](https://img.shields.io/badge/Hackathon-AI%20Meets%20Robotics-orange)](https://lablab.ai/event/launch-fund-ai-meets-robotics)
[![AI](https://img.shields.io/badge/AI-Gemini%203%20Flash-blue)](https://ai.google.dev/)



---

## 🎯 Overview

**SkyMind AI** uses **Google Gemini 3 Flash** to autonomously control drone fleets in real-time. The AI makes decisions every 2 seconds based on battery levels, position, velocity, and mission objectives - with full explainability.

### The Problem
Warehouse drone operations need intelligent coordination that adapts to real-time conditions. Manual control doesn't scale, and scripted behaviors can't handle unexpected situations.

### Our Solution
- **🤖 Gemini 3 Flash AI** - Makes autonomous decisions with natural language reasoning
- **🔄 Multi-API Key System** - 3 rotating keys for 45 requests/min (no rate limits)
- **☁️ Vultr Backend** - Central coordination layer with telemetry logging
- **⚙️ MuJoCo Physics** - Accurate simulation for safe testing
- **📊 Real-time Explainability** - See why AI makes each decision

**Key Innovation:** Transparent AI reasoning - operators understand every decision the drone makes.

---

## ✨ Key Features

### 🧠 Real AI Autonomy (Gemini 3 Flash)
- **Live decision-making** every 2 seconds based on drone state
- **Natural language reasoning** - see why AI chooses each action
- **Adaptive behavior** - responds to battery, position, velocity
- **Multi-key rotation** - 3 API keys for 45 requests/min (no rate limits)

### 🎮 Real-Time Physics Simulation
Browser-based MuJoCo engine running at 60 FPS with multiple robotics scenarios:
- Aerial vehicles (drones with PID control)
- Legged robots (quadrupeds, bipeds)
- Manipulators (robotic arms, hands)
- Multi-agent coordination

### 📡 Production Backend
Vultr-powered coordination layer:
- Gemini API integration with automatic key rotation
- Telemetry logging and mission history
- RESTful API for drone-to-cloud communication
- Fallback handling for offline scenarios

### 🎯 Explainable AI
Every decision includes:
- **Action**: patrol, inspect, return_base, hover
- **Target coordinates**: where to go next
- **Reasoning**: natural language explanation
- **Console logging**: real-time decision stream

---

## 🎥 Demo

**[▶️ Watch Demo Video](YOUR_YOUTUBE_LINK)**

**[🌐 Try Live Demo](https://sky-mind-nine.vercel.app/)**

### Example Scenes

<table>
  <tr>
    <td width="50%">
      <img src="docs/images/skydio-x2-demo.png" alt="Skydio X2 Drone" />
      <p align="center"><strong>Skydio X2 Quadcopter</strong><br/>Autonomous drone with PID control</p>
    </td>
    <td width="50%">
      <img src="docs/images/unitree-go1-demo.png" alt="Unitree GO1" />
      <p align="center"><strong>Unitree GO1 Robot</strong><br/>Quadruped locomotion</p>
    </td>
  </tr>
</table>

### Available Robotics Scenarios

- **🚁 Aerial Robots:** Skydio X2 drone with autonomous flight control
- **🐕 Quadrupeds:** Boston Dynamics Spot, Unitree GO1
- **🤖 Humanoids:** Bipedal robots, 22-humanoid crowd simulation
- **🦾 Manipulators:** Shadow Hand, robotic arms
- **🔬 Multi-Agent:** Combined drone + Spot coordination
- **⚙️ Physics Demos:** Balloons, flags, adhesion, tendons

---

## 🏗 Architecture

### Production Architecture (Scalable Deployment)

```
┌──────────────────┐
│  Browser Client  │  MuJoCo WASM + Three.js
│  (Simulation)    │  Calls AI every 2 seconds
└────────┬─────────┘
         │ HTTPS
         ▼
┌──────────────────┐
│  Gemini 3 Flash  │  Google AI API (3 rotating keys)
│  (AI Brain)      │  Returns: action + target + reasoning
└────────┬─────────┘
         │ Decision
         ▼
┌──────────────────┐
│  Drone Control   │  PID controllers apply AI target
│  (Autonomous)    │  Adapts to battery, position, velocity
└────────┬─────────┘
         │ Telemetry (optional)
         ▼
┌──────────────────┐
│  Vultr Backend   │  Node.js + Express
│  (Coordination)  │  Mission history & fleet management
└──────────────────┘
```

### Current Demo Implementation

For rapid prototyping and judge accessibility, the demo uses **direct browser-to-Gemini integration**. This approach:
- Eliminates backend latency for real-time decisions
- Enables instant testing without server dependencies
- Demonstrates clean API integration patterns
- Provides transparent AI reasoning in browser console

### Production Backend (Included)

The `/backend/server-multi-key.js` provides enterprise features:
- Multi-API key rotation and management
- Telemetry logging and analytics
- Mission history persistence
- Fleet coordination endpoints
- Scalable Vultr deployment configuration

**Deployment-ready** for production environments requiring centralized coordination.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3 (for local server)
- Gemini API keys ([Get free keys](https://aistudio.google.com/apikey))
- Vultr account (optional for backend)

### 1. Clone Repository
```bash
git clone https://github.com/Tasfia-17/SkyMind.git
cd SkyMind
```

### 2. Get Gemini API Keys (FREE)
1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key" (no credit card needed)
3. Copy the key (starts with `AIza...`)
4. Repeat for 2-3 keys (for rate limit protection)

### 3. Add AI Integration

**Option A: Quick Test (No Backend)**

Open `mujoco_wasm/examples/main.js` and add at the top:

```javascript
// AI Configuration
const GEMINI_API_KEYS = [
  "AIzaSy...YOUR_KEY_1",
  "AIzaSy...YOUR_KEY_2",
  "AIzaSy...YOUR_KEY_3"
];
let currentKeyIndex = 0;
let aiTarget = { x: 0, y: 0, z: 2 };
let frameCount = 0;

async function getAIDecision(pos, battery, vel) {
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Warehouse drone at (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}), battery ${battery.toFixed(0)}%. Respond JSON: {"action":"patrol","target":{"x":2,"y":1,"z":2.5},"reasoning":"why"}` }]
        }]
      })
    });
    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    const decision = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    console.log('🤖 AI:', decision.reasoning);
    return decision;
  } catch (e) {
    return { target: aiTarget, reasoning: 'fallback' };
  }
}
```

Then in your simulation loop:
```javascript
frameCount++;
if (frameCount % 120 === 0) {  // Every 2 seconds
  const pos = { x: simulation.xpos[0], y: simulation.xpos[1], z: simulation.xpos[2] };
  const battery = 100 - (frameCount / 3600) * 100;
  const vel = { x: simulation.qvel[0], y: simulation.qvel[1], z: simulation.qvel[2] };
  
  getAIDecision(pos, battery, vel).then(decision => {
    aiTarget = decision.target;
    console.log('🎯 Target:', aiTarget);
  });
}
```

**See `mujoco_wasm/examples/PASTE_INTO_MAIN_JS.js` for complete code.**

### 4. Run Locally
```bash
cd mujoco_wasm
python -m http.server 8000
```

Open http://localhost:8000 and check console (F12) - you'll see:
```
🤖 AI (Key 1/3): Continuing patrol route
🎯 Target: {x: 2, y: 1, z: 2.5}
```

### 5. Deploy Backend to Vultr (Optional)

**For production deployments**, the backend provides centralized coordination:

```bash
# SSH into your Vultr VM
ssh root@YOUR_VULTR_IP

# Setup
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Deploy
mkdir -p /var/www/skymind
cd /var/www/skymind

# Copy backend/server-multi-key.js content
# Update GEMINI_KEYS array with your keys

npm init -y
npm install express cors
node server-multi-key.js
```

**Note:** The demo uses direct browser-to-Gemini for instant accessibility. Backend deployment enables enterprise features like telemetry logging, mission history, and fleet coordination.

**Detailed deployment guide:** [docs/HACKATHON_SUBMISSION_GUIDE.md](docs/HACKATHON_SUBMISSION_GUIDE.md)

---

## 📁 Project Structure

```
SkyMind/
├── mujoco_wasm/                    # MuJoCo simulation
│   ├── examples/
│   │   ├── main.js                 # Main simulation (ADD AI CODE HERE)
│   │   ├── ai-integration-multi-key.js  # Complete AI module
│   │   ├── PASTE_INTO_MAIN_JS.js   # Ready-to-paste code
│   │   ├── skydio_x2/              # Drone simulation
│   │   └── combined_drone_spot/    # Multi-agent
│   ├── src/                        # WASM source
│   └── index.html                  # Entry point
│
├── backend/                        # Vultr backend (optional)
│   ├── server.js                   # Original backend
│   ├── server-multi-key.js         # Multi-API key version ⭐
│   ├── package.json
│   └── README.md
│
├── frontend/                       # Frontend integration
│   └── skymind-ai/
│       ├── dashboard.html          # Live dashboard UI
│       └── skymind-ai.js           # AI integration module
│
├── docs/                           # Documentation
│   ├── HACKATHON_SUBMISSION_GUIDE.md
│   └── QUICK_REFERENCE.txt
│
├── URGENT_AI_INTEGRATION.md        # Step-by-step AI setup ⭐
└── README.md                       # This file
```

**⭐ Key Files for AI Integration:**
- `mujoco_wasm/examples/PASTE_INTO_MAIN_JS.js` - Copy this into main.js
- `backend/server-multi-key.js` - Backend with 3 API keys
- `URGENT_AI_INTEGRATION.md` - Complete setup guide

---

## 🎮 Controls

### Drone Control
- **W/S** - Pitch forward/backward
- **A/D** - Roll left/right
- **Space** - Increase altitude
- **Z** - Decrease altitude

### Camera
- **C** - Cycle camera modes
- **Mouse** - Orbit camera
- **Scroll** - Zoom

### AI Control
- **Dashboard Toggle** - Switch between AI and manual mode

---

## 📡 API Endpoints

### Direct Gemini API (Client-side)
```bash
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=YOUR_KEY

Body:
{
  "contents": [{
    "parts": [{ 
      "text": "Drone at (1.5, 2.0, 3.0), battery 85%. Respond JSON: {\"action\":\"patrol\",\"target\":{\"x\":2,\"y\":1,\"z\":2.5},\"reasoning\":\"why\"}"
    }]
  }]
}

Response:
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "{\"action\":\"patrol\",\"target\":{\"x\":2.5,\"y\":1.5,\"z\":2.8},\"reasoning\":\"Battery sufficient, continuing patrol route\"}"
      }]
    }
  }]
}
```

### Backend API (Optional - Vultr)

**`POST /mission`** - Get AI decision
```bash
curl -X POST http://YOUR_VULTR_IP:3000/mission \
  -H "Content-Type: application/json" \
  -d '{
    "position": {"x": 1.5, "y": 2.0, "z": 3.0},
    "battery": 85,
    "velocity": {"x": 0.1, "y": 0, "z": 0}
  }'
```

Response:
```json
{
  "action": "patrol",
  "target": {"x": 5.0, "y": 3.0, "z": 2.5},
  "reasoning": "Battery sufficient, continuing patrol route"
}
```

**`POST /telemetry`** - Log drone state
```bash
curl -X POST http://YOUR_VULTR_IP:3000/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "drone_id": "drone_1",
    "position": {"x": 1.5, "y": 2.0, "z": 3.0},
    "battery": 85,
    "status": "active"
  }'
```

**`GET /health`** - Check backend status
```bash
curl http://YOUR_VULTR_IP:3000/health
```

---

## 🛠 Tech Stack

**AI & Decision Making:**
- **Gemini 3 Flash** - Google's fastest multimodal AI (FREE tier)
- Multi-key rotation - 3 API keys for 45 requests/min
- Natural language reasoning - explainable decisions
- JSON structured outputs - reliable parsing

**Frontend:**
- MuJoCo WASM - Physics simulation
- Three.js - 3D rendering
- Vanilla JavaScript - Direct API integration

**Backend (Optional):**
- Node.js + Express - API server
- Multi-key management - Automatic rotation
- CORS enabled - Browser access

**Infrastructure:**
- Vultr Cloud Compute - Backend hosting
- Vercel - Frontend deployment
- GitHub - Version control

**Key Innovation:**
- **Direct browser-to-Gemini** - No backend required for testing
- **Multi-API key system** - Never hit rate limits
- **Explainable AI** - See reasoning for every decision

---

## 🏆 Hackathon Alignment

### Track 1: Autonomous Robotics Control ✅
- **AI-driven decision making** - Gemini 3 Flash makes real decisions every 2 seconds
- **Not scripted** - Adapts to battery, position, velocity in real-time
- **Explainable autonomy** - Natural language reasoning for every action
- **Multi-agent ready** - Architecture supports fleet coordination

### Required Technologies ✅
- **✅ Vultr** - Production backend architecture included (`/backend/server-multi-key.js`)
- **✅ Gemini AI** - Core decision engine with 3 rotating API keys
- **✅ Simulation** - MuJoCo physics engine with accurate drone dynamics
- **✅ Web-based** - Live demo accessible at https://sky-mind-nine.vercel.app/

### Innovation ✅
- **Multi-key rotation** - 3 API keys = 45 requests/min (no rate limits)
- **Direct browser-to-AI** - No backend required for testing
- **Transparent reasoning** - See why AI makes each decision
- **Production-ready** - Real API integration, not mock data
- **Explainable autonomy** - Operators understand AI behavior

### Demo-Ready ✅
- **Live AI decisions** - Console shows reasoning every 2 seconds
- **Real-time adaptation** - Battery low → return to base
- **Visual feedback** - Drone follows AI targets
- **Error handling** - Fallback when API unavailable

---

## 💼 Business Value

### Target Market
- Warehouse automation ($30B by 2026)
- Drone logistics (55% annual growth)
- Enterprise fleet management

### Value Proposition
- **Reduce costs** - Automated coordination vs manual
- **Increase safety** - Digital twin testing before deployment
- **Scale easily** - One AI brain for entire fleet
- **Debug faster** - Transparent AI reasoning

### Revenue Model
- SaaS subscription per drone
- Enterprise licenses for large fleets
- API access for integrations

---

## 📈 Future Roadmap

- [ ] Multi-drone collision avoidance
- [ ] Real-time obstacle detection
- [ ] Battery optimization algorithms
- [ ] Integration with real drone hardware
- [ ] Fleet analytics dashboard
- [ ] Mobile operator app
- [ ] Voice commands via Gemini

---

## 🤝 Contributing

We welcome contributions! Areas for improvement:
- New simulation scenarios
- Control system enhancements
- Dashboard features
- Documentation improvements

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

### Third-Party Components
- **MuJoCo** - Apache 2.0 (Google DeepMind)
- **Three.js** - MIT License
- **Node.js** - MIT License

---

## 🙏 Acknowledgments

- **lablab.ai** - Hackathon organizers
- **Google DeepMind** - Gemini AI and MuJoCo
- **Vultr** - Cloud infrastructure
- **Surge** - Funding opportunities

---

## 📞 Links

- **Live Demo:** https://mujoco-wasm.vercel.app/
- **Backend API:** `http://YOUR_VULTR_IP:3000`
- **Demo Video:** [YOUR_YOUTUBE_LINK]
- **X Post:** [YOUR_TWEET_URL]
- **Hackathon:** https://lablab.ai/event/launch-fund-ai-meets-robotics

---

## 👥 Team

Built by [@Tasfia-17](https://github.com/Tasfia-17)

**Original MuJoCo WASM Contributors:**
- [@AdvayIyer](https://github.com/AdvayIyer)
- [@k1a11220](https://github.com/k1a11220)

---

## 📖 Documentation

- **[Complete Submission Guide](docs/HACKATHON_SUBMISSION_GUIDE.md)** - Full deployment walkthrough
- **[Quick Reference](docs/QUICK_REFERENCE.txt)** - Quick start commands
- **[Backend README](backend/README.md)** - Backend deployment details
- **[Integration Guide](frontend/skymind-ai/INTEGRATION_GUIDE.js)** - Frontend integration

---

**Built with ❤️ for autonomous robotics and AI innovation**

🚁 **SkyMind AI** - Making drone fleets intelligent, transparent, and scalable
