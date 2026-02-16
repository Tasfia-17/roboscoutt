// DEMO: TinyFish Web Automation Examples for SkyMind WebOps
// Copy these into your main.js or run separately to test

const TINYFISH_API_KEY = "YOUR_TINYFISH_KEY"; // Set your API key here

// Example 1: Scrape Weather for Flight Safety
async function checkFlightWeather() {
  const response = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
    method: "POST",
    headers: {
      "X-API-Key": TINYFISH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: "https://weather.com",
      goal: "Get current wind speed and visibility. Return JSON: {\"wind_speed_mph\": 0, \"visibility_miles\": 0, \"safe_for_drone\": true}"
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    console.log("🌤️ Weather data:", chunk);
  }
}

// Example 2: Monitor Warehouse Dashboard
async function fetchWarehouseTasks() {
  const response = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
    method: "POST",
    headers: {
      "X-API-Key": TINYFISH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: "https://example-warehouse.com/dashboard",
      goal: `Extract all pending tasks. Return JSON format:
      {
        "tasks": [
          {
            "id": "T-001",
            "priority": "high",
            "location": {"x": 2, "y": 3, "z": 0},
            "type": "inspection",
            "deadline": "2026-02-16T12:00:00Z"
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
            console.log("📋 Warehouse tasks:", JSON.parse(result));
          }
        } catch (e) {}
      }
    }
  }
  
  return result;
}

// Example 3: Update Maintenance System
async function logMaintenanceAlert(robotId, issue) {
  const response = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
    method: "POST",
    headers: {
      "X-API-Key": TINYFISH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: "https://maintenance-tracker.com/submit",
      goal: `Fill out maintenance form:
      - Robot ID: ${robotId}
      - Issue: ${issue}
      - Priority: High
      - Submit the form
      Return JSON: {"success": true, "ticket_id": "string"}`
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    console.log("🔧 Maintenance logged:", chunk);
  }
}

// Example 4: Compare Drone Parts Pricing
async function compareDronePricing() {
  const response = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
    method: "POST",
    headers: {
      "X-API-Key": TINYFISH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: "https://drone-parts-supplier.com/batteries",
      goal: `Find all battery options with prices. Return JSON:
      {
        "batteries": [
          {"model": "string", "capacity_mah": 0, "price_usd": 0}
        ]
      }`
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    console.log("💰 Pricing data:", chunk);
  }
}

// Example 5: Integrated Decision Loop
async function webAwareDecisionLoop(robotState) {
  // Step 1: Fetch web data
  const tasks = await fetchWarehouseTasks();
  const weather = await checkFlightWeather();
  
  // Step 2: Send to Gemini AI
  const prompt = `You are SkyMind WebOps AI.

Robot State:
${JSON.stringify(robotState, null, 2)}

Web Data:
- Tasks: ${tasks}
- Weather: ${weather}

Decide next action. Return JSON:
{
  "action": "patrol|inspect|return_base",
  "target": {"x":0,"y":0,"z":2},
  "priority_level": "high|medium|low",
  "reasoning": "explanation",
  "confidence": 0.95,
  "requires_web_action": false
}`;

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=YOUR_KEY`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const decision = await geminiResponse.json();
  console.log("🤖 AI Decision:", decision);
  
  // Step 3: If web action needed, execute it
  if (decision.requires_web_action) {
    await logMaintenanceAlert(robotState.id, "Battery low");
  }
  
  return decision;
}

// Test function - Run this to verify TinyFish works
async function testTinyFishIntegration() {
  console.log("🧪 Testing TinyFish Integration...");
  
  try {
    console.log("\n1️⃣ Testing weather check...");
    await checkFlightWeather();
    
    console.log("\n2️⃣ Testing warehouse tasks...");
    await fetchWarehouseTasks();
    
    console.log("\n3️⃣ Testing maintenance logging...");
    await logMaintenanceAlert("drone_1", "Battery degradation detected");
    
    console.log("\n✅ All TinyFish tests passed!");
  } catch (error) {
    console.error("❌ TinyFish test failed:", error);
  }
}

// Uncomment to test:
// testTinyFishIntegration();
