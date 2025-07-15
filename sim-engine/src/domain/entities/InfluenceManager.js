// src/domain/entities/InfluenceManager.js

export class InfluenceManager {
  constructor(influenceDomains = []) {
    this.domains = influenceDomains;
    this.playerInfluence = {};
    this.history = {};
    for (const domain of influenceDomains) {
      this.playerInfluence[domain.id] = domain.defaultValue;
      this.history[domain.id] = [];
    }
    Object.freeze(this);
  }
  // ... methods: getInfluence, changeInfluence, getInfluenceTier, applyInteractionEffects, getPlayerStateWithInfluence
  toJSON() { /* as before */ }
  static fromJSON(data) { /* as before */ }
}