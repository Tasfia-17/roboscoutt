// API Configuration
// For production: Set these via environment variables or backend proxy

const API_CONFIG = {
  // TinyFish API Key - Get from https://tinyfish.ai
  TINYFISH_API_KEY: window.ENV?.TINYFISH_API_KEY || "YOUR_TINYFISH_KEY",
  
  // Gemini API Keys - Get from https://aistudio.google.com/apikey
  GEMINI_API_KEYS: window.ENV?.GEMINI_KEYS || [
    "YOUR_GEMINI_KEY_1",
    "YOUR_GEMINI_KEY_2",
    "YOUR_GEMINI_KEY_3"
  ],
  
  // Backend URL (if using separate backend)
  BACKEND_URL: window.ENV?.BACKEND_URL || "http://localhost:3001"
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}
