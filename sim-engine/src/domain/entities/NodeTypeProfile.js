// src/domain/entities/NodeTypeProfile.js
// Node type profile entity defining capabilities for different node types

import NodeTypeCapabilities from '../value-objects/NodeTypeCapabilities.js';

class NodeTypeProfile {
  constructor(config = {}) {
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unknown Type';
    this.description = config.description || '';
    this.type = config.type || 'unknown';

    // Core capabilities defining what systems are enabled
    this.capabilities = config.capabilities instanceof NodeTypeCapabilities ?
      config.capabilities : new NodeTypeCapabilities(config.capabilities || {});

    // Resource production/consumption profiles
    this.resourceProfile = config.resourceProfile || {
      canProduce: false,
      canConsume: false,
      productionTypes: [], // e.g., ['food', 'water', 'materials']
      consumptionTypes: [], // e.g., ['food', 'water']
      productionCapacity: 0,
      consumptionCapacity: 0
    };

    // Economic system capabilities
    this.economicCapabilities = config.economicCapabilities || {
      hasMarkets: false,
      hasTrade: false,
      hasTaxation: false,
      hasBanking: false,
      economicComplexity: 'none' // 'none', 'minimal', 'moderate', 'full'
    };

    // Political system capabilities
    this.politicalCapabilities = config.politicalCapabilities || {
      hasGovernment: false,
      hasLeadership: false,
      hasDiplomacy: false,
      hasLaws: false,
      politicalComplexity: 'none' // 'none', 'minimal', 'moderate', 'full'
    };

    // Social system capabilities
    this.socialCapabilities = config.socialCapabilities || {
      hasPopulation: false,
      hasCulture: false,
      hasEducation: false,
      hasReligion: false,
      socialComplexity: 'none' // 'none', 'minimal', 'moderate', 'full'
    };

    // Special mechanics for landmark/sacred nodes
    this.specialMechanics = config.specialMechanics || [];

    // Validation rules
    this.validationRules = config.validationRules || [];
  }

  _generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `node_type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if this node type supports a specific capability
   * @param {string} capability - The capability to check
   * @returns {boolean} True if the capability is supported
   */
  hasCapability(capability) {
    return this.capabilities.hasCapability(capability);
  }

  /**
   * Get all capabilities for this node type
   * @returns {string[]} Array of capability names
   */
  getCapabilities() {
    return this.capabilities.getAllCapabilities();
  }

  /**
   * Check if this node type can produce specific resources
   * @param {string} resourceType - Type of resource
   * @returns {boolean} True if can produce this resource type
   */
  canProduceResource(resourceType) {
    return this.resourceProfile.canProduce &&
           this.resourceProfile.productionTypes.includes(resourceType);
  }

  /**
   * Check if this node type can consume specific resources
   * @param {string} resourceType - Type of resource
   * @returns {boolean} True if can consume this resource type
   */
  canConsumeResource(resourceType) {
    return this.resourceProfile.canConsume &&
           this.resourceProfile.consumptionTypes.includes(resourceType);
  }

  /**
   * Get the economic complexity level
   * @returns {string} Economic complexity ('none', 'minimal', 'moderate', 'full')
   */
  getEconomicComplexity() {
    return this.economicCapabilities.economicComplexity;
  }

  /**
   * Get the political complexity level
   * @returns {string} Political complexity ('none', 'minimal', 'moderate', 'full')
   */
  getPoliticalComplexity() {
    return this.politicalCapabilities.politicalComplexity;
  }

  /**
   * Get the social complexity level
   * @returns {string} Social complexity ('none', 'minimal', 'moderate', 'full')
   */
  getSocialComplexity() {
    return this.socialCapabilities.socialComplexity;
  }

  /**
   * Check if this node type has special mechanics
   * @param {string} mechanic - Specific mechanic to check
   * @returns {boolean} True if the mechanic is available
   */
  hasSpecialMechanic(mechanic) {
    return this.specialMechanics.includes(mechanic);
  }

  /**
   * Validate that a node configuration matches this type profile
   * @param {Object} nodeConfig - Node configuration to validate
   * @returns {Object} Validation result with isValid and errors array
   */
  validateNodeConfig(nodeConfig) {
    const errors = [];

    // Apply custom validation rules
    for (const rule of this.validationRules) {
      const result = rule.validate(nodeConfig);
      if (!result.isValid) {
        errors.push(...result.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a clone of this profile
   * @returns {NodeTypeProfile} Cloned profile
   */
  clone() {
    return new NodeTypeProfile({
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      capabilities: this.capabilities.clone(),
      resourceProfile: { ...this.resourceProfile },
      economicCapabilities: { ...this.economicCapabilities },
      politicalCapabilities: { ...this.politicalCapabilities },
      socialCapabilities: { ...this.socialCapabilities },
      specialMechanics: [...this.specialMechanics],
      validationRules: [...this.validationRules]
    });
  }
}

export default NodeTypeProfile;