// src/domain/entities/PrestigeManager.js

export class PrestigeManager {
  constructor(prestigeTracks = []) {
    this.tracks = prestigeTracks;
    this.playerPrestige = {};
    this.history = {};
    for (const track of prestigeTracks) {
      this.playerPrestige[track.id] = 0;
      this.history[track.id] = [];
    }
    Object.freeze(this);
  }
  // ... methods: getPrestige, getPrestigeLevel, changePrestige, applyDecay, applyInteractionEffects, getPlayerStateWithPrestige
  toJSON() { /* as before */ }
  static fromJSON(data) { /* as before */ }
}