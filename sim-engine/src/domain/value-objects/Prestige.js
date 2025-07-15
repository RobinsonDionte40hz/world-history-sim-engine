// src/domain/value-objects/Prestige.js

/**
 * Immutable value object representing a character's prestige across multiple tracks
 * Tracks prestige values with levels, decay mechanics, and historical change tracking
 */
export class Prestige {
  constructor(tracks = [], values = {}, history = {}) {
    // Validate inputs
    if (!Array.isArray(tracks) || tracks.length === 0) {
      throw new Error('Prestige must have at least one track');
    }
    
    // Create immutable copies
    this._tracks = Object.freeze([...tracks]);
    this._tracksMap = Object.freeze(new Map(tracks.map(track => [track.id, track])));
    
    // Initialize values with defaults if not provided
    const initialValues = {};
    const initialHistory = {};
    
    for (const track of tracks) {
      this._validateTrack(track);
      const value = values[track.id] !== undefined ? values[track.id] : track.defaultValue;
      this._validateValue(track, value);
      initialValues[track.id] = value;
      initialHistory[track.id] = Object.freeze([...(history[track.id] || [])]);
    }
    
    this._values = Object.freeze(initialValues);
    this._history = Object.freeze(initialHistory);
    
    // Make the entire object immutable
    Object.freeze(this);
  }
  
  /**
   * Get the current prestige value for a specific track
   */
  getValue(trackId) {
    if (!(trackId in this._values)) {
      throw new Error(`Prestige track '${trackId}' not found`);
    }
    return this._values[trackId];
  }
  
  /**
   * Get the prestige level for a specific track based on current value
   */
  getLevel(trackId) {
    const track = this._tracksMap.get(trackId);
    if (!track) {
      throw new Error(`Prestige track '${trackId}' not found`);
    }
    
    const value = this.getValue(trackId);
    return track.levels.find(level => value >= level.min && value <= level.max) || null;
  }
  
  /**
   * Create a new Prestige instance with a changed value for the specified track
   * This is the primary way to "modify" the immutable prestige
   */
  withChange(trackId, amount, reason, socialContext = null) {
    const track = this._tracksMap.get(trackId);
    if (!track) {
      throw new Error(`Prestige track '${trackId}' not found`);
    }
    
    const currentValue = this.getValue(trackId);
    let newValue = currentValue + amount;
    
    // Clamp to track bounds
    newValue = Math.max(track.min, Math.min(track.max, newValue));
    
    // Create new values object
    const newValues = { ...this._values };
    newValues[trackId] = newValue;
    
    // Deep copy social context to ensure immutability
    const contextCopy = socialContext ? this._deepCopyContext(socialContext) : null;
    
    // Create change record
    const change = Object.freeze({
      timestamp: new Date(),
      change: amount,
      newValue,
      reason,
      socialContext: contextCopy
    });
    
    // Create new history object with frozen arrays
    const newHistory = {};
    for (const [key, value] of Object.entries(this._history)) {
      newHistory[key] = key === trackId 
        ? Object.freeze([...value, change])
        : Object.freeze([...value]);
    }
    
    return new Prestige(this._tracks, newValues, newHistory);
  }
  
  /**
   * Create a new Prestige instance with decay applied to specified tracks
   * Decay rates are provided as a Map<trackId, decayAmount>
   */
  withDecay(decayRates) {
    if (!(decayRates instanceof Map)) {
      throw new Error('Decay rates must be provided as a Map');
    }
    
    let newValues = { ...this._values };
    let newHistory = {};
    
    // Initialize history with existing data
    for (const [key, value] of Object.entries(this._history)) {
      newHistory[key] = Object.freeze([...value]);
    }
    
    // Apply decay to each specified track
    for (const [trackId, decayAmount] of decayRates) {
      const track = this._tracksMap.get(trackId);
      if (!track) {
        continue; // Skip unknown tracks
      }
      
      if (typeof decayAmount !== 'number' || decayAmount < 0) {
        throw new Error(`Decay amount for track '${trackId}' must be a non-negative number`);
      }
      
      const currentValue = newValues[trackId];
      let newValue = currentValue - decayAmount;
      
      // Clamp to track bounds (decay can't go below minimum)
      newValue = Math.max(track.min, Math.min(track.max, newValue));
      
      // Only record change if there was actual decay
      if (newValue !== currentValue) {
        newValues[trackId] = newValue;
        
        // Create decay record
        const change = Object.freeze({
          timestamp: new Date(),
          change: -(currentValue - newValue), // Negative change for decay
          newValue,
          reason: 'Time decay',
          socialContext: null
        });
        
        newHistory[trackId] = Object.freeze([...newHistory[trackId], change]);
      }
    }
    
    return new Prestige(this._tracks, newValues, newHistory);
  }
  
  /**
   * Get all tracks definitions
   */
  get tracks() {
    return this._tracks;
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
   * Get the history for a specific track
   */
  getTrackHistory(trackId) {
    return Object.freeze([...(this._history[trackId] || [])]);
  }
  
  /**
   * Get the most recent change for a specific track
   */
  getLastChange(trackId) {
    const trackHistory = this.getTrackHistory(trackId);
    return trackHistory.length > 0 ? trackHistory[trackHistory.length - 1] : null;
  }
  
  /**
   * Get all track IDs
   */
  getTrackIds() {
    return this._tracks.map(track => track.id);
  }
  
  /**
   * Check if a track exists
   */
  hasTrack(trackId) {
    return this._tracksMap.has(trackId);
  }
  
  /**
   * Get track definition by ID
   */
  getTrack(trackId) {
    return this._tracksMap.get(trackId) || null;
  }
  
  /**
   * Create a summary of current prestige state
   */
  getSummary() {
    const summary = {};
    for (const trackId of this.getTrackIds()) {
      summary[trackId] = {
        value: this.getValue(trackId),
        level: this.getLevel(trackId),
        lastChange: this.getLastChange(trackId)
      };
    }
    return summary;
  }
  
  /**
   * Get total prestige across all tracks (weighted by category importance)
   */
  getTotalPrestige() {
    let total = 0;
    for (const trackId of this.getTrackIds()) {
      const track = this.getTrack(trackId);
      const value = this.getValue(trackId);
      // Apply category weight if available, otherwise use 1.0
      const weight = track.categoryWeight || 1.0;
      total += value * weight;
    }
    return total;
  }
  
  /**
   * Serialize to JSON with Map handling
   */
  toJSON() {
    const historyForSerialization = {};
    
    // Handle Map serialization in history
    for (const [trackId, changes] of Object.entries(this._history)) {
      historyForSerialization[trackId] = changes.map(change => ({
        ...change,
        socialContext: change.socialContext ? this._serializeContext(change.socialContext) : null
      }));
    }
    
    return {
      tracks: [...this._tracks],
      values: { ...this._values },
      history: historyForSerialization
    };
  }
  
  /**
   * Deserialize from JSON with Map handling
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for Prestige');
    }
    
    const historyFromSerialization = {};
    
    // Handle Map deserialization in history
    if (data.history) {
      for (const [trackId, changes] of Object.entries(data.history)) {
        historyFromSerialization[trackId] = changes.map(change => ({
          ...change,
          timestamp: new Date(change.timestamp),
          socialContext: change.socialContext ? this._deserializeContext(change.socialContext) : null
        }));
      }
    }
    
    return new Prestige(data.tracks || [], data.values || {}, historyFromSerialization);
  }
  
  /**
   * Create a Prestige from the old PrestigeManager format
   */
  static fromPrestigeManager(manager) {
    if (!manager) {
      throw new Error('PrestigeManager is required');
    }
    
    return new Prestige(
      manager.tracks || [],
      manager.playerPrestige || {},
      manager.history || {}
    );
  }
  
  /**
   * Equality comparison
   */
  equals(other) {
    if (!(other instanceof Prestige)) return false;
    
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }
  
  /**
   * String representation
   */
  toString() {
    const summary = this.getSummary();
    const entries = Object.entries(summary).map(([trackId, data]) => {
      const levelName = data.level ? data.level.name : 'Unknown';
      return `${trackId}: ${data.value} (${levelName})`;
    });
    return `Prestige { ${entries.join(', ')} }`;
  }
  
  /**
   * Private validation methods
   */
  _validateTrack(track) {
    if (!track || typeof track !== 'object') {
      throw new Error('Track must be an object');
    }
    
    if (!track.id || typeof track.id !== 'string') {
      throw new Error('Track must have a valid id');
    }
    
    if (!track.name || typeof track.name !== 'string') {
      throw new Error('Track must have a valid name');
    }
    
    if (typeof track.min !== 'number' || typeof track.max !== 'number') {
      throw new Error('Track must have numeric min and max values');
    }
    
    if (track.min >= track.max) {
      throw new Error('Track min value must be less than max value');
    }
    
    if (typeof track.defaultValue !== 'number') {
      throw new Error('Track must have a numeric default value');
    }
    
    if (track.defaultValue < track.min || track.defaultValue > track.max) {
      throw new Error('Track default value must be within min/max range');
    }
    
    if (typeof track.decayRate !== 'number' || track.decayRate < 0) {
      throw new Error('Track must have a non-negative numeric decay rate');
    }
    
    if (!Array.isArray(track.levels) || track.levels.length === 0) {
      throw new Error('Track must have at least one level');
    }
    
    // Validate levels
    for (const level of track.levels) {
      if (!level.name || typeof level.name !== 'string') {
        throw new Error('Level must have a valid name');
      }
      
      if (typeof level.min !== 'number' || typeof level.max !== 'number') {
        throw new Error('Level must have numeric min and max values');
      }
      
      if (level.min >= level.max) {
        throw new Error('Level min value must be less than max value');
      }
      
      if (typeof level.politicalPower !== 'number') {
        throw new Error('Level must have a numeric political power value');
      }
    }
  }
  
  _validateValue(track, value) {
    if (typeof value !== 'number') {
      throw new Error(`Value for track '${track.id}' must be a number`);
    }
    
    if (value < track.min || value > track.max) {
      throw new Error(`Value for track '${track.id}' must be between ${track.min} and ${track.max}`);
    }
  }
  
  /**
   * Deep copy social context to ensure immutability
   */
  _deepCopyContext(context) {
    if (!context || typeof context !== 'object') {
      return context;
    }
    
    const copy = { ...context };
    
    // Handle Map objects specially
    if (context.witnessData instanceof Map) {
      copy.witnessData = new Map(context.witnessData);
    }
    
    if (context.socialConnections instanceof Map) {
      copy.socialConnections = new Map(context.socialConnections);
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
    
    // Convert Maps to arrays for JSON serialization
    if (context.witnessData instanceof Map) {
      serialized.witnessData = Array.from(context.witnessData.entries());
      serialized._witnessDataSerialized = true;
    }
    
    if (context.socialConnections instanceof Map) {
      serialized.socialConnections = Array.from(context.socialConnections.entries());
      serialized._socialConnectionsSerialized = true;
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
    
    // Convert arrays back to Maps if they were serialized
    if (context._witnessDataSerialized && Array.isArray(context.witnessData)) {
      deserialized.witnessData = new Map(context.witnessData);
      delete deserialized._witnessDataSerialized;
    }
    
    if (context._socialConnectionsSerialized && Array.isArray(context.socialConnections)) {
      deserialized.socialConnections = new Map(context.socialConnections);
      delete deserialized._socialConnectionsSerialized;
    }
    
    return Object.freeze(deserialized);
  }
}