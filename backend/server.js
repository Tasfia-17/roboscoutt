import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Database from 'better-sqlite3';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Initialize SQLite
const db = new Database('skymind.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    drone_id TEXT,
    position_x REAL,
    position_y REAL,
    position_z REAL,
    battery REAL,
    status TEXT
  );
  
  CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    drone_id TEXT,
    action TEXT,
    target_x REAL,
    target_y REAL,
    target_z REAL,
    reasoning TEXT
  );
`);

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SkyMind AI Backend' });
});

// Receive telemetry
app.post('/telemetry', (req, res) => {
  const { drone_id, position, battery, status } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO telemetry (drone_id, position_x, position_y, position_z, battery, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    drone_id || 'drone_1',
    position?.x || 0,
    position?.y || 0,
    position?.z || 0,
    battery || 100,
    status || 'active'
  );
  
  res.json({ success: true });
});

// Get AI decision
app.post('/mission', async (req, res) => {
  try {
    const { drone_id, position, battery, velocity, obstacles } = req.body;
    
    const prompt = `You are an AI controlling an autonomous warehouse inspection drone.

Current State:
- Position: (${position?.x || 0}, ${position?.y || 0}, ${position?.z || 0})
- Battery: ${battery || 100}%
- Velocity: (${velocity?.x || 0}, ${velocity?.y || 0}, ${velocity?.z || 0})
- Obstacles nearby: ${obstacles?.length || 0}

Mission: Patrol warehouse, inspect shelves, avoid obstacles, return to base if battery < 20%.

Respond with JSON only:
{
  "action": "patrol|inspect|return_base|hover",
  "target": {"x": 0, "y": 0, "z": 2},
  "reasoning": "brief explanation"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const decision = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      action: 'hover',
      target: { x: 0, y: 0, z: 2 },
      reasoning: 'Default hover mode'
    };
    
    // Log mission
    const stmt = db.prepare(`
      INSERT INTO missions (drone_id, action, target_x, target_y, target_z, reasoning)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      drone_id || 'drone_1',
      decision.action,
      decision.target.x,
      decision.target.y,
      decision.target.z,
      decision.reasoning
    );
    
    res.json(decision);
  } catch (error) {
    console.error('AI Error:', error);
    res.json({
      action: 'hover',
      target: { x: 0, y: 0, z: 2 },
      reasoning: 'Fallback mode - AI unavailable'
    });
  }
});

// Get mission history
app.get('/history', (req, res) => {
  const missions = db.prepare('SELECT * FROM missions ORDER BY timestamp DESC LIMIT 50').all();
  const telemetry = db.prepare('SELECT * FROM telemetry ORDER BY timestamp DESC LIMIT 100').all();
  
  res.json({ missions, telemetry });
});

// Get dashboard stats
app.get('/stats', (req, res) => {
  const totalMissions = db.prepare('SELECT COUNT(*) as count FROM missions').get();
  const recentTelemetry = db.prepare(`
    SELECT drone_id, position_x, position_y, position_z, battery, status, timestamp
    FROM telemetry 
    ORDER BY timestamp DESC 
    LIMIT 1
  `).get();
  
  res.json({
    total_missions: totalMissions.count,
    current_drone: recentTelemetry || {},
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`🚁 SkyMind AI Backend running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/stats`);
});
