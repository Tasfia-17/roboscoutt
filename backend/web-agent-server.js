import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY || "YOUR_TINYFISH_KEY";
const SAMBANOVA_API_KEY = process.env.SAMBANOVA_API_KEY || "YOUR_SAMBANOVA_KEY";

const GEMINI_KEYS = [
  process.env.GEMINI_KEY_1 || "YOUR_GEMINI_KEY_1",
  process.env.GEMINI_KEY_2 || "YOUR_GEMINI_KEY_2",
  process.env.GEMINI_KEY_3 || "YOUR_GEMINI_KEY_3"
];
let keyIndex = 0;

// Web automation via TinyFish
app.post('/web-scrape', async (req, res) => {
  const { url, goal } = req.body;
  
  try {
    const response = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
      method: "POST",
      headers: {
        "X-API-Key": TINYFISH_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, goal }),
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
          const data = JSON.parse(line.slice(6));
          if (data.type === 'result') {
            result = data.data;
          }
        }
      }
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// AI decision with web context
app.post('/mission-web', async (req, res) => {
  const { position, battery, velocity, web_data } = req.body;
  const key = GEMINI_KEYS[keyIndex];
  keyIndex = (keyIndex + 1) % GEMINI_KEYS.length;
  
  try {
    const prompt = `You are SkyMind WebOps, an autonomous fleet operations AI.

Robot State:
- Position: (${position?.x || 0}, ${position?.y || 0}, ${position?.z || 0})
- Battery: ${battery || 100}%
- Velocity: (${velocity?.x || 0}, ${velocity?.y || 0}, ${velocity?.z || 0})

Web Dashboard Data:
${JSON.stringify(web_data || {}, null, 2)}

Decision priorities:
1. Safety (battery < 20% = return to base)
2. Mission completion
3. Energy efficiency

Respond JSON only:
{
  "action": "patrol|inspect|return_base|hover",
  "target": {"x":2,"y":1,"z":2.5},
  "priority_level": "high|medium|low",
  "reasoning": "brief operational explanation",
  "confidence": 0.95,
  "requires_web_action": false,
  "web_action_type": null
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    const text = data.candidates[0].content.parts[0].text;
    const decision = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    
    console.log(`✓ Web-Aware AI Decision (Key ${keyIndex}/${GEMINI_KEYS.length}):`, decision.action);
    res.json(decision);
    
  } catch (error) {
    res.json({ 
      action: 'hover', 
      target: { x: 0, y: 0, z: 2 }, 
      priority_level: 'low',
      reasoning: 'Fallback mode: ' + error.message,
      confidence: 0.5,
      requires_web_action: false
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'SkyMind WebOps Agent',
    tinyfish: 'enabled',
    gemini_keys: GEMINI_KEYS.length 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🌐 SkyMind WebOps Agent running on port ${PORT}`);
  console.log(`🤖 TinyFish integration: ACTIVE`);
  console.log(`📡 Gemini keys: ${GEMINI_KEYS.length}`);
});
