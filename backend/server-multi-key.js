import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Multiple Gemini API Keys (rotates to avoid rate limits)
const GEMINI_KEYS = [
  process.env.GEMINI_KEY_1 || "YOUR_KEY_1",
  process.env.GEMINI_KEY_2 || "YOUR_KEY_2",
  process.env.GEMINI_KEY_3 || "YOUR_KEY_3"
];
let keyIndex = 0;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'RoboScout', keys: GEMINI_KEYS.length });
});

app.post('/mission', async (req, res) => {
  const { position, battery, velocity } = req.body;
  const key = GEMINI_KEYS[keyIndex];
  keyIndex = (keyIndex + 1) % GEMINI_KEYS.length;
  
  try {
    const prompt = `Warehouse drone control.
Position: (${position?.x || 0}, ${position?.y || 0}, ${position?.z || 0})
Battery: ${battery || 100}%
Velocity: (${velocity?.x || 0}, ${velocity?.y || 0}, ${velocity?.z || 0})

Mission: Patrol warehouse, inspect shelves, return to base if battery < 20%.
Respond JSON only: {"action":"patrol","target":{"x":2,"y":1,"z":2.5},"reasoning":"brief explanation"}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return res.json({ 
        action: 'hover', 
        target: { x: 0, y: 0, z: 2 }, 
        reasoning: 'API error: ' + data.error.message 
      });
    }

    const text = data.candidates[0].content.parts[0].text;
    const decision = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    
    console.log(`✓ AI Decision (Key ${keyIndex}/${GEMINI_KEYS.length}):`, decision.action);
    res.json(decision);
    
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ 
      action: 'hover', 
      target: { x: 0, y: 0, z: 2 }, 
      reasoning: 'Fallback mode' 
    });
  }
});

app.post('/telemetry', (req, res) => {
  console.log('📊 Telemetry:', req.body);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚁 RoboScout Backend running on port ${PORT}`);
  console.log(`📡 Using ${GEMINI_KEYS.length} API keys`);
  console.log(`🔗 Test: curl http://localhost:${PORT}/health`);
});
