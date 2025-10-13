// src/domain/services/NodeTypeService.js
// Service for managing node types, validation, and capability checking

import NodeTypeProfile from '../entities/NodeTypeProfile.js';
import NodeTypeCapabilities from '../value-objects/NodeTypeCapabilities.js';

class NodeTypeService {
  constructor() {
    this.nodeTypes = new Map();
    this._initializeStandardTypes();
  }

  /**
   * Initialize standard node type profiles
   * @private
   */
  _initializeStandardTypes() {
    // Settlement type - full economic, political, and social systems
    this.registerNodeType(new NodeTypeProfile({
      id: 'settlement',
      name: 'Settlement',
      description: 'A populated area with full economic, political, and social systems',
      type: 'settlement',
      capabilities: new NodeTypeCapabilities({
        canHaveEconomy: true,
        canProduceResources: true,
        canConsumeResources: true,
        canHaveMarkets: true,
        canTrade: true,
        canHaveTaxation: true,
        canHaveBanking: true,
        canHaveGovernment: true,
        canHaveLeadership: true,
        canHaveDiplomacy: true,
        canHaveLaws: true,
        canHaveMilitary: true,
        canHavePopulation: true,
        canHaveCulture: true,
        canHaveEducation: true,
        canHaveReligion: true,
        canHaveSocialClasses: true,
        canHaveEnvironmentalEffects: true,
        canHaveContentInteractions: true,
        canHaveSystemInteractions: true,
        canHostEvents: true,
        canBeDeveloped: true,
        canHaveBuildings: true,
        canHaveInfrastructure: true
      }),
      resourceProfile: {
        canProduce: true,
        canConsume: true,
        productionTypes: ['food', 'water', 'materials', 'goods', 'services'],
        consumptionTypes: ['food', 'water', 'materials', 'goods', 'services'],
        productionCapacity: 100,
        consumptionCapacity: 100
      },
      economicCapabilities: {
        hasMarkets: true,
        hasTrade: true,
        hasTaxation: true,
        hasBanking: true,
        economicComplexity: 'full'
      },
      politicalCapabilities: {
        hasGovernment: true,
        hasLeadership: true,
        hasDiplomacy: true,
        hasLaws: true,
        politicalComplexity: 'full'
      },
      socialCapabilities: {
        hasPopulation: true,
        hasCulture: true,
        hasEducation: true,
        hasReligion: true,
        socialComplexity: 'full'
      }
    }));

    // Resource node type - production only, no consumption or markets
    this.registerNodeType(new NodeTypeProfile({
      id: 'resource',
      name: 'Resource Node',
      description: 'A natural resource extraction site with production capabilities only',
      type: 'resource',
      capabilities: new NodeTypeCapabilities({
        canProduceResources: true,
        canHaveEnvironmentalEffects: true,
        canHaveContentInteractions: true,
        canHaveSystemInteractions: false,
        canHostEvents: false,
        canBeDeveloped: true,
        canHaveInfrastructure: true
      }),
      resourceProfile: {
        canProduce: true,
        canConsume: false,
        productionTypes: ['food', 'water', 'materials', 'minerals', 'energy'],
        consumptionTypes: [],
        productionCapacity: 50,
        consumptionCapacity: 0
      },
      economicCapabilities: {
        hasMarkets: false,
        hasTrade: false,
        hasTaxation: false,
        hasBanking: false,
        economicComplexity: 'minimal'
      },
      politicalCapabilities: {
        hasGovernment: false,
        hasLeadership: false,
        hasDiplomacy: false,
        hasLaws: false,
        politicalComplexity: 'none'
      },
      socialCapabilities: {
        hasPopulation: false,
        hasCulture: false,
        hasEducation: false,
        hasReligion: false,
        socialComplexity: 'none'
      }
    }));

    // Wilderness node type - minimal economics, environmental focus
    this.registerNodeType(new NodeTypeProfile({
      id: 'wilderness',
      name: 'Wilderness',
      description: 'Untamed natural area with minimal economic activity',
      type: 'wilderness',
      capabilities: new NodeTypeCapabilities({
        canHaveEconomy: false,
        canProduceResources: true,
        canConsumeResources: false,
        canHaveEnvironmentalEffects: true,
        canHaveContentInteractions: true,
        canHaveSystemInteractions: false,
        canHostEvents: true,
        canBeDeveloped: false
      }),
      resourceProfile: {
        canProduce: true,
        canConsume: false,
        productionTypes: ['food', 'water', 'materials'],
        consumptionTypes: [],
        productionCapacity: 10,
        consumptionCapacity: 0
      },
      economicCapabilities: {
        hasMarkets: false,
        hasTrade: false,
        hasTaxation: false,
        hasBanking: false,
        economicComplexity: 'minimal'
      },
      politicalCapabilities: {
        hasGovernment: false,
        hasLeadership: false,
        hasDiplomacy: false,
        hasLaws: false,
        politicalComplexity: 'none'
      },
      socialCapabilities: {
        hasPopulation: false,
        hasCulture: false,
        hasEducation: false,
        hasReligion: false,
        socialComplexity: 'minimal'
      }
    }));

    // Landmark node type - special mechanics, no standard economics
    this.registerNodeType(new NodeTypeProfile({
      id: 'landmark',
      name: 'Landmark',
      description: 'A notable location with special mechanics and significance',
      type: 'landmark',
      capabilities: new NodeTypeCapabilities({
        canHaveEconomy: false,
        canHaveSpecialMechanics: true,
        canInfluenceNeighbors: true,
        canHaveEnvironmentalEffects: true,
        canHaveContentInteractions: true,
        canHaveSystemInteractions: true,
        canHostEvents: true,
        canBeDeveloped: false
      }),
      resourceProfile: {
        canProduce: false,
        canConsume: false,
        productionTypes: [],
        consumptionTypes: [],
        productionCapacity: 0,
        consumptionCapacity: 0
      },
      economicCapabilities: {
        hasMarkets: false,
        hasTrade: false,
        hasTaxation: false,
        hasBanking: false,
        economicComplexity: 'none'
      },
      politicalCapabilities: {
        hasGovernment: false,
        hasLeadership: false,
        hasDiplomacy: false,
        hasLaws: false,
        politicalComplexity: 'none'
      },
      socialCapabilities: {
        hasPopulation: false,
        hasCulture: true,
        hasEducation: false,
        hasReligion: true,
        socialComplexity: 'minimal'
      },
      specialMechanics: ['cultural_significance', 'historical_events', 'ritual_sites']
    }));

    // Sacred node type - spiritual focus with special mechanics
    this.registerNodeType(new NodeTypeProfile({
      id: 'sacred',
      name: 'Sacred Site',
      description: 'A holy or mystical location with spiritual significance',
      type: 'sacred',
      capabilities: new NodeTypeCapabilities({
        canHaveEconomy: false,
        canHaveSpecialMechanics: true,
        canInfluenceNeighbors: true,
        canHaveEnvironmentalEffects: true,
        canHaveContentInteractions: true,
        canHaveSystemInteractions: true,
        canHostEvents: true,
        canBeDeveloped: false,
        canHaveReligion: true
      }),
      resourceProfile: {
        canProduce: false,
        canConsume: false,
        productionTypes: [],
        consumptionTypes: [],
        productionCapacity: 0,
        consumptionCapacity: 0
      },
      economicCapabilities: {
        hasMarkets: false,
        hasTrade: false,
        hasTaxation: false,
        hasBanking: false,
        economicComplexity: 'none'
      },
      politicalCapabilities: {
        hasGovernment: false,
        hasLeadership: false,
        hasDiplomacy: false,
        hasLaws: false,
        politicalComplexity: 'none'
      },
      socialCapabilities: {
        hasPopulation: false,
        hasCulture: true,
        hasEducation: false,
        hasReligion: true,
        socialComplexity: 'moderate'
      },
      specialMechanics: ['spiritual_power', 'divine_intervention', 'pilgrimage_site', 'mystical_events']
    }));
  }

  /**
   * Register a new node type profile
   * @param {NodeTypeProfile} nodeTypeProfile - The node type profile to register
   */
  registerNodeType(nodeTypeProfile) {
    if (!(nodeTypeProfile instanceof NodeTypeProfile)) {
      throw new Error('Must register a valid NodeTypeProfile instance');
    }

    this.nodeTypes.set(nodeTypeProfile.id, nodeTypeProfile);
  }

  /**
   * Get a node type profile by ID with fallback for backward compatibility
   * @param {string} typeId - The node type ID
   * @returns {NodeTypeProfile|null} The node type profile or null if not found
   */
  getNodeType(typeId) {
    return this.nodeTypes.get(typeId) || null;
  }

  /**
   * Get a node type profile by ID with automatic fallback creation for backward compatibility
   * @param {string} typeId - The node type ID
   * @param {string} nodeType - The legacy node type for fallback creation
   * @returns {NodeTypeProfile} The node type profile (never null)
   */
  getNodeTypeWithFallback(typeId, nodeType = 'location') {
    // Try to get existing type profile
    let typeProfile = this.getNodeType(typeId);
    if (typeProfile) {
      return typeProfile;
    }

    // Create fallback type profile for backward compatibility
    return this._createFallbackTypeProfile(typeId, nodeType);
  }

  /**
   * Create a fallback type profile for backward compatibility
   * @private
   * @param {string} typeId - The type ID to create
   * @param {string} nodeType - The legacy node type
   * @returns {NodeTypeProfile} The created fallback type profile
   */
  _createFallbackTypeProfile(typeId, nodeType) {
    // Create a basic fallback profile based on legacy node type
    const fallbackConfig = this._getFallbackConfigForNodeType(nodeType);

    try {
      const fallbackProfile = new NodeTypeProfile({
        id: typeId,
        name: fallbackConfig.name,
        description: fallbackConfig.description,
        type: nodeType,
        capabilities: fallbackConfig.capabilities,
        resourceProfile: fallbackConfig.resourceProfile,
        economicCapabilities: fallbackConfig.economicCapabilities,
        politicalCapabilities: fallbackConfig.politicalCapabilities,
        socialCapabilities: fallbackConfig.socialCapabilities
      });

      // Register the fallback profile for future use
      this.registerNodeType(fallbackProfile);

      console.warn(`NodeTypeService: Created fallback type profile for '${typeId}' based on legacy node type '${nodeType}'. Consider defining a proper type profile.`);

      return fallbackProfile;
    } catch (error) {
      console.error(`NodeTypeService: Failed to create fallback type profile for '${typeId}':`, error);
      // Return a minimal fallback that won't break functionality
      return this._getMinimalFallbackProfile(typeId);
    }
  }

  /**
   * Get fallback configuration for a legacy node type
   * @private
   * @param {string} nodeType - The legacy node type
   * @returns {Object} Fallback configuration
   */
  _getFallbackConfigForNodeType(nodeType) {
    switch (nodeType) {
      case 'settlement':
        return {
          name: 'Legacy Settlement',
          description: 'Automatically created fallback profile for legacy settlement nodes',
          capabilities: new NodeTypeCapabilities({
            canHaveEconomy: true,
            canProduceResources: true,
            canConsumeResources: true,
            canHaveMarkets: true,
            canTrade: true,
            canHaveGovernment: true,
            canHaveLeadership: true,
            canHaveDiplomacy: true,
            canHavePopulation: true,
            canHaveCulture: true,
            canHaveBuildings: true,
            canHaveInfrastructure: true,
            canBeDeveloped: true,
            canHaveContentInteractions: true,
            canHaveEnvironmentalEffects: true,
            canHostEvents: true
          }),
          resourceProfile: {
            canProduce: true,
            canConsume: true,
            productionTypes: ['food', 'water', 'materials', 'goods', 'services'],
            consumptionTypes: ['food', 'water', 'materials', 'goods', 'services'],
            productionCapacity: 100,
            consumptionCapacity: 100
          },
          economicCapabilities: {
            hasMarkets: true,
            hasTrade: true,
            hasTaxation: true,
            hasBanking: true,
            economicComplexity: 'full'
          },
          politicalCapabilities: {
            hasGovernment: true,
            hasLeadership: true,
            hasDiplomacy: true,
            hasLaws: true,
            politicalComplexity: 'full'
          },
          socialCapabilities: {
            hasPopulation: true,
            hasCulture: true,
            hasEducation: true,
            hasReligion: true,
            socialComplexity: 'full'
          }
        };

      case 'resource':
        return {
          name: 'Legacy Resource Node',
          description: 'Automatically created fallback profile for legacy resource nodes',
          capabilities: new NodeTypeCapabilities({
            canProduceResources: true,
            canHaveInfrastructure: true,
            canBeDeveloped: true,
            canHaveContentInteractions: true,
            canHaveEnvironmentalEffects: true,
            canHostEvents: false
          }),
          resourceProfile: {
            canProduce: true,
            canConsume: false,
            productionTypes: ['food', 'water', 'materials', 'minerals', 'energy'],
            consumptionTypes: [],
            productionCapacity: 50,
            consumptionCapacity: 0
          },
          economicCapabilities: {
            hasMarkets: false,
            hasTrade: false,
            hasTaxation: false,
            hasBanking: false,
            economicComplexity: 'minimal'
          },
          politicalCapabilities: {
            hasGovernment: false,
            hasLeadership: false,
            hasDiplomacy: false,
            hasLaws: false,
            politicalComplexity: 'none'
          },
          socialCapabilities: {
            hasPopulation: false,
            hasCulture: false,
            hasEducation: false,
            hasReligion: false,
            socialComplexity: 'none'
          }
        };

      case 'wilderness':
        return {
          name: 'Legacy Wilderness',
          description: 'Automatically created fallback profile for legacy wilderness nodes',
          capabilities: new NodeTypeCapabilities({
            canProduceResources: true,
            canHaveEnvironmentalEffects: true,
            canHaveContentInteractions: true,
            canHostEvents: true
          }),
          resourceProfile: {
            canProduce: true,
            canConsume: false,
            productionTypes: ['food', 'water', 'materials'],
            consumptionTypes: [],
            productionCapacity: 10,
            consumptionCapacity: 0
          },
          economicCapabilities: {
            hasMarkets: false,
            hasTrade: false,
            hasTaxation: false,
            hasBanking: false,
            economicComplexity: 'minimal'
          },
          politicalCapabilities: {
            hasGovernment: false,
            hasLeadership: false,
            hasDiplomacy: false,
            hasLaws: false,
            politicalComplexity: 'none'
          },
          socialCapabilities: {
            hasPopulation: false,
            hasCulture: false,
            hasEducation: false,
            hasReligion: false,
            socialComplexity: 'minimal'
          }
        };

      default:
        // Generic location fallback
        return {
          name: 'Legacy Location',
          description: 'Automatically created fallback profile for legacy location nodes',
          capabilities: new NodeTypeCapabilities({
            canHaveContentInteractions: true,
            canHaveEnvironmentalEffects: true,
            canHostEvents: true
          }),
          resourceProfile: {
            canProduce: false,
            canConsume: false,
            productionTypes: [],
            consumptionTypes: [],
            productionCapacity: 0,
            consumptionCapacity: 0
          },
          economicCapabilities: {
            hasMarkets: false,
            hasTrade: false,
            hasTaxation: false,
            hasBanking: false,
            economicComplexity: 'none'
          },
          politicalCapabilities: {
            hasGovernment: false,
            hasLeadership: false,
            hasDiplomacy: false,
            hasLaws: false,
            politicalComplexity: 'none'
          },
          socialCapabilities: {
            hasPopulation: false,
            hasCulture: false,
            hasEducation: false,
            hasReligion: false,
            socialComplexity: 'none'
          }
        };
    }
  }

  /**
   * Get a minimal fallback profile when creation fails
   * @private
   * @param {string} typeId - The type ID
   * @returns {NodeTypeProfile} Minimal fallback profile
   */
  _getMinimalFallbackProfile(typeId) {
    return new NodeTypeProfile({
      id: typeId,
      name: 'Minimal Fallback',
      description: 'Minimal fallback profile for compatibility',
      type: 'location',
      capabilities: new NodeTypeCapabilities({
        canHaveContentInteractions: true,
        canHaveEnvironmentalEffects: true,
        canHostEvents: true
      }),
      resourceProfile: {
        canProduce: false,
        canConsume: false,
        productionTypes: [],
        consumptionTypes: [],
        productionCapacity: 0,
        consumptionCapacity: 0
      },
      economicCapabilities: {
        hasMarkets: false,
        hasTrade: false,
        hasTaxation: false,
        hasBanking: false,
        economicComplexity: 'none'
      },
      politicalCapabilities: {
        hasGovernment: false,
        hasLeadership: false,
        hasDiplomacy: false,
        hasLaws: false,
        politicalComplexity: 'none'
      },
      socialCapabilities: {
        hasPopulation: false,
        hasCulture: false,
        hasEducation: false,
        hasReligion: false,
        socialComplexity: 'none'
      }
    });
  }

  /**
   * Get all registered node type profiles
   * @returns {NodeTypeProfile[]} Array of all node type profiles
   */
  getAllNodeTypes() {
    return Array.from(this.nodeTypes.values());
  }

  /**
   * Validate that a node type ID is registered
   * @param {string} typeId - The node type ID to validate
   * @returns {boolean} True if the type is valid
   */
  isValidNodeType(typeId) {
    return this.nodeTypes.has(typeId);
  }

  /**
   * Check if a node type has a specific capability
   * @param {string} typeId - The node type ID
   * @param {string} capability - The capability to check
   * @returns {boolean} True if the type has the capability
   */
  typeHasCapability(typeId, capability) {
    const nodeType = this.getNodeType(typeId);
    return nodeType ? nodeType.hasCapability(capability) : false;
  }

  /**
   * Get all capabilities for a node type
   * @param {string} typeId - The node type ID
   * @returns {string[]} Array of capability names
   */
  getTypeCapabilities(typeId) {
    const nodeType = this.getNodeType(typeId);
    return nodeType ? nodeType.getCapabilities() : [];
  }

  /**
   * Validate a node configuration against its type profile
   * @param {string} typeId - The node type ID
   * @param {Object} nodeConfig - The node configuration to validate
   * @returns {Object} Validation result with isValid and errors array
   */
  validateNodeConfig(typeId, nodeConfig) {
    const nodeType = this.getNodeType(typeId);

    if (!nodeType) {
      return {
        isValid: false,
        errors: [`Unknown node type: ${typeId}`]
      };
    }

    return nodeType.validateNodeConfig(nodeConfig);
  }

  /**
   * Get the economic complexity level for a node type
   * @param {string} typeId - The node type ID
   * @returns {string} Economic complexity level
   */
  getEconomicComplexity(typeId) {
    const nodeType = this.getNodeType(typeId);
    return nodeType ? nodeType.getEconomicComplexity() : 'none';
  }

  /**
   * Get the political complexity level for a node type
   * @param {string} typeId - The node type ID
   * @returns {string} Political complexity level
   */
  getPoliticalComplexity(typeId) {
    const nodeType = this.getNodeType(typeId);
    return nodeType ? nodeType.getPoliticalComplexity() : 'none';
  }

  /**
   * Get the social complexity level for a node type
   * @param {string} typeId - The node type ID
   * @returns {string} Social complexity level
   */
  getSocialComplexity(typeId) {
    const nodeType = this.getNodeType(typeId);
    return nodeType ? nodeType.getSocialComplexity() : 'none';
  }

  /**
   * Check if a node type can produce a specific resource
   * @param {string} typeId - The node type ID
   * @param {string} resourceType - The resource type
   * @returns {boolean} True if the type can produce the resource
   */
  canProduceResource(typeId, resourceType) {
    const nodeType = this.getNodeType(typeId);
    return nodeType ? nodeType.canProduceResource(resourceType) : false;
  }

  /**
   * Check if a node type can consume a specific resource
   * @param {string} typeId - The node type ID
   * @param {string} resourceType - The resource type
   * @returns {boolean} True if the type can consume the resource
   */
  canConsumeResource(typeId, resourceType) {
    const nodeType = this.getNodeType(typeId);
    return nodeType ? nodeType.canConsumeResource(resourceType) : false;
  }

  /**
   * Get node types that have a specific capability
   * @param {string} capability - The capability to search for
   * @returns {NodeTypeProfile[]} Array of node types with the capability
   */
  getTypesWithCapability(capability) {
    return this.getAllNodeTypes().filter(type => type.hasCapability(capability));
  }

  /**
   * Create a custom node type profile
   * @param {Object} config - Configuration for the custom type
   * @returns {NodeTypeProfile} The created node type profile
   */
  createCustomNodeType(config) {
    const nodeType = new NodeTypeProfile(config);
    this.registerNodeType(nodeType);
    return nodeType;
  }

  /**
   * Get a summary of all node types and their capabilities
   * @returns {Object} Summary object with type information
   */
  getNodeTypeSummary() {
    const summary = {};

    for (const [id, type] of this.nodeTypes) {
      summary[id] = {
        name: type.name,
        description: type.description,
        capabilities: type.getCapabilities(),
        economicComplexity: type.getEconomicComplexity(),
        politicalComplexity: type.getPoliticalComplexity(),
        socialComplexity: type.getSocialComplexity(),
        resourceProfile: type.resourceProfile,
        specialMechanics: type.specialMechanics
      };
    }

    return summary;
  }
}

export default NodeTypeService;