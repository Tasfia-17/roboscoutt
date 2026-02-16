# Vercel Deployment Guide

## Quick Deploy (3 Steps)

### Option 1: Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/new
2. **Import Repository**: 
   - Click "Import Git Repository"
   - Paste: `https://github.com/Tasfia-17/Sky-mind`
   - Click "Import"
3. **Deploy**:
   - Click "Deploy" (no configuration needed)
   - Wait 2-3 minutes
   - Your site is live!

**Result**: `https://sky-mind-XXXXX.vercel.app/`

---

### Option 2: Vercel CLI

```bash
cd SkyMind
npm install -g vercel
vercel login
vercel --prod
```

---

## What Gets Deployed

The `vercel.json` configuration automatically deploys:

- **Frontend**: `mujoco_wasm/` folder
  - 3D simulation (MuJoCo WASM)
  - All robot models and scenes
  - TinyFish integration (`web-agent-integration.js`)
  - AI decision loop (`main.js`)
  - Entry point (`index.html`)

---

## Backend Deployment (Optional)

The frontend works standalone with TinyFish API calls from the browser.

For production backend (`backend/web-agent-server.js`):

### Option A: Vercel Serverless Functions

1. Create `/api` folder in root
2. Move backend logic to `/api/mission.js`
3. Vercel auto-deploys as serverless functions

### Option B: Separate Backend Service

Deploy to:
- **Vultr** (recommended for hackathon)
- **Railway** (easy Node.js hosting)
- **Render** (free tier available)

Then update frontend to point to backend URL.

---

## Auto-Deploy Setup

1. Connect GitHub repo to Vercel (Option 1 above)
2. Enable auto-deploy in Vercel settings
3. Every `git push` automatically deploys!

---

## Verify Deployment

After deployment:

1. Open your Vercel URL
2. Press **F12** (open console)
3. Look for:
   ```
   SkyMind WebOps Agent initialized
   TinyFish integration: ACTIVE
   ```
4. Wait 2 seconds for AI decisions to appear

---

## Troubleshooting

**Issue**: "Cross-Origin" errors
**Fix**: Already handled by `vercel.json` headers

**Issue**: WASM not loading
**Fix**: Vercel automatically serves WASM with correct MIME types

**Issue**: TinyFish API calls failing
**Fix**: Check API key in `web-agent-integration.js`

---

## Current Configuration

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/mujoco_wasm/$1" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}
```

This configuration:
- Serves `mujoco_wasm/` as root
- Sets required CORS headers for WASM
- Enables SharedArrayBuffer for MuJoCo

---

## Production Checklist

- [ ] Deploy frontend to Vercel
- [ ] Test 3D simulation loads
- [ ] Verify TinyFish integration in console
- [ ] Check AI decisions appear every 2 seconds
- [ ] (Optional) Deploy backend separately
- [ ] Update README with new Vercel URL
- [ ] Submit to hackathon with live demo link

---

**Your project is ready to deploy!**
