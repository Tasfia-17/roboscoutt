# 🚨 URGENT: GET NEW API KEYS

## Your current keys are LEAKED and DISABLED

Google has disabled your keys because they were committed to GitHub.

## Step 1: Get NEW Gemini API Keys

1. Go to: https://aistudio.google.com/apikey
2. **DELETE** all old keys (the leaked ones)
3. Click "Create API Key" 
4. Copy the new key
5. Repeat 2 more times (you need 3 total NEW keys)

## Step 2: Add to Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click your "roboscout" project  
3. Settings → Environment Variables
4. Add these variables with your NEW keys:

```
GEMINI_KEY_1 = your_new_key_1_here
GEMINI_KEY_2 = your_new_key_2_here
GEMINI_KEY_3 = your_new_key_3_here
TINYFISH_API_KEY = sk-tinyfish-GNc7SJkKci7lviX152z59peTF8zC3-WO
SAMBANOVA_API_KEY = e5dff711-1df4-4d1f-adec-62c52de77ab3
```

5. Check all boxes: Production, Preview, Development

## Step 3: Redeploy

Go to Deployments → Click "..." → Redeploy

## Why This Happened

Every time you commit API keys to GitHub:
1. GitHub scans for secrets
2. Reports them to Google
3. Google disables them immediately

## Solution

NEVER put real keys in code again. Always use Vercel Environment Variables.

The code is now updated to ONLY use environment variables.
