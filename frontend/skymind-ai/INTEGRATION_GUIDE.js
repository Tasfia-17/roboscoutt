// Integration instructions for your existing main.js

/*
===========================================
STEP 1: Add this import at the top of main.js
===========================================
*/

import { SkyMindAI } from './skymind-ai.js';

/*
===========================================
STEP 2: Initialize SkyMind AI after loading MuJoCo
===========================================
*/

// Replace YOUR_VULTR_IP with your actual Vultr server IP
const BACKEND_URL = 'http://YOUR_VULTR_IP:3000';
const skyMindAI = new SkyMindAI(BACKEND_URL);
window.skyMindAI = skyMindAI; // Make it globally accessible

/*
===========================================
STEP 3: Add dashboard iframe to your HTML
===========================================
Add this to your index.html or main HTML file, right before </body>:
*/

// <iframe src="dashboard.html" style="position:fixed;top:0;right:0;width:340px;height:100vh;border:none;z-index:9999;"></iframe>

/*
===========================================
STEP 4: Integrate AI decisions into your control loop
===========================================
Find your main simulation loop (usually in a function that runs every frame)
Add this code:
*/

// Example integration in your existing control loop:
let aiDecisionCounter = 0;
let currentAITarget = null;
let batteryLevel = 100; // Track battery (decrease over time)

async function updateDroneWithAI(simulation, droneBodyId) {
  // Get current drone state
  const pos = getPosition(simulation, droneBodyId);
  const vel = simulation.qvel; // Get velocity from simulation
  
  // Simulate battery drain (1% per 10 seconds at 60fps)
  batteryLevel = Math.max(0, batteryLevel - (1 / 600));
  
  // Send telemetry every 60 frames (1 second at 60fps)
  if (aiDecisionCounter % 60 === 0) {
    await skyMindAI.sendTelemetry(pos, batteryLevel);
    
    // Update dashboard
    if (window.updateSkyMindDashboard) {
      window.updateSkyMindDashboard({
        position: { x: pos[0], y: pos[1], z: pos[2] },
        battery: batteryLevel
      });
    }
  }
  
  // Get new AI decision every 300 frames (5 seconds at 60fps)
  if (aiDecisionCounter % 300 === 0) {
    const decision = await skyMindAI.getAIDecision(
      pos,
      batteryLevel,
      [vel[0] || 0, vel[1] || 0, vel[2] || 0],
      [] // Add obstacle detection if you have it
    );
    
    currentAITarget = decision.target;
    
    // Update dashboard with AI decision
    if (window.updateSkyMindDashboard) {
      window.updateSkyMindDashboard({
        decision: decision,
        logMessage: `AI: ${decision.action} - ${decision.reasoning}`
      });
    }
  }
  
  aiDecisionCounter++;
  
  // Use AI target if available, otherwise use manual control
  if (currentAITarget && skyMindAI.aiEnabled) {
    return currentAITarget;
  }
  
  return null; // Fall back to manual control
}

/*
===========================================
STEP 5: Modify your existing PID control
===========================================
In your existing control code, add AI target integration:
*/

// Example modification to your existing control loop:
function controlDrone(simulation, droneBodyId, inputManager) {
  // Get AI target
  const aiTarget = await updateDroneWithAI(simulation, droneBodyId);
  
  if (aiTarget && skyMindAI.aiEnabled) {
    // Use AI-determined target
    const currentPos = getPosition(simulation, droneBodyId);
    
    // Calculate direction to AI target
    const dx = aiTarget.x - currentPos[0];
    const dy = aiTarget.y - currentPos[1];
    const dz = aiTarget.z - currentPos[2];
    
    // Convert to pitch/roll commands for your PID
    const distance = Math.sqrt(dx*dx + dy*dy);
    if (distance > 0.5) { // If not at target
      const pitchTarget = Math.atan2(dx, distance) * 15; // Scale to your PID range
      const rollTarget = Math.atan2(dy, distance) * 15;
      
      // Apply to your existing PID controllers
      // (Replace with your actual PID variable names)
      pitchPID.setpoint = pitchTarget;
      rollPID.setpoint = rollTarget;
      altitudePID.setpoint = aiTarget.z;
    }
  } else {
    // Use manual control (your existing keyboard input code)
    // Keep your existing WASD control logic here
  }
  
  // Rest of your existing control code...
}

/*
===========================================
STEP 6: Test the integration
===========================================
1. Start your backend: cd skymind-backend && npm start
2. Open your simulation in browser
3. You should see:
   - Dashboard on the right side
   - Telemetry being sent every second
   - AI decisions every 5 seconds
   - Battery draining slowly
*/

/*
===========================================
MINIMAL INTEGRATION (If you're short on time)
===========================================
If you just need it working quickly, add this to your main loop:
*/

let frameCount = 0;
setInterval(async () => {
  if (!simulation || !model) return;
  
  const dronePos = getPosition(simulation, 1); // Adjust body ID
  const battery = 100 - (frameCount / 3600) * 100; // Drain over 1 minute
  
  // Send telemetry
  await fetch('http://YOUR_VULTR_IP:3000/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      drone_id: 'drone_1',
      position: { x: dronePos[0], y: dronePos[1], z: dronePos[2] },
      battery: Math.max(0, battery),
      status: 'active'
    })
  });
  
  // Get AI decision every 5 seconds
  if (frameCount % 300 === 0) {
    const response = await fetch('http://YOUR_VULTR_IP:3000/mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drone_id: 'drone_1',
        position: { x: dronePos[0], y: dronePos[1], z: dronePos[2] },
        battery: Math.max(0, battery),
        velocity: { x: 0, y: 0, z: 0 },
        obstacles: []
      })
    });
    const decision = await response.json();
    console.log('AI Decision:', decision);
  }
  
  frameCount++;
}, 1000 / 60); // 60 FPS

/*
===========================================
IMPORTANT NOTES
===========================================
1. Replace YOUR_VULTR_IP with your actual Vultr server IP address
2. Make sure CORS is enabled on your backend (already done in server.js)
3. Test locally first with http://localhost:3000
4. The dashboard will show real-time AI decisions and telemetry
5. Battery simulation is fake - adjust the drain rate as needed
*/
