// src/domain/value-objects/Influence.js

/**
 * Immutable value object representing a character's influence across multiple domains
 * Tracks influence values with tiers and historical change tracking
 */
export class Influence {
  constructor(domains = [], values = {}, history = {}) {
    // Validate inputs
    if (!Array.isArray(domains) || domains.length === 0) {
      throw new Error('Influence must have at least one domain');
    }
    
    // Create immutable copies
    this._domains = Object.freeze([...domains]);
    this._domainsMap = Object.freeze(new Map(domains.map(domain => [domain.id, domain])));
    
    // Initialize values with defaults if not provided
    const initialValues = {};
    const initialHistory = {};
    
    for (const domain of domains) {
      this._validateDomain(domain);
      const value = values[domain.id] !== undefined ? values[domain.id] : domain.defaultValue;
      this._validateValue(domain, value);
      initialValues[domain.id] = value;
      initialHistory[domain.id] = Object.freeze([...(history[domain.id] || [])]);
    }
    
    this._values = Object.freeze(initialValues);
    this._history = Object.freeze(initialHistory);
    
    // Make the entire object immutable
    Object.freeze(this);
  }
  
  /**
   * Get the current influence value for a specific domain
   */
  getValue(domainId) {
    if (!(domainId in this._values)) {
      throw new Error(`Influence domain '${domainId}' not found`);
    }
    return this._values[domainId];
  }
  
  /**
   * Get the influence tier for a specific domain based on current value
   */
  getTier(domainId) {
    const domain = this._domainsMap.get(domainId);
    if (!domain) {
      throw new Error(`Influence domain '${domainId}' not found`);
    }
    
    const value = this.getValue(domainId);
    return domain.tiers.find(tier => value >= tier.min && value <= tier.max) || null;
  }
  
  /**
   * Create a new Influence instance with a changed value for the specified domain
   * This is the primary way to "modify" the immutable influence
   */
  withChange(domainId, amount, reason, settlementContext = null) {
    const domain = this._domainsMap.get(domainId);
    if (!domain) {
      throw new Error(`Influence domain '${domainId}' not found`);
    }
    
    const currentValue = this.getValue(domainId);
    let newValue = currentValue + amount;
    
    // Clamp to domain bounds
    newValue = Math.max(domain.min, Math.min(domain.max, newValue));
    
    // Create new values object
    const newValues = { ...this._values };
    newValues[domainId] = newValue;
    
    // Deep copy settlement context to ensure immutability
    const contextCopy = settlementContext ? this._deepCopyContext(settlementContext) : null;
    
    // Create change record
    const change = Object.freeze({
      timestamp: new Date(),
      change: amount,
      newValue,
      reason,
      settlementContext: contextCopy
    });
    
    // Create new history object with frozen arrays
    const newHistory = {};
    for (const [key, value] of Object.entries(this._history)) {
      newHistory[key] = key === domainId 
        ? Object.freeze([...value, change])
        : Object.freeze([...value]);
    }
    
    return new Influence(this._domains, newValues, newHistory);
  }
  
  /**
   * Get all domains definitions
   */
  get domains() {
    return this._domains;
  }
  
  /**
   * Get all current values
   */
  get values() {
    return this._values;
  }
  
  /**
   * Get the complete change history
   */
  get history() {
    return this._history;
  }
  
  /**
   * Get the history for a specific domain
   */
  getDomainHistory(domainId) {
    return Object.freeze([...(this._history[domainId] || [])]);
  }
  
  /**
   * Get the most recent change for a specific domain
   */
  getLastChange(domainId) {
    const domainHistory = this.getDomainHistory(domainId);
    return domainHistory.length > 0 ? domainHistory[domainHistory.length - 1] : null;
  }
  
  /**
   * Get all domain IDs
   */
  getDomainIds() {
    return this._domains.map(domain => domain.id);
  }
  
  /**
   * Check if a domain exists
   */
  hasDomain(domainId) {
    return this._domainsMap.has(domainId);
  }
  
  /**
   * Get domain definition by ID
   */
  getDomain(domainId) {
    return this._domainsMap.get(domainId) || null;
  }
  
  /**
   * Create a summary of current influence state
   */
  getSummary() {
    const summary = {};
    for (const domainId of this.getDomainIds()) {
      summary[domainId] = {
        value: this.getValue(domainId),
        tier: this.getTier(domainId),
        lastChange: this.getLastChange(domainId)
      };
    }
    return summary;
  }
  
  /**
   * Serialize to JSON with Map handling
   */
  toJSON() {
    const historyForSerialization = {};
    
    // Handle Map serialization in history
    for (const [domainId, changes] of Object.entries(this._history)) {
      historyForSerialization[domainId] = changes.map(change => ({
        ...change,
        settlementContext: change.settlementContext ? this._serializeContext(change.settlementContext) : null
      }));
    }
    
    return {
      domains: [...this._domains],
      values: { ...this._values },
      history: historyForSerialization
    };
  }
  
  /**
   * Deserialize from JSON with Map handling
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for Influence');
    }
    
    const historyFromSerialization = {};
    
    // Handle Map deserialization in history
    if (data.history) {
      for (const [domainId, changes] of Object.entries(data.history)) {
        historyFromSerialization[domainId] = changes.map(change => ({
          ...change,
          timestamp: new Date(change.timestamp),
          settlementContext: change.settlementContext ? this._deserializeContext(change.settlementContext) : null
        }));
      }
    }
    
    return new Influence(data.domains || [], data.values || {}, historyFromSerialization);
  }
  
  /**
   * Create an Influence from the old InfluenceManager format
   */
  static fromInfluenceManager(manager) {
    if (!manager) {
      throw new Error('InfluenceManager is required');
    }
    
    return new Influence(
      manager.domains || [],
      manager.playerInfluence || {},
      manager.history || {}
    );
  }
  
  /**
   * Equality comparison
   */
  equals(other) {
    if (!(other instanceof Influence)) return false;
    
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }
  
  /**
   * String representation
   */
  toString() {
    const summary = this.getSummary();
    const entries = Object.entries(summary).map(([domainId, data]) => {
      const tierName = data.tier ? data.tier.name : 'Unknown';
      return `${domainId}: ${data.value} (${tierName})`;
    });
    return `Influence { ${entries.join(', ')} }`;
  }
  
  /**
   * Private validation methods
   */
  _validateDomain(domain) {
    if (!domain || typeof domain !== 'object') {
      throw new Error('Domain must be an object');
    }
    
    if (!domain.id || typeof domain.id !== 'string') {
      throw new Error('Domain must have a valid id');
    }
    
    if (!domain.name || typeof domain.name !== 'string') {
      throw new Error('Domain must have a valid name');
    }
    
    if (typeof domain.min !== 'number' || typeof domain.max !== 'number') {
      throw new Error('Domain must have numeric min and max values');
    }
    
    if (domain.min >= domain.max) {
      throw new Error('Domain min value must be less than max value');
    }
    
    if (typeof domain.defaultValue !== 'number') {
      throw new Error('Domain must have a numeric default value');
    }
    
    if (domain.defaultValue < domain.min || domain.defaultValue > domain.max) {
      throw new Error('Domain default value must be within min/max range');
    }
    
    if (!Array.isArray(domain.tiers) || domain.tiers.length === 0) {
      throw new Error('Domain must have at least one tier');
    }
    
    // Validate tiers
    for (const tier of domain.tiers) {
      if (!tier.name || typeof tier.name !== 'string') {
        throw new Error('Tier must have a valid name');
      }
      
      if (typeof tier.min !== 'number' || typeof tier.max !== 'number') {
        throw new Error('Tier must have numeric min and max values');
      }
      
      if (tier.min >= tier.max) {
        throw new Error('Tier min value must be less than max value');
      }
    }
  }
  
  _validateValue(domain, value) {
    if (typeof value !== 'number') {
      throw new Error(`Value for domain '${domain.id}' must be a number`);
    }
    
    if (value < domain.min || value > domain.max) {
      throw new Error(`Value for domain '${domain.id}' must be between ${domain.min} and ${domain.max}`);
    }
  }
  
  /**
   * Deep copy settlement context to ensure immutability
   */
  _deepCopyContext(context) {
    if (!context || typeof context !== 'object') {
      return context;
    }
    
    const copy = { ...context };
    
    // Handle Map objects specially
    if (context.settlementData instanceof Map) {
      copy.settlementData = new Map(context.settlementData);
    }
    
    return Object.freeze(copy);
  }
  
  /**
   * Serialize context with Map handling
   */
  _serializeContext(context) {
    if (!context || typeof context !== 'object') {
      return context;
    }
    
    const serialized = { ...context };
    
    // Convert Map to array for JSON serialization
    if (context.settlementData instanceof Map) {
      serialized.settlementData = Array.from(context.settlementData.entries());
      serialized._isMapSerialized = true;
    }
    
    return serialized;
  }
  
  /**
   * Deserialize context with Map handling
   */
  static _deserializeContext(context) {
    if (!context || typeof context !== 'object') {
      return context;
    }
    
    const deserialized = { ...context };
    
    // Convert array back to Map if it was serialized
    if (context._isMapSerialized && Array.isArray(context.settlementData)) {
      deserialized.settlementData = new Map(context.settlementData);
      delete deserialized._isMapSerialized;
    }
    
    return Object.freeze(deserialized);
  }
}