// SkyMind WebOps - TinyFish Integration Layer
// Add this to main.js for Web Agents Hackathon

const TINYFISH_API_KEY = "YOUR_TINYFISH_KEY"; // Set via environment or config
const WEB_AGENT_BACKEND = "http://localhost:3001";

// Simulated warehouse dashboard URLs (replace with real ones)
const WAREHOUSE_DASHBOARDS = {
  tasks: "https://warehouse-demo.com/tasks",
  weather: "https://weather.com",
  maintenance: "https://maintenance-tracker.com"
};

let webDataCache = {
  tasks: [],
  weather: { safe_to_fly: true },
  last_update: null
};

// Fetch real website data via TinyFish
async function fetchWarehouseTasks() {
  try {
    const response = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
      method: "POST",
      headers: {
        "X-API-Key": TINYFISH_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://example-warehouse-dashboard.com/tasks",
        goal: `Extract all active warehouse tasks. Return JSON format:
        {
          "tasks": [
            {
              "task_id": "string",
              "priority": "high|medium|low",
              "location": {"x": 0, "y": 0, "z": 0},
              "deadline": "ISO timestamp",
              "robot_type": "drone|quadruped|humanoid"
            }
          ]
        }`
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'result') {
              result = event.data;
            }
          } catch (e) {}
        }
      }
    }

    webDataCache.tasks = JSON.parse(result).tasks || [];
    webDataCache.last_update = new Date().toISOString();
    
    console.log('🌐 TinyFish: Fetched', webDataCache.tasks.length, 'warehouse tasks');
    return webDataCache.tasks;
    
  } catch (error) {
    console.warn('⚠️ TinyFish error:', error.message);
    return [];
  }
}

// Enhanced AI decision with web context
async function getWebAwareAIDecision(pos, battery, vel) {
  if (!aiEnabled) return { target: aiTarget, reasoning: "AI disabled", action: "hover" };
  
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  
  try {
    const prompt = `You are SkyMind WebOps, an autonomous fleet operations AI.

Robot State:
- Position: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})
- Battery: ${battery.toFixed(0)}%
- Velocity: (${vel.x.toFixed(1)}, ${vel.y.toFixed(1)}, ${vel.z.toFixed(1)})

Web Dashboard Data:
- Active Tasks: ${webDataCache.tasks.length}
- Weather Safe: ${webDataCache.weather.safe_to_fly}
- Last Web Update: ${webDataCache.last_update || 'never'}

Decision Priorities:
1. Safety (battery < 20% = return to base at 0,0,2)
2. High-priority tasks from web dashboard
3. Energy efficiency
4. Patrol warehouse area (-3 to 3 on x/y)

Constraints:
- Max flight range: 10m from base
- Return to base if battery <= 20%
- Avoid task conflicts

Respond JSON only:
{
  "action": "patrol|inspect|return_base|hover|execute_task",
  "target": {"x":2,"y":1,"z":2.5},
  "priority_level": "high|medium|low",
  "reasoning": "brief operational explanation",
  "confidence": 0.95,
  "requires_web_action": false,
  "web_action_type": null
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    
    const text = data.candidates[0].content.parts[0].text;
    const decision = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    
    aiDecisionCount++;
    lastAIAction = decision.action;
    lastAIReasoning = decision.reasoning;
    
    console.log(`🤖 Web-Aware AI Decision #${aiDecisionCount} (Key ${currentKeyIndex}/${GEMINI_API_KEYS.length}):`, decision.action);
    console.log(`   Priority: ${decision.priority_level} | Confidence: ${decision.confidence}`);
    console.log(`   Reasoning: ${decision.reasoning}`);
    console.log(`   Target: (${decision.target.x}, ${decision.target.y}, ${decision.target.z})`);
    
    if (decision.requires_web_action) {
      console.log(`   🌐 Web Action Required: ${decision.web_action_type}`);
    }
    
    aiTarget = decision.target;
    updateWebAwareDisplay(decision);
    return decision;
    
  } catch (e) {
    console.warn('⚠️ AI error:', e.message, '- using fallback');
    lastAIReasoning = 'Fallback mode: ' + e.message;
    updateWebAwareDisplay({ action: 'hover', priority_level: 'low', confidence: 0.5 });
    return { target: aiTarget, reasoning: 'fallback', action: 'hover' };
  }
}

// Enhanced display with web agent status
function updateWebAwareDisplay(decision) {
  const display = document.getElementById('ai-status');
  if (display) {
    display.innerHTML = `
      <div style="background: rgba(0,0,0,0.9); color: #0f0; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; max-width: 450px;">
        <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #00ff00;">🌐 SkyMind WebOps Agent</div>
        <div style="color: #00ffff; margin-bottom: 8px;">━━━ AI DECISIONS ━━━</div>
        <div><strong>Decisions:</strong> ${aiDecisionCount}</div>
        <div><strong>Action:</strong> <span style="color: #00ffff;">${lastAIAction}</span></div>
        <div><strong>Priority:</strong> <span style="color: ${decision.priority_level === 'high' ? '#ff0000' : decision.priority_level === 'medium' ? '#ffff00' : '#00ff00'}">${decision.priority_level || 'medium'}</span></div>
        <div><strong>Confidence:</strong> ${((decision.confidence || 0.8) * 100).toFixed(0)}%</div>
        <div><strong>Target:</strong> (${aiTarget.x.toFixed(1)}, ${aiTarget.y.toFixed(1)}, ${aiTarget.z.toFixed(1)})</div>
        <div><strong>Battery:</strong> ${Math.max(0, 100 - (frameCount / 3600) * 100).toFixed(0)}%</div>
        
        <div style="color: #00ffff; margin: 8px 0;">━━━ WEB AUTOMATION ━━━</div>
        <div><strong>TinyFish:</strong> <span style="color: #00ff00;">ACTIVE</span></div>
        <div><strong>Web Tasks:</strong> ${webDataCache.tasks.length}</div>
        <div><strong>Last Sync:</strong> ${webDataCache.last_update ? new Date(webDataCache.last_update).toLocaleTimeString() : 'pending'}</div>
        
        <div style="margin-top: 8px; color: #ffff00;"><strong>Reasoning:</strong> ${lastAIReasoning}</div>
        <div style="margin-top: 8px; font-size: 10px; color: #888;">Gemini 3 Flash + TinyFish API • ${GEMINI_API_KEYS.length} keys rotating</div>
      </div>
    `;
  }
}

// Initialize web agent on page load
window.addEventListener('load', () => {
  console.log('🌐 SkyMind WebOps Agent initialized');
  console.log('🤖 TinyFish integration: ACTIVE');
  
  // Fetch web data every 30 seconds
  setInterval(() => {
    fetchWarehouseTasks();
  }, 30000);
  
  // Initial fetch
  fetchWarehouseTasks();
});
