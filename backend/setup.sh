#!/bin/bash

# SkyMind AI - Quick Setup Script for Vultr
# Run this on your Vultr VM after SSH

set -e

echo "🚁 SkyMind AI - Vultr Setup Script"
echo "=================================="
echo ""

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git

# Verify installation
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Create directory
echo "📁 Creating application directory..."
mkdir -p /var/www/skymind-backend
cd /var/www/skymind-backend

# Prompt for Gemini API key
echo ""
echo "🔑 Please enter your Gemini API key:"
echo "   (Get it from: https://aistudio.google.com/app/apikey)"
read -p "API Key: " GEMINI_KEY

# Create .env file
echo "📝 Creating environment configuration..."
cat > .env << EOF
GEMINI_API_KEY=$GEMINI_KEY
PORT=3000
NODE_ENV=production
EOF

# Create package.json
echo "📝 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "skymind-backend",
  "version": "1.0.0",
  "type": "module",
  "description": "SkyMind AI Fleet Orchestrator - Vultr Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@google/generative-ai": "^0.21.0",
    "better-sqlite3": "^11.0.0"
  }
}
EOF

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install PM2
echo "📦 Installing PM2 process manager..."
npm install -g pm2

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 22
ufw allow 3000
ufw --force enable

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your server.js file to /var/www/skymind-backend/"
echo "2. Start the server with: pm2 start server.js --name skymind"
echo "3. Save PM2 config: pm2 startup && pm2 save"
echo ""
echo "🌐 Your backend will be available at:"
echo "   http://$SERVER_IP:3000"
echo ""
echo "🧪 Test with:"
echo "   curl http://$SERVER_IP:3000/health"
echo ""
