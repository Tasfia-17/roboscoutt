# Vercel Deployment

## Quick Deploy

1. Go to https://vercel.com/new
2. Import: `https://github.com/Tasfia-17/robo-scout.git`
3. Click "Deploy"

No configuration needed - `vercel.json` handles everything.

## What Gets Deployed

- 3D MuJoCo simulation
- All robot models
- TinyFish integration
- Gemini AI decision loop

## Verify Deployment

After deployment:
1. Open your Vercel URL
2. Press F12 (console)
3. Look for: "RoboScout initialized"
4. AI decisions appear every 2 seconds

## Backend (Optional)

Frontend works standalone. For production backend, deploy `backend/web-agent-server.js` to Railway, Render, or Vultr.
