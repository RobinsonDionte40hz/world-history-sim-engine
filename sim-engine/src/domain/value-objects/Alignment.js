// src/domain/value-objects/Alignment.js

/**
 * Immutable value object representing a character's moral and ethical alignment
 * Tracks alignment values across multiple axes with historical change tracking
 */
export class Alignment {
  constructor(axes = [], values = {}, history = {}) {
    // Validate inputs
    if (!Array.isArray(axes) || axes.length === 0) {
      throw new Error('Alignment must have at least one axis');
    }
    
    // Create immutable copies
    this._axes = Object.freeze([...axes]);
    this._axesMap = Object.freeze(new Map(axes.map(axis => [axis.id, axis])));
    
    // Initialize values with defaults if not provided
    const initialValues = {};
    const initialHistory = {};
    
    for (const axis of axes) {
      this._validateAxis(axis);
      const value = values[axis.id] !== undefined ? values[axis.id] : axis.defaultValue;
      this._validateValue(axis, value);
      initialValues[axis.id] = value;
      initialHistory[axis.id] = Object.freeze([...(history[axis.id] || [])]);
    }
    
    this._values = Object.freeze(initialValues);
    this._history = Object.freeze(initialHistory);
    
    // Make the entire object immutable
    Object.freeze(this);
  }
  
  /**
   * Get the current alignment value for a specific axis
   */
  getValue(axisId) {
    if (!(axisId in this._values)) {
      throw new Error(`Alignment axis '${axisId}' not found`);
    }
    return this._values[axisId];
  }
  
  /**
   * Get the alignment zone for a specific axis based on current value
   */
  getZone(axisId) {
    const axis = this._axesMap.get(axisId);
    if (!axis) {
      throw new Error(`Alignment axis '${axisId}' not found`);
    }
    
    const value = this.getValue(axisId);
    return axis.zones.find(zone => value >= zone.min && value <= zone.max) || null;
  }
  
  /**
   * Create a new Alignment instance with a changed value for the specified axis
   * This is the primary way to "modify" the immutable alignment
   */
  withChange(axisId, amount, reason, historicalContext = null) {
    const axis = this._axesMap.get(axisId);
    if (!axis) {
      throw new Error(`Alignment axis '${axisId}' not found`);
    }
    
    const currentValue = this.getValue(axisId);
    let newValue = currentValue + amount;
    
    // Clamp to axis bounds
    newValue = Math.max(axis.min, Math.min(axis.max, newValue));
    
    // Create new values object
    const newValues = { ...this._values };
    newValues[axisId] = newValue;
    
    // Deep copy historical context to ensure immutability
    const contextCopy = historicalContext ? this._deepCopyContext(historicalContext) : null;
    
    // Create change record
    const change = Object.freeze({
      timestamp: new Date(),
      change: amount,
      newValue,
      reason,
      historicalContext: contextCopy
    });
    
    // Create new history object with frozen arrays
    const newHistory = {};
    for (const [key, value] of Object.entries(this._history)) {
      newHistory[key] = key === axisId 
        ? Object.freeze([...value, change])
        : Object.freeze([...value]);
    }
    
    return new Alignment(this._axes, newValues, newHistory);
  }
  
  /**
   * Get all axes definitions
   */
  get axes() {
    return this._axes;
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
   * Get the history for a specific axis
   */
  getAxisHistory(axisId) {
    return Object.freeze([...(this._history[axisId] || [])]);
  }
  
  /**
   * Get the most recent change for a specific axis
   */
  getLastChange(axisId) {
    const axisHistory = this.getAxisHistory(axisId);
    return axisHistory.length > 0 ? axisHistory[axisHistory.length - 1] : null;
  }
  
  /**
   * Get all axis IDs
   */
  getAxisIds() {
    return this._axes.map(axis => axis.id);
  }
  
  /**
   * Check if an axis exists
   */
  hasAxis(axisId) {
    return this._axesMap.has(axisId);
  }
  
  /**
   * Get axis definition by ID
   */
  getAxis(axisId) {
    return this._axesMap.get(axisId) || null;
  }
  
  /**
   * Create a summary of current alignment state
   */
  getSummary() {
    const summary = {};
    for (const axisId of this.getAxisIds()) {
      summary[axisId] = {
        value: this.getValue(axisId),
        zone: this.getZone(axisId),
        lastChange: this.getLastChange(axisId)
      };
    }
    return summary;
  }
  
  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      axes: [...this._axes],
      values: { ...this._values },
      history: { ...this._history }
    };
  }
  
  /**
   * Deserialize from JSON
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for Alignment');
    }
    
    return new Alignment(data.axes || [], data.values || {}, data.history || {});
  }
  
  /**
   * Create an Alignment from the old AlignmentManager format
   */
  static fromAlignmentManager(manager) {
    if (!manager) {
      throw new Error('AlignmentManager is required');
    }
    
    return new Alignment(
      manager.axes || [],
      manager.playerAlignment || {},
      manager.history || {}
    );
  }
  
  /**
   * Equality comparison
   */
  equals(other) {
    if (!(other instanceof Alignment)) return false;
    
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }
  
  /**
   * String representation
   */
  toString() {
    const summary = this.getSummary();
    const entries = Object.entries(summary).map(([axisId, data]) => {
      const zoneName = data.zone ? data.zone.name : 'Unknown';
      return `${axisId}: ${data.value} (${zoneName})`;
    });
    return `Alignment { ${entries.join(', ')} }`;
  }
  
  /**
   * Private validation methods
   */
  _validateAxis(axis) {
    if (!axis || typeof axis !== 'object') {
      throw new Error('Axis must be an object');
    }
    
    if (!axis.id || typeof axis.id !== 'string') {
      throw new Error('Axis must have a valid id');
    }
    
    if (!axis.name || typeof axis.name !== 'string') {
      throw new Error('Axis must have a valid name');
    }
    
    if (typeof axis.min !== 'number' || typeof axis.max !== 'number') {
      throw new Error('Axis must have numeric min and max values');
    }
    
    if (axis.min >= axis.max) {
      throw new Error('Axis min value must be less than max value');
    }
    
    if (typeof axis.defaultValue !== 'number') {
      throw new Error('Axis must have a numeric default value');
    }
    
    if (axis.defaultValue < axis.min || axis.defaultValue > axis.max) {
      throw new Error('Axis default value must be within min/max range');
    }
    
    if (!Array.isArray(axis.zones) || axis.zones.length === 0) {
      throw new Error('Axis must have at least one zone');
    }
    
    // Validate zones
    for (const zone of axis.zones) {
      if (!zone.name || typeof zone.name !== 'string') {
        throw new Error('Zone must have a valid name');
      }
      
      if (typeof zone.min !== 'number' || typeof zone.max !== 'number') {
        throw new Error('Zone must have numeric min and max values');
      }
      
      if (zone.min >= zone.max) {
        throw new Error('Zone min value must be less than max value');
      }
    }
  }
  
  _validateValue(axis, value) {
    if (typeof value !== 'number') {
      throw new Error(`Value for axis '${axis.id}' must be a number`);
    }
    
    if (value < axis.min || value > axis.max) {
      throw new Error(`Value for axis '${axis.id}' must be between ${axis.min} and ${axis.max}`);
    }
  }
  
  /**
   * Deep copy historical context to ensure immutability
   */
  _deepCopyContext(context) {
    if (!context || typeof context !== 'object') {
      return context;
    }
    
    const copy = { ...context };
    
    // Handle Map objects specially
    if (context.culturalValues instanceof Map) {
      copy.culturalValues = new Map(context.culturalValues);
    }
    
    return Object.freeze(copy);
  }
}