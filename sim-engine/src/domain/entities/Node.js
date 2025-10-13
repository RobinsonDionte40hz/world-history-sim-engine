// src/domain/entities/Node.js
// Enhanced Node class with environmental properties and connections

import Interaction from './Interaction.js';
import InteractionBase from './interactions/InteractionBase.js';
import Environment from '../value-objects/Environment.js';
import NodeConnection from '../value-objects/NodeConnection.js';
import NodeTypeProfile from './NodeTypeProfile.js';

class Node {
  constructor(config = {}) {
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Node';
    this.description = config.description || '';
    this.type = config.type || 'location';
    
    // Mapless architecture - no spatial coordinates
    // Position is only used for legacy compatibility, not stored
    
    // Separate content interactions from system interactions
    // System interactions are generated dynamically by InteractionManager
    this.contentInteractions = Array.isArray(config.contentInteractions) ? 
      config.contentInteractions.map(i => {
        // If it's already an interaction instance, use it as-is
        if (i instanceof Interaction || i instanceof InteractionBase) {
          return i;
        }
        // Otherwise, try to create from config
        return new Interaction(i);
      }) : 
      [];
    
    // Migration support: if old interactions array exists, migrate to contentInteractions
    if (config.interactions && config.interactions.length > 0 && this.contentInteractions.length === 0) {
      this.contentInteractions = config.interactions.map(i => {
        if (i instanceof Interaction || i instanceof InteractionBase) {
          return i;
        }
        return new Interaction(i);
      });
      console.warn(`Node ${this.id}: Migrated legacy 'interactions' to 'contentInteractions'. Consider updating save files.`);
    }
    
    // Keep legacy interactions array for backward compatibility (read-only)
    this.interactions = this.contentInteractions;
    
    this.resources = Array.isArray(config.resources) ? config.resources : [];
    
    // Enhanced environmental properties using Environment value object
    this.environment = config.environment instanceof Environment ? 
      config.environment : new Environment(config.environment || {});
    
    // Node size for population density calculations (default: 100)
    this.size = config.size || 100;
    
    // Population count
    this.population = config.population || 0;
    
    // Settlement integration properties
    this.settlementId = config.settlementId || null; // ID of settlement this node belongs to
    this.settlementRole = config.settlementRole || null; // Role within settlement ('core', 'district', 'outpost')
    this.settlementEffects = config.settlementEffects || {}; // Settlement bonuses applied to this node

    // Node type system integration
    this.typeProfile = config.typeProfile || null; // NodeTypeProfile instance defining capabilities

    // Economic capabilities (derived from type profile)
    this.economicCapabilities = config.economicCapabilities || {
      hasMarkets: false,
      hasTrade: false,
      hasTaxation: false,
      hasBanking: false,
      economicComplexity: 'none'
    };

    // Political capabilities (derived from type profile)
    this.politicalCapabilities = config.politicalCapabilities || {
      hasGovernment: false,
      hasLeadership: false,
      hasDiplomacy: false,
      hasLaws: false,
      politicalComplexity: 'none'
    };

    // Resource production/consumption properties (derived from type profile)
    this.resourceProduction = config.resourceProduction || {
      canProduce: false,
      productionTypes: [],
      productionCapacity: 0,
      currentProduction: {}
    };

    this.resourceConsumption = config.resourceConsumption || {
      canConsume: false,
      consumptionTypes: [],
      consumptionCapacity: 0,
      currentConsumption: {}
    };
    
    // Enhanced connection data using NodeConnection objects
    this.connections = Array.isArray(config.connections) ? 
      config.connections.map(conn => conn instanceof NodeConnection ? conn : new NodeConnection(conn)) : 
      [];
    
    // Maintain backward compatibility with connectedNodes
    if (config.connectedNodes && config.connectedNodes.length > 0 && this.connections.length === 0) {
      this.connections = config.connectedNodes.map(nodeId => 
        new NodeConnection({ targetNodeId: nodeId })
      );
    }

    // Preserve custom data if provided
    if (config.customData) {
      this.customData = { ...config.customData };
    }

    // Don't freeze in constructor to allow modifications if needed
  }

  _generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hasInteraction(interactionId) {
    return this.contentInteractions.some(i => i.id === interactionId);
  }

  hasContentInteraction(interactionId) {
    return this.hasInteraction(interactionId);
  }

  getAvailableInteractions(character) {
    return this.contentInteractions.filter(i => 
      i.meetsRequirements && i.meetsRequirements(character) && 
      i.isAvailable && i.isAvailable(Date.now())
    );
  }

  getContentInteractions() {
    return [...this.contentInteractions];
  }

  addContentInteraction(interaction) {
    if (!(interaction instanceof Interaction) && !(interaction instanceof InteractionBase)) {
      throw new Error('Interaction must be an Interaction or InteractionBase instance');
    }
    
    if (!this.hasInteraction(interaction.id)) {
      this.contentInteractions.push(interaction);
      // Update legacy array for backward compatibility
      this.interactions = this.contentInteractions;
    }
  }

  // Alias for backward compatibility
  addInteraction(interaction) {
    return this.addContentInteraction(interaction);
  }

  removeContentInteraction(interactionId) {
    const initialLength = this.contentInteractions.length;
    this.contentInteractions = this.contentInteractions.filter(i => i.id !== interactionId);
    
    if (this.contentInteractions.length < initialLength) {
      // Update legacy array for backward compatibility
      this.interactions = this.contentInteractions;
      return true;
    }
    return false;
  }

  getEnvironmentFactor() {
    return this.environment.density || 0.5;
  }

  /**
   * Calculates environmental danger level for this node
   * This is a placeholder implementation until EnvironmentalCalculationService is available
   * @returns {number} Danger level from 0.0 to 1.0
   */
  getEnvironmentalDanger() {
    let danger = 0;
    
    // Base danger from node type
    const typeDanger = {
      'wilderness': 0.3,
      'dungeon': 0.6,
      'settlement': 0.1,
      'landmark': 0.2,
      'resource': 0.25,
      'sacred': 0.15
    };
    
    danger += typeDanger[this.type] || 0;
    
    // Add hazard danger
    danger += this.environment.hazards.length * 0.1;
    
    // Environmental factors
    if (this.environment.shelterQuality < 0.3) danger += 0.2;
    if (this.environment.airQuality < 0.4) danger += 0.15;
    if (this.environment.waterAvailability < 0.3) danger += 0.25;
    
    // Climate extremes
    if (this.environment.climate === 'arctic') danger += 0.2;
    if (this.environment.climate === 'arid') danger += 0.15;
    
    // Lighting conditions
    if (this.environment.lighting === 'dark') danger += 0.2;
    if (this.environment.lighting === 'dim') danger += 0.1;
    
    return Math.min(1, danger);
  }

  // ===== NODE TYPE SYSTEM METHODS =====

  /**
   * Set the node type profile
   * @param {NodeTypeProfile} typeProfile - The node type profile to set
   */
  setTypeProfile(typeProfile) {
    if (typeProfile && !(typeProfile instanceof NodeTypeProfile)) {
      throw new Error('typeProfile must be a NodeTypeProfile instance');
    }
    this.typeProfile = typeProfile;

    // Update derived properties from the type profile
    if (typeProfile) {
      this.economicCapabilities = { ...typeProfile.economicCapabilities };
      this.politicalCapabilities = { ...typeProfile.politicalCapabilities };
      this.resourceProduction = {
        canProduce: typeProfile.resourceProfile.canProduce,
        productionTypes: [...typeProfile.resourceProfile.productionTypes],
        productionCapacity: typeProfile.resourceProfile.productionCapacity,
        currentProduction: this.resourceProduction?.currentProduction || {}
      };
      this.resourceConsumption = {
        canConsume: typeProfile.resourceProfile.canConsume,
        consumptionTypes: [...typeProfile.resourceProfile.consumptionTypes],
        consumptionCapacity: typeProfile.resourceProfile.consumptionCapacity,
        currentConsumption: this.resourceConsumption?.currentConsumption || {}
      };
    }
  }

  /**
   * Get the node type profile, with fallback for backward compatibility
   * @returns {NodeTypeProfile|null} The node type profile
   */
  getTypeProfile() {
    if (!this.typeProfile && this.nodeTypeService) {
      // Try to get or create a fallback type profile
      this.typeProfile = this.nodeTypeService.getNodeTypeWithFallback(this.type, this.type);
    }
    return this.typeProfile;
  }

  /**
   * Check if this node has a specific capability
   * @param {string} capability - The capability to check
   * @returns {boolean} True if the node has the capability
   */
  hasCapability(capability) {
    // If type profile exists, use it
    if (this.typeProfile) {
      return this.typeProfile.hasCapability(capability);
    }

    // Fallback behavior for nodes without type profiles (backward compatibility)
    // Default to basic capabilities based on node type
    const defaultCapabilities = this._getDefaultCapabilities();
    return defaultCapabilities.includes(capability);
  }

  /**
   * Get all capabilities for this node
   * @returns {string[]} Array of capability names
   */
  getCapabilities() {
    if (this.typeProfile) {
      return this.typeProfile.getCapabilities();
    }

    // Fallback behavior for backward compatibility
    return this._getDefaultCapabilities();
  }

  /**
   * Get default capabilities for nodes without type profiles
   * @private
   * @returns {string[]} Array of default capability names
   */
  _getDefaultCapabilities() {
    // Provide backward-compatible default capabilities based on node type
    const baseCapabilities = [
      'canHaveContentInteractions',
      'canHaveEnvironmentalEffects',
      'canHostEvents'
    ];

    // Add type-specific capabilities for common node types
    switch (this.type) {
      case 'settlement':
        return [
          ...baseCapabilities,
          'canHaveEconomy',
          'canProduceResources',
          'canConsumeResources',
          'canHaveMarkets',
          'canTrade',
          'canHaveGovernment',
          'canHaveLeadership',
          'canHaveDiplomacy',
          'canHavePopulation',
          'canHaveCulture',
          'canHaveBuildings',
          'canHaveInfrastructure',
          'canBeDeveloped'
        ];

      case 'resource':
        return [
          ...baseCapabilities,
          'canProduceResources',
          'canHaveInfrastructure',
          'canBeDeveloped'
        ];

      case 'wilderness':
        return [
          ...baseCapabilities,
          'canProduceResources'
        ];

      case 'landmark':
      case 'sacred':
        return [
          ...baseCapabilities,
          'canHaveSpecialMechanics',
          'canInfluenceNeighbors',
          'canHaveReligion'
        ];

      default:
        // Generic location node - minimal capabilities
        return baseCapabilities;
    }
  }

  /**
   * Check if this node can produce a specific resource
   * @param {string} resourceType - Type of resource
   * @returns {boolean} True if can produce this resource type
   */
  canProduceResource(resourceType) {
    // If type profile exists, use it
    if (this.typeProfile) {
      return this.resourceProduction.canProduce &&
             this.resourceProduction.productionTypes.includes(resourceType);
    }

    // Fallback behavior for backward compatibility
    return this._canProduceResourceByDefault(resourceType);
  }

  /**
   * Check if this node can consume a specific resource
   * @param {string} resourceType - Type of resource
   * @returns {boolean} True if can consume this resource type
   */
  canConsumeResource(resourceType) {
    // If type profile exists, use it
    if (this.typeProfile) {
      return this.resourceConsumption.canConsume &&
             this.resourceConsumption.consumptionTypes.includes(resourceType);
    }

    // Fallback behavior for backward compatibility
    return this._canConsumeResourceByDefault(resourceType);
  }

  /**
   * Default resource production capability for nodes without type profiles
   * @private
   * @param {string} resourceType - Type of resource
   * @returns {boolean} True if can produce by default
   */
  _canProduceResourceByDefault(resourceType) {
    // Provide backward-compatible defaults based on node type
    switch (this.type) {
      case 'settlement':
        return ['food', 'water', 'materials', 'goods', 'services'].includes(resourceType);
      case 'resource':
        return ['food', 'water', 'materials', 'minerals', 'energy'].includes(resourceType);
      case 'wilderness':
        return ['food', 'water', 'materials'].includes(resourceType);
      default:
        return false;
    }
  }

  /**
   * Default resource consumption capability for nodes without type profiles
   * @private
   * @param {string} resourceType - Type of resource
   * @returns {boolean} True if can consume by default
   */
  _canConsumeResourceByDefault(resourceType) {
    // Provide backward-compatible defaults based on node type
    switch (this.type) {
      case 'settlement':
        return ['food', 'water', 'materials', 'goods', 'services'].includes(resourceType);
      default:
        return false;
    }
  }

  /**
   * Get the economic complexity level
   * @returns {string} Economic complexity ('none', 'minimal', 'moderate', 'full')
   */
  getEconomicComplexity() {
    // If type profile exists, use it
    if (this.typeProfile) {
      return this.economicCapabilities.economicComplexity || 'none';
    }

    // Fallback behavior for backward compatibility
    return this._getDefaultEconomicComplexity();
  }

  /**
   * Get the political complexity level
   * @returns {string} Political complexity ('none', 'minimal', 'moderate', 'full')
   */
  getPoliticalComplexity() {
    // If type profile exists, use it
    if (this.typeProfile) {
      return this.politicalCapabilities.politicalComplexity || 'none';
    }

    // Fallback behavior for backward compatibility
    return this._getDefaultPoliticalComplexity();
  }

  /**
   * Get default economic complexity for nodes without type profiles
   * @private
   * @returns {string} Default economic complexity
   */
  _getDefaultEconomicComplexity() {
    switch (this.type) {
      case 'settlement':
        return 'full';
      case 'resource':
      case 'wilderness':
        return 'minimal';
      default:
        return 'none';
    }
  }

  /**
   * Get default political complexity for nodes without type profiles
   * @private
   * @returns {string} Default political complexity
   */
  _getDefaultPoliticalComplexity() {
    switch (this.type) {
      case 'settlement':
        return 'full';
      default:
        return 'none';
    }
  }

  /**
   * Check if this node has economic systems enabled
   * @returns {boolean} True if economic systems are enabled
   */
  hasEconomicSystems() {
    return this.getEconomicComplexity() !== 'none';
  }

  /**
   * Check if this node has political systems enabled
   * @returns {boolean} True if political systems are enabled
   */
  hasPoliticalSystems() {
    return this.getPoliticalComplexity() !== 'none';
  }

  /**
   * Update resource production for this turn
   * @param {Object} production - Production amounts by resource type
   */
  updateResourceProduction(production) {
    // Check if production is allowed (with fallback for backward compatibility)
    const canProduce = this.typeProfile ?
      this.resourceProduction.canProduce :
      this._canProduceByDefault();

    if (!canProduce) {
      return;
    }

    this.resourceProduction.currentProduction = { ...production };

    // Get production capacity (with fallback)
    const capacity = this.typeProfile ?
      this.resourceProduction.productionCapacity :
      this._getDefaultProductionCapacity();

    // Cap production at capacity
    const totalProduction = Object.values(production).reduce((sum, amount) => sum + amount, 0);
    if (totalProduction > capacity) {
      const scaleFactor = capacity / totalProduction;
      for (const resourceType in this.resourceProduction.currentProduction) {
        this.resourceProduction.currentProduction[resourceType] *= scaleFactor;
      }
    }
  }

  /**
   * Update resource consumption for this turn
   * @param {Object} consumption - Consumption amounts by resource type
   */
  updateResourceConsumption(consumption) {
    // Check if consumption is allowed (with fallback for backward compatibility)
    const canConsume = this.typeProfile ?
      this.resourceConsumption.canConsume :
      this._canConsumeByDefault();

    if (!canConsume) {
      return;
    }

    this.resourceConsumption.currentConsumption = { ...consumption };

    // Get consumption capacity (with fallback)
    const capacity = this.typeProfile ?
      this.resourceConsumption.consumptionCapacity :
      this._getDefaultConsumptionCapacity();

    // Cap consumption at capacity
    const totalConsumption = Object.values(consumption).reduce((sum, amount) => sum + amount, 0);
    if (totalConsumption > capacity) {
      const scaleFactor = capacity / totalConsumption;
      for (const resourceType in this.resourceConsumption.currentConsumption) {
        this.resourceConsumption.currentConsumption[resourceType] *= scaleFactor;
      }
    }
  }

  /**
   * Check if this node can produce resources by default (fallback)
   * @private
   * @returns {boolean} True if can produce by default
   */
  _canProduceByDefault() {
    switch (this.type) {
      case 'settlement':
      case 'resource':
      case 'wilderness':
        return true;
      default:
        return false;
    }
  }

  /**
   * Check if this node can consume resources by default (fallback)
   * @private
   * @returns {boolean} True if can consume by default
   */
  _canConsumeByDefault() {
    return this.type === 'settlement';
  }

  /**
   * Get default production capacity for nodes without type profiles
   * @private
   * @returns {number} Default production capacity
   */
  _getDefaultProductionCapacity() {
    switch (this.type) {
      case 'settlement':
        return 100;
      case 'resource':
        return 50;
      case 'wilderness':
        return 10;
      default:
        return 0;
    }
  }

  /**
   * Get default consumption capacity for nodes without type profiles
   * @private
   * @returns {number} Default consumption capacity
   */
  _getDefaultConsumptionCapacity() {
    switch (this.type) {
      case 'settlement':
        return 100;
      default:
        return 0;
    }
  }

  /**
   * Get current resource production
   * @returns {Object} Current production by resource type
   */
  getCurrentProduction() {
    return { ...this.resourceProduction.currentProduction };
  }

  /**
   * Get current resource consumption
   * @returns {Object} Current consumption by resource type
   */
  getCurrentConsumption() {
    return { ...this.resourceConsumption.currentConsumption };
  }

  /**
   * Validate that this node's configuration matches its type profile
   * @returns {Object} Validation result with isValid and errors array
   */
  validateTypeProfile() {
    if (!this.typeProfile) {
      return {
        isValid: true, // No type profile means no restrictions
        errors: []
      };
    }

    return this.typeProfile.validateNodeConfig({
      type: this.type,
      economicCapabilities: this.economicCapabilities,
      politicalCapabilities: this.politicalCapabilities,
      resourceProduction: this.resourceProduction,
      resourceConsumption: this.resourceConsumption,
      population: this.population,
      settlementId: this.settlementId
    });
  }

  /**
   * Serialize node to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    const json = {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      contentInteractions: this.contentInteractions.map(i => i.toJSON ? i.toJSON() : i),
      resources: [...this.resources],
      environment: this.environment.toJSON ? this.environment.toJSON() : this.environment,
      size: this.size,
      population: this.population,
      settlementId: this.settlementId,
      settlementRole: this.settlementRole,
      settlementEffects: { ...this.settlementEffects },
      connections: this.connections.map(conn => conn.toJSON ? conn.toJSON() : conn),

      // Node type system properties
      typeProfile: this.typeProfile ? this.typeProfile.id : null,
      economicCapabilities: { ...this.economicCapabilities },
      politicalCapabilities: { ...this.politicalCapabilities },
      resourceProduction: { ...this.resourceProduction },
      resourceConsumption: { ...this.resourceConsumption }
    };

    // Include customData if it exists
    if (this.customData) {
      json.customData = this.customData;
    }

    return json;
  }

  /**
   * Deserialize node from JSON
   * @param {Object} data - JSON data
   * @returns {Node} New Node instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for Node');
    }

    // Handle environment data
    let environment = data.environment;
    if (environment && typeof environment === 'object' && !(environment instanceof Environment)) {
      environment = Environment.fromJSON(environment);
    }

    // Handle connections data
    let connections = data.connections;
    if (Array.isArray(connections)) {
      connections = connections.map(connData =>
        connData instanceof NodeConnection ? connData : NodeConnection.fromJSON(connData)
      );
    }

    // Handle interaction migration
    let contentInteractions = data.contentInteractions;
    if (!contentInteractions && data.interactions) {
      // Migrate from old format
      contentInteractions = data.interactions;
      console.warn(`Node ${data.id}: Migrating legacy 'interactions' to 'contentInteractions' during deserialization.`);
    }

    return new Node({
      ...data,
      environment,
      connections,
      contentInteractions
    });
  }
}

export default Node;