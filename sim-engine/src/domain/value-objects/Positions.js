// src/domain/entities/Position.js

class Position {
  constructor(config = {}) {
    // 2D coordinates (reused from old project's spatial relationships concept)
    this.x = config.x || 0;
    this.y = config.y || 0;
    // Optional node reference (ties to Node.js, from old Node Types)
    this.nodeId = config.nodeId || null;
    // Optional z for future 3D (default 0, per README's 3D mapping hint)
    this.z = config.z || 0;

    // Freeze to enforce immutability (value object principle)
    Object.freeze(this);
  }

  // Calculate Euclidean distance to another position (for proximity-based decisions)
  distanceTo(otherPosition) {
    if (this.nodeId && otherPosition.nodeId && this.nodeId === otherPosition.nodeId) return 0;  // Same node
    if (!otherPosition || (!this.x && !this.y) || (!otherPosition.x && !otherPosition.y)) return Infinity;
    const dx = this.x - otherPosition.x;
    const dy = this.y - otherPosition.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Check if positions are in the same node (for interaction eligibility)
  isSameNode(otherPosition) {
    return this.nodeId && otherPosition.nodeId && this.nodeId === otherPosition.nodeId;
  }

  // Quantum-inspired method: Distance factor for resonance (lower distance = higher resonance)
  getDistanceFactor(otherPosition) {
    const dist = this.distanceTo(otherPosition);
    return dist === 0 ? 1 : 1 / (1 + dist);  // Inverse distance weighting (1 at 0, decays with distance)
  }

  // Serialize for persistence (match old JSON format)
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      nodeId: this.nodeId,
    };
  }
}

export default Position;