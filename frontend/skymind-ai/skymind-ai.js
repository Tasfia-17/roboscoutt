// SkyMind AI Integration Module
// Add this to your main.js

class SkyMindAI {
  constructor(backendURL) {
    this.backendURL = backendURL;
    this.droneId = 'drone_1';
    this.lastDecision = null;
    this.telemetryInterval = null;
    this.aiEnabled = true;
  }

  async sendTelemetry(position, battery, status = 'active') {
    if (!this.aiEnabled) return;
    
    try {
      await fetch(`${this.backendURL}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drone_id: this.droneId,
          position: { x: position[0], y: position[1], z: position[2] },
          battery: battery,
          status: status
        })
      });
    } catch (error) {
      console.warn('Telemetry failed:', error.message);
    }
  }

  async getAIDecision(position, battery, velocity, obstacles = []) {
    if (!this.aiEnabled) {
      return { action: 'manual', target: { x: 0, y: 0, z: 2 }, reasoning: 'AI disabled' };
    }

    try {
      const response = await fetch(`${this.backendURL}/mission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drone_id: this.droneId,
          position: { x: position[0], y: position[1], z: position[2] },
          battery: battery,
          velocity: { x: velocity[0], y: velocity[1], z: velocity[2] },
          obstacles: obstacles
        })
      });

      this.lastDecision = await response.json();
      return this.lastDecision;
    } catch (error) {
      console.warn('AI decision failed:', error.message);
      return { 
        action: 'hover', 
        target: { x: position[0], y: position[1], z: position[2] + 0.5 },
        reasoning: 'Fallback mode - backend unavailable'
      };
    }
  }

  async getStats() {
    try {
      const response = await fetch(`${this.backendURL}/stats`);
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  startTelemetryStream(getDroneState, intervalMs = 1000) {
    this.telemetryInterval = setInterval(async () => {
      const state = getDroneState();
      await this.sendTelemetry(state.position, state.battery, state.status);
    }, intervalMs);
  }

  stopTelemetryStream() {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
  }

  toggleAI() {
    this.aiEnabled = !this.aiEnabled;
    return this.aiEnabled;
  }
}

// Export for use in main.js
export { SkyMindAI };
