# API Key Security Guide

## URGENT: API Keys Removed

All hardcoded API keys have been removed from the codebase for security.

## Setup Your Keys

### 1. Backend (Node.js)

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your keys:

```env
TINYFISH_API_KEY=your_actual_tinyfish_key
SAMBANOVA_API_KEY=your_actual_sambanova_key
GEMINI_KEY_1=your_actual_gemini_key_1
GEMINI_KEY_2=your_actual_gemini_key_2
GEMINI_KEY_3=your_actual_gemini_key_3
```

### 2. Frontend (Browser)

**Option A: Use Backend Proxy (Recommended)**
- Frontend calls your backend
- Backend makes API calls with keys
- Keys never exposed to browser

**Option B: Direct API Calls (Demo Only)**

Edit `mujoco_wasm/examples/main.js`:
```javascript
const GEMINI_API_KEYS = [
  "your_key_1",
  "your_key_2",
  "your_key_3"
];
```

Edit `mujoco_wasm/examples/web-agent-integration.js`:
```javascript
const TINYFISH_API_KEY = "your_tinyfish_key";
```

**⚠️ WARNING**: Never commit these files after adding real keys!

## Vercel Deployment

Add environment variables in Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `TINYFISH_API_KEY`
   - `GEMINI_KEY_1`
   - `GEMINI_KEY_2`
   - `GEMINI_KEY_3`

## Get New API Keys

If your keys were exposed:

### TinyFish
1. Go to https://tinyfish.ai
2. Revoke old key
3. Generate new key

### Google Gemini
1. Go to https://aistudio.google.com/apikey
2. Delete compromised keys
3. Create new keys

### SambaNova
1. Go to your SambaNova dashboard
2. Revoke old key
3. Generate new key

## Security Best Practices

1. **Never commit API keys** to Git
2. **Use environment variables** for all secrets
3. **Use backend proxy** for production
4. **Rotate keys regularly**
5. **Monitor API usage** for suspicious activity
6. **Set usage limits** on API keys

## Files That Should NOT Contain Keys

- ❌ `mujoco_wasm/examples/main.js`
- ❌ `mujoco_wasm/examples/web-agent-integration.js`
- ❌ `mujoco_wasm/examples/tinyfish-examples.js`
- ❌ `backend/web-agent-server.js`
- ❌ `backend/server-multi-key.js`
- ❌ Any `.md` documentation files

## Files That CAN Contain Keys (Gitignored)

- ✅ `.env` (never committed)
- ✅ `config.local.js` (never committed)

## Check Before Committing

```bash
# Search for potential API keys
git diff | grep -E "(AIza|sk-tinyfish|e5dff711)"

# If found, DO NOT commit!
```

## Emergency: Keys Already Leaked

1. **Immediately revoke** all exposed keys
2. **Generate new keys** from provider dashboards
3. **Update** `.env` with new keys
4. **Verify** no keys in Git history:
   ```bash
   git log -p | grep -E "(AIza|sk-tinyfish)"
   ```
5. If found in history, consider using `git filter-branch` or BFG Repo-Cleaner

## Current Status

✅ All API keys removed from code
✅ Environment variable templates created
✅ .gitignore configured
✅ Security guide documented

⚠️ **Action Required**: Add your keys to `.env` file locally
