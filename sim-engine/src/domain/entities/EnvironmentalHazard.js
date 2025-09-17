// src/domain/entities/EnvironmentalHazard.js

const {
  isValidHazardType,
  getHazardDescription,
  getHazardBaseDanger,
  getHazardCategory,
  HAZARD_ATTRIBUTE_MODIFIERS
} = require('../../shared/constants/HazardTypes.js');
const { ValidationError } = require('../../shared/types/ValueObjectTypes.js');

/**
 * EnvironmentalHazard entity represents environmental dangers that can affect characters
 * in specific nodes. Each hazard has a type, severity level, and optional description.
 */
class EnvironmentalHazard {
  /**
   * Creates a new EnvironmentalHazard instance
   * @param {Object} config - Configuration object
   * @param {string} config.type - The hazard type (must be from HazardTypes enum)
   * @param {number} config.severity - Severity level from 0.0 to 1.0
   * @param {string} [config.description] - Optional custom description
   * @param {string} [config.id] - Optional custom ID
   */
  constructor(config = {}) {
    // Validate and set type
    if (!config.type) {
      throw new ValidationError('Hazard type is required');
    }
    if (!isValidHazardType(config.type)) {
      throw new ValidationError(`Invalid hazard type: ${config.type}`);
    }
    this.type = config.type;

    // Validate and set severity
    this.severity = this._validateSeverity(config.severity);

    // Set description (use provided or default)
    this.description = config.description || getHazardDescription(this.type);

    // Generate or use provided ID
    this.id = config.id || this._generateId();

    // Cache calculated values for performance
    this._baseDanger = null;
    this._category = null;
    this._attributeModifiers = null;
  }

  /**
   * Validates severity value and ensures it's within acceptable range
   * @param {number} severity - The severity value to validate
   * @returns {number} The validated severity value
   * @private
   */
  _validateSeverity(severity) {
    if (typeof severity !== 'number') {
      throw new ValidationError('Severity must be a number');
    }
    if (severity < 0.0 || severity > 1.0) {
      throw new ValidationError('Severity must be between 0.0 and 1.0');
    }
    return severity;
  }

  /**
   * Generates a unique ID for the hazard
   * @returns {string} A unique identifier
   * @private
   */
  _generateId() {
    return `hazard_${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets the base danger level for this hazard type
   * @returns {number} Base danger value (0.0 to 1.0)
   */
  getBaseDanger() {
    if (this._baseDanger === null) {
      this._baseDanger = getHazardBaseDanger(this.type);
    }
    return this._baseDanger;
  }

  /**
   * Calculates the effective danger level considering severity
   * @returns {number} Effective danger value (0.0 to 1.0)
   */
  getEffectiveDanger() {
    return Math.min(1.0, this.getBaseDanger() * this.severity);
  }

  /**
   * Gets the category this hazard belongs to
   * @returns {string} The hazard category
   */
  getCategory() {
    if (this._category === null) {
      this._category = getHazardCategory(this.type);
    }
    return this._category;
  }

  /**
   * Gets the attribute modifiers for this hazard
   * @returns {Object} Object containing attribute modifiers
   */
  getAttributeModifiers() {
    if (this._attributeModifiers === null) {
      const baseModifiers = HAZARD_ATTRIBUTE_MODIFIERS[this.type] || {};
      // Scale modifiers by severity
      this._attributeModifiers = {};
      for (const [attribute, modifier] of Object.entries(baseModifiers)) {
        this._attributeModifiers[attribute] = Math.round(modifier * this.severity);
      }
    }
    return { ...this._attributeModifiers };
  }

  /**
   * Calculates the effect this hazard has on a specific attribute
   * @param {string} attributeName - The name of the attribute
   * @returns {number} The modifier value for the attribute (can be negative)
   */
  getAttributeEffect(attributeName) {
    const modifiers = this.getAttributeModifiers();
    return modifiers[attributeName] || 0;
  }

  /**
   * Determines if this hazard affects a specific attribute
   * @param {string} attributeName - The name of the attribute to check
   * @returns {boolean} True if the hazard affects this attribute
   */
  affectsAttribute(attributeName) {
    const modifiers = this.getAttributeModifiers();
    return attributeName in modifiers;
  }

  /**
   * Gets a severity description for display purposes
   * @returns {string} Human-readable severity description
   */
  getSeverityDescription() {
    if (this.severity <= 0.2) return 'Minor';
    if (this.severity <= 0.4) return 'Moderate';
    if (this.severity <= 0.6) return 'Significant';
    if (this.severity <= 0.8) return 'Severe';
    return 'Extreme';
  }

  /**
   * Checks if this hazard is considered dangerous (severity > 0.5)
   * @returns {boolean} True if the hazard is dangerous
   */
  isDangerous() {
    return this.severity > 0.5;
  }

  /**
   * Checks if this hazard is of a specific category
   * @param {string} category - The category to check against
   * @returns {boolean} True if the hazard belongs to the specified category
   */
  isOfCategory(category) {
    return this.getCategory() === category.toLowerCase();
  }

  /**
   * Updates the severity of this hazard
   * @param {number} newSeverity - The new severity value (0.0 to 1.0)
   */
  updateSeverity(newSeverity) {
    this.severity = this._validateSeverity(newSeverity);
    // Clear cached values that depend on severity
    this._attributeModifiers = null;
  }

  /**
   * Updates the description of this hazard
   * @param {string} newDescription - The new description
   */
  updateDescription(newDescription) {
    if (typeof newDescription !== 'string') {
      throw new ValidationError('Description must be a string');
    }
    this.description = newDescription;
  }

  /**
   * Creates a copy of this hazard with modified properties
   * @param {Object} modifications - Properties to modify
   * @returns {EnvironmentalHazard} A new hazard instance with modifications
   */
  clone(modifications = {}) {
    return new EnvironmentalHazard({
      type: this.type,
      severity: this.severity,
      description: this.description,
      ...modifications
    });
  }

  /**
   * Compares this hazard with another for equality
   * @param {EnvironmentalHazard} other - The other hazard to compare with
   * @returns {boolean} True if hazards are equivalent
   */
  equals(other) {
    if (!(other instanceof EnvironmentalHazard)) {
      return false;
    }
    return this.type === other.type && 
           Math.abs(this.severity - other.severity) < 0.001 &&
           this.description === other.description;
  }

  /**
   * Serializes the hazard to JSON
   * @returns {Object} JSON representation of the hazard
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      severity: this.severity,
      description: this.description
    };
  }

  /**
   * Creates an EnvironmentalHazard from JSON data
   * @param {Object} data - JSON data to deserialize
   * @returns {EnvironmentalHazard} New hazard instance
   * @static
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid JSON data for EnvironmentalHazard');
    }

    return new EnvironmentalHazard({
      id: data.id,
      type: data.type,
      severity: data.severity,
      description: data.description
    });
  }

  /**
   * Creates a hazard with random severity within a range
   * @param {string} type - The hazard type
   * @param {number} [minSeverity=0.1] - Minimum severity
   * @param {number} [maxSeverity=0.9] - Maximum severity
   * @param {string} [description] - Optional description
   * @returns {EnvironmentalHazard} New hazard with random severity
   * @static
   */
  static createWithRandomSeverity(type, minSeverity = 0.1, maxSeverity = 0.9, description) {
    const severity = minSeverity + Math.random() * (maxSeverity - minSeverity);
    return new EnvironmentalHazard({
      type,
      severity: Math.round(severity * 100) / 100, // Round to 2 decimal places
      description
    });
  }

  /**
   * Creates multiple hazards from an array of configurations
   * @param {Array} hazardConfigs - Array of hazard configuration objects
   * @returns {Array<EnvironmentalHazard>} Array of hazard instances
   * @static
   */
  static createMultiple(hazardConfigs) {
    if (!Array.isArray(hazardConfigs)) {
      throw new ValidationError('Hazard configurations must be an array');
    }
    return hazardConfigs.map(config => new EnvironmentalHazard(config));
  }
}

module.exports = EnvironmentalHazard;