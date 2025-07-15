// src/domain/entities/HistoricalEvent.js

/**
 * Entity representing a historical event in the world simulation
 * Events can affect characters, settlements, and world state
 */
export class HistoricalEvent {
  constructor(config = {}) {
    this.id = config.id || crypto.randomUUID();
    this.type = config.type || 'generic';
    this.name = config.name || 'Unnamed Event';
    this.description = config.description || '';
    this.timestamp = config.timestamp || new Date();
    this.location = config.location || null;
    this.participants = config.participants || [];
    this.prerequisites = config.prerequisites || [];
    this.effects = config.effects || [];
    this.worldStateRequirements = config.worldStateRequirements || [];
    this.culturalContext = config.culturalContext || {};
    this.politicalContext = config.politicalContext || {};
    this.economicContext = config.economicContext || {};
    this.severity = config.severity || 'minor'; // minor, moderate, major, critical
    this.scope = config.scope || 'local'; // local, regional, global
    this.duration = config.duration || 0; // Duration in simulation time units
    this.isActive = config.isActive !== undefined ? config.isActive : true;
    this.metadata = config.metadata || {};
    
    Object.freeze(this);
  }

  /**
   * Check if this event can occur given the current world state
   */
  canOccur(worldState) {
    // Basic validation - can be extended
    if (!worldState) return false;
    
    // Check if event is still active
    if (!this.isActive) return false;
    
    // Check world state requirements
    for (const requirement of this.worldStateRequirements) {
      if (!this._checkWorldStateRequirement(requirement, worldState)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get all characters that should be affected by this event
   */
  getAffectedCharacters() {
    return [...this.participants];
  }

  /**
   * Get the historical context for this event
   */
  getHistoricalContext() {
    return {
      era: this.metadata.era || 'Unknown',
      year: this.timestamp.getFullYear(),
      season: this.metadata.season || 'Unknown',
      culturalValues: new Map(Object.entries(this.culturalContext)),
      politicalClimate: this.politicalContext.climate || 'stable',
      economicConditions: this.economicContext.conditions || 'stable'
    };
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      timestamp: this.timestamp.toISOString(),
      location: this.location,
      participants: [...this.participants],
      prerequisites: [...this.prerequisites],
      effects: [...this.effects],
      worldStateRequirements: [...this.worldStateRequirements],
      culturalContext: { ...this.culturalContext },
      politicalContext: { ...this.politicalContext },
      economicContext: { ...this.economicContext },
      severity: this.severity,
      scope: this.scope,
      duration: this.duration,
      isActive: this.isActive,
      metadata: { ...this.metadata }
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for HistoricalEvent');
    }

    return new HistoricalEvent({
      ...data,
      timestamp: new Date(data.timestamp)
    });
  }

  /**
   * Private helper to check world state requirements
   */
  _checkWorldStateRequirement(requirement, worldState) {
    switch (requirement.type) {
      case 'population':
        return this._checkPopulationRequirement(requirement, worldState);
      case 'settlement_type':
        return this._checkSettlementTypeRequirement(requirement, worldState);
      case 'global_condition':
        return this._checkGlobalConditionRequirement(requirement, worldState);
      case 'time':
        return this._checkTimeRequirement(requirement, worldState);
      default:
        return true; // Unknown requirements pass by default
    }
  }

  _checkPopulationRequirement(requirement, worldState) {
    const totalPopulation = worldState.settlements.reduce((sum, settlement) => sum + settlement.population, 0);
    return totalPopulation >= (requirement.minPopulation || 0);
  }

  _checkSettlementTypeRequirement(requirement, worldState) {
    const requiredTypes = requirement.settlementTypes || [];
    return requiredTypes.every(type => 
      worldState.settlements.some(settlement => settlement.type === type)
    );
  }

  _checkGlobalConditionRequirement(requirement, worldState) {
    const conditionValue = worldState.globalConditions.get(requirement.condition) || 0;
    return conditionValue >= (requirement.minValue || 0);
  }

  _checkTimeRequirement(requirement, worldState) {
    const currentTime = worldState.currentTime || new Date();
    if (requirement.minTime && currentTime < new Date(requirement.minTime)) {
      return false;
    }
    if (requirement.maxTime && currentTime > new Date(requirement.maxTime)) {
      return false;
    }
    return true;
  }
}

export default HistoricalEvent;