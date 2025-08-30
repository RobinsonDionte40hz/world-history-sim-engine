// src/domain/services/EnvironmentalPresetService.js

import { TerrainTypes, isValidTerrainType } from '../../shared/constants/TerrainTypes.js';
import { ClimateTypes, isValidClimateType } from '../../shared/constants/ClimateTypes.js';
import { LightingTypes, isValidLightingType } from '../../shared/constants/LightingTypes.js';
import { HazardTypes } from '../../shared/constants/HazardTypes.js';
import EnvironmentalHazard from '../entities/EnvironmentalHazard.js';
import Environment from '../value-objects/Environment.js';
import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * EnvironmentalPresetService provides predefined environmental configurations
 * and manages custom preset creation for rapid world building.
 */
class EnvironmentalPresetService {
  /**
   * Gets all available environmental presets
   * @returns {Object} Object containing all preset definitions
   * @static
   */
  static getPresets() {
    return {
      'forest_village': {
        id: 'forest_village',
        name: 'Forest Village',
        description: 'A peaceful settlement nestled in the woods with clean air and abundant water',
        category: 'settlement',
        environment: {
          density: 0.6,
          terrain: TerrainTypes.FOREST,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.DIM,
          hazards: [],
          shelterQuality: 0.7,
          airQuality: 0.9,
          waterAvailability: 0.8,
          temperature: 15,
          humidity: 0.6,
          windStrength: 0.2
        },
        nodeProperties: {
          type: 'settlement',
          size: 150
        }
      },

      'mountain_fortress': {
        id: 'mountain_fortress',
        name: 'Mountain Fortress',
        description: 'A fortified stronghold high in the mountains with excellent defenses but challenging conditions',
        category: 'settlement',
        environment: {
          density: 0.3,
          terrain: TerrainTypes.MOUNTAINS,
          climate: ClimateTypes.CONTINENTAL,
          lighting: LightingTypes.BRIGHT,
          hazards: [
            { type: HazardTypes.ALTITUDE, severity: 0.3, description: 'High altitude effects including thin air' }
          ],
          shelterQuality: 0.9,
          airQuality: 0.95,
          waterAvailability: 0.6,
          temperature: 5,
          humidity: 0.4,
          windStrength: 0.6
        },
        nodeProperties: {
          type: 'settlement',
          size: 80
        }
      },

      'desert_oasis': {
        id: 'desert_oasis',
        name: 'Desert Oasis',
        description: 'A life-giving oasis in the harsh desert, providing water and shelter from the heat',
        category: 'landmark',
        environment: {
          density: 0.8,
          terrain: TerrainTypes.DESERT,
          climate: ClimateTypes.ARID,
          lighting: LightingTypes.BRIGHT,
          hazards: [
            { type: HazardTypes.EXTREME_HEAT, severity: 0.4, description: 'Scorching desert heat during the day' }
          ],
          shelterQuality: 0.4,
          airQuality: 0.7,
          waterAvailability: 0.9,
          temperature: 35,
          humidity: 0.2,
          windStrength: 0.4
        },
        nodeProperties: {
          type: 'landmark',
          size: 60
        }
      },

      'haunted_ruins': {
        id: 'haunted_ruins',
        name: 'Haunted Ruins',
        description: 'Ancient ruins filled with supernatural dangers and structural instability',
        category: 'dungeon',
        environment: {
          density: 0.2,
          terrain: TerrainTypes.RUINS,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.DIM,
          hazards: [
            { type: HazardTypes.SUPERNATURAL, severity: 0.6, description: 'Ghostly apparitions and dark magic' },
            { type: HazardTypes.STRUCTURAL_INSTABILITY, severity: 0.3, description: 'Crumbling walls and unstable floors' }
          ],
          shelterQuality: 0.3,
          airQuality: 0.6,
          waterAvailability: 0.4,
          temperature: 12,
          humidity: 0.7,
          windStrength: 0.3
        },
        nodeProperties: {
          type: 'dungeon',
          size: 40
        }
      },

      'swamp_settlement': {
        id: 'swamp_settlement',
        name: 'Swamp Settlement',
        description: 'A hardy community built on stilts in the dangerous marshlands',
        category: 'settlement',
        environment: {
          density: 0.4,
          terrain: TerrainTypes.SWAMP,
          climate: ClimateTypes.SUBTROPICAL,
          lighting: LightingTypes.DIM,
          hazards: [
            { type: HazardTypes.DISEASE, severity: 0.4, description: 'Waterborne illnesses and parasites' },
            { type: HazardTypes.WILD_ANIMALS, severity: 0.3, description: 'Dangerous swamp creatures' }
          ],
          shelterQuality: 0.5,
          airQuality: 0.5,
          waterAvailability: 0.9,
          temperature: 25,
          humidity: 0.9,
          windStrength: 0.1
        },
        nodeProperties: {
          type: 'settlement',
          size: 90
        }
      },

      'arctic_outpost': {
        id: 'arctic_outpost',
        name: 'Arctic Outpost',
        description: 'A remote outpost in the frozen wasteland, built to withstand extreme cold',
        category: 'settlement',
        environment: {
          density: 0.2,
          terrain: TerrainTypes.TUNDRA,
          climate: ClimateTypes.ARCTIC,
          lighting: LightingTypes.DIM,
          hazards: [
            { type: HazardTypes.EXTREME_COLD, severity: 0.7, description: 'Life-threatening freezing temperatures' }
          ],
          shelterQuality: 0.8,
          airQuality: 0.95,
          waterAvailability: 0.3,
          temperature: -15,
          humidity: 0.3,
          windStrength: 0.8
        },
        nodeProperties: {
          type: 'settlement',
          size: 50
        }
      },

      'coastal_port': {
        id: 'coastal_port',
        name: 'Coastal Port',
        description: 'A bustling port town with fresh sea air and maritime commerce',
        category: 'settlement',
        environment: {
          density: 0.8,
          terrain: TerrainTypes.COASTAL,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.NORMAL,
          hazards: [],
          shelterQuality: 0.6,
          airQuality: 0.8,
          waterAvailability: 0.7,
          temperature: 18,
          humidity: 0.7,
          windStrength: 0.5
        },
        nodeProperties: {
          type: 'settlement',
          size: 200
        }
      },

      'underground_city': {
        id: 'underground_city',
        name: 'Underground City',
        description: 'A vast subterranean metropolis carved from living rock',
        category: 'settlement',
        environment: {
          density: 0.9,
          terrain: TerrainTypes.UNDERGROUND,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.MAGICAL,
          hazards: [
            { type: HazardTypes.STRUCTURAL_INSTABILITY, severity: 0.2, description: 'Occasional cave-ins and rockfalls' }
          ],
          shelterQuality: 0.8,
          airQuality: 0.6,
          waterAvailability: 0.5,
          temperature: 12,
          humidity: 0.8,
          windStrength: 0.1
        },
        nodeProperties: {
          type: 'settlement',
          size: 300
        }
      },

      'toxic_wasteland': {
        id: 'toxic_wasteland',
        name: 'Toxic Wasteland',
        description: 'A poisoned landscape where few dare to tread',
        category: 'wilderness',
        environment: {
          density: 0.1,
          terrain: TerrainTypes.DESERT,
          climate: ClimateTypes.ARID,
          lighting: LightingTypes.DIM,
          hazards: [
            { type: HazardTypes.TOXIC_AIR, severity: 0.8, description: 'Poisonous gases and contaminated air' },
            { type: HazardTypes.RADIATION, severity: 0.6, description: 'Magical radiation from ancient disasters' }
          ],
          shelterQuality: 0.1,
          airQuality: 0.2,
          waterAvailability: 0.1,
          temperature: 30,
          humidity: 0.2,
          windStrength: 0.4
        },
        nodeProperties: {
          type: 'wilderness',
          size: 20
        }
      },

      'magical_grove': {
        id: 'magical_grove',
        name: 'Magical Grove',
        description: 'An enchanted forest clearing where magic flows freely',
        category: 'landmark',
        environment: {
          density: 0.3,
          terrain: TerrainTypes.FOREST,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.MAGICAL,
          hazards: [
            { type: HazardTypes.SUPERNATURAL, severity: 0.3, description: 'Unpredictable magical effects' }
          ],
          shelterQuality: 0.6,
          airQuality: 0.95,
          waterAvailability: 0.9,
          temperature: 20,
          humidity: 0.6,
          windStrength: 0.2
        },
        nodeProperties: {
          type: 'landmark',
          size: 30
        }
      }
    };
  }

  /**
   * Gets a specific preset by ID
   * @param {string} presetId - The ID of the preset to retrieve
   * @returns {Object|null} The preset object or null if not found
   * @static
   */
  static getPreset(presetId) {
    const presets = this.getPresets();
    return presets[presetId] || null;
  }

  /**
   * Gets all presets of a specific category
   * @param {string} category - The category to filter by
   * @returns {Array} Array of preset objects matching the category
   * @static
   */
  static getPresetsByCategory(category) {
    const presets = this.getPresets();
    return Object.values(presets).filter(preset => preset.category === category);
  }

  /**
   * Gets all available preset categories
   * @returns {Array<string>} Array of unique category names
   * @static
   */
  static getPresetCategories() {
    const presets = this.getPresets();
    const categories = new Set();
    Object.values(presets).forEach(preset => categories.add(preset.category));
    return Array.from(categories).sort();
  }

  /**
   * Applies a preset to node configuration data
   * @param {Object} nodeData - Existing node data to enhance
   * @param {string} presetId - ID of the preset to apply
   * @param {Object} [overrides={}] - Optional property overrides
   * @returns {Object} Enhanced node data with preset applied
   * @static
   */
  static applyPreset(nodeData, presetId, overrides = {}) {
    const preset = this.getPreset(presetId);
    if (!preset) {
      throw new ValidationError('presetId', presetId, `Unknown preset: ${presetId}`);
    }

    // Create hazard instances from preset hazard data
    const hazards = preset.environment.hazards.map(hazardData => 
      new EnvironmentalHazard(hazardData)
    );

    // Create environment with preset data and hazards
    const environmentData = {
      ...preset.environment,
      hazards: hazards,
      ...overrides.environment
    };

    // Merge node data with preset, preserving user data where specified
    const enhancedNodeData = {
      ...preset.nodeProperties,
      ...nodeData,
      name: nodeData.name || preset.name,
      description: nodeData.description || preset.description,
      environment: environmentData,
      ...overrides
    };

    // Ensure environment overrides don't create nested environment objects
    if (overrides.environment) {
      enhancedNodeData.environment = {
        ...environmentData,
        ...overrides.environment
      };
    }

    return enhancedNodeData;
  }

  /**
   * Creates a custom preset from node configuration
   * @param {string} name - Name for the custom preset
   * @param {string} description - Description of the preset
   * @param {Object} nodeData - Node data to create preset from
   * @param {string} [category='custom'] - Category for the preset
   * @returns {Object} Custom preset object
   * @static
   */
  static createCustomPreset(name, description, nodeData, category = 'custom') {
    if (!name || typeof name !== 'string') {
      throw new ValidationError('name', name, 'Preset name is required and must be a string');
    }

    if (!description || typeof description !== 'string') {
      throw new ValidationError('description', description, 'Preset description is required and must be a string');
    }

    if (!nodeData || typeof nodeData !== 'object') {
      throw new ValidationError('nodeData', nodeData, 'Node data is required and must be an object');
    }

    // Validate that nodeData has required environmental properties
    this.validatePresetData(nodeData);

    // Generate a unique ID for the custom preset
    const id = this._generatePresetId(name);

    // Extract environment data, handling both Environment instances and plain objects
    let environmentData;
    if (nodeData.environment instanceof Environment) {
      environmentData = nodeData.environment.toJSON();
    } else if (nodeData.environment && typeof nodeData.environment === 'object') {
      environmentData = { ...nodeData.environment };
      
      // Convert hazard instances to JSON if present
      if (Array.isArray(environmentData.hazards)) {
        environmentData.hazards = environmentData.hazards.map(hazard => 
          hazard instanceof EnvironmentalHazard ? hazard.toJSON() : hazard
        );
      }
    } else {
      throw new ValidationError('nodeData.environment', nodeData.environment, 'Node data must include environment properties');
    }

    // Create the custom preset
    const customPreset = {
      id: id,
      name: name,
      description: description,
      category: category,
      environment: environmentData,
      nodeProperties: {
        type: nodeData.type || 'location',
        size: nodeData.size || 100
      },
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    return customPreset;
  }

  /**
   * Validates preset data to ensure all required environmental properties are included
   * @param {Object} presetData - The preset data to validate
   * @throws {ValidationError} If validation fails
   * @static
   */
  static validatePresetData(presetData) {
    if (!presetData || typeof presetData !== 'object') {
      throw new ValidationError('presetData', presetData, 'Preset data must be an object');
    }

    // Check for environment object
    if (!presetData.environment || typeof presetData.environment !== 'object') {
      throw new ValidationError('presetData.environment', presetData.environment, 'Preset must include environment properties');
    }

    const env = presetData.environment;
    const requiredProperties = [
      'density', 'terrain', 'climate', 'lighting', 'shelterQuality',
      'airQuality', 'waterAvailability', 'temperature', 'humidity', 'windStrength'
    ];

    const missingProperties = [];
    
    for (const prop of requiredProperties) {
      if (env[prop] === undefined || env[prop] === null) {
        missingProperties.push(prop);
      }
    }

    if (missingProperties.length > 0) {
      throw new ValidationError(
        'environment', 
        env, 
        `Missing required environmental properties: ${missingProperties.join(', ')}`
      );
    }

    // Validate property ranges
    const rangeProperties = [
      { name: 'density', min: 0, max: 1 },
      { name: 'shelterQuality', min: 0, max: 1 },
      { name: 'airQuality', min: 0, max: 1 },
      { name: 'waterAvailability', min: 0, max: 1 },
      { name: 'humidity', min: 0, max: 1 },
      { name: 'windStrength', min: 0, max: 1 },
      { name: 'temperature', min: -50, max: 60 }
    ];

    for (const { name, min, max } of rangeProperties) {
      const value = env[name];
      if (typeof value !== 'number' || value < min || value > max) {
        throw new ValidationError(
          `environment.${name}`, 
          value, 
          `${name} must be a number between ${min} and ${max}`
        );
      }
    }

    // Validate enum properties
    if (!isValidTerrainType(env.terrain)) {
      throw new ValidationError('environment.terrain', env.terrain, 'Invalid terrain type');
    }

    if (!isValidClimateType(env.climate)) {
      throw new ValidationError('environment.climate', env.climate, 'Invalid climate type');
    }

    if (!isValidLightingType(env.lighting)) {
      throw new ValidationError('environment.lighting', env.lighting, 'Invalid lighting type');
    }

    // Validate hazards array if present
    if (env.hazards && !Array.isArray(env.hazards)) {
      throw new ValidationError('environment.hazards', env.hazards, 'Hazards must be an array');
    }
  }

  /**
   * Generates a unique ID for a custom preset
   * @param {string} name - The preset name
   * @returns {string} A unique preset ID
   * @private
   * @static
   */
  static _generatePresetId(name) {
    const sanitizedName = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 20); // Limit length
    
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    
    return `custom_${sanitizedName}_${timestamp}_${random}`;
  }

  /**
   * Validates that a preset can be applied to a node
   * @param {Object} nodeData - The node data to validate
   * @param {string} presetId - The preset ID to check compatibility
   * @returns {Object} Validation result with isValid boolean and errors array
   * @static
   */
  static validatePresetCompatibility(nodeData, presetId) {
    const errors = [];
    
    try {
      const preset = this.getPreset(presetId);
      if (!preset) {
        errors.push(`Preset '${presetId}' not found`);
        return { isValid: false, errors };
      }

      // Check if node data structure is compatible
      if (!nodeData || typeof nodeData !== 'object') {
        errors.push('Node data must be an object');
      }

      // Warn about potential conflicts
      if (nodeData.environment && typeof nodeData.environment === 'object') {
        const conflictingProperties = [];
        const nodeEnv = nodeData.environment;
        const presetEnv = preset.environment;
        
        // Check for significant differences that might indicate conflicts
        if (nodeEnv.terrain && nodeEnv.terrain !== presetEnv.terrain) {
          conflictingProperties.push('terrain');
        }
        if (nodeEnv.climate && nodeEnv.climate !== presetEnv.climate) {
          conflictingProperties.push('climate');
        }
        
        if (conflictingProperties.length > 0) {
          errors.push(`Preset may conflict with existing ${conflictingProperties.join(', ')} settings`);
        }
      }

    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Gets preset recommendations based on node properties
   * @param {Object} nodeData - The node data to analyze
   * @returns {Array} Array of recommended preset IDs with scores
   * @static
   */
  static getPresetRecommendations(nodeData) {
    const presets = this.getPresets();
    const recommendations = [];

    for (const [presetId, preset] of Object.entries(presets)) {
      let score = 0;

      // Score based on node type compatibility
      if (nodeData.type && preset.nodeProperties.type === nodeData.type) {
        score += 30;
      }

      // Score based on existing environment properties
      if (nodeData.environment) {
        const nodeEnv = nodeData.environment;
        const presetEnv = preset.environment;

        if (nodeEnv.terrain === presetEnv.terrain) score += 20;
        if (nodeEnv.climate === presetEnv.climate) score += 15;
        if (nodeEnv.lighting === presetEnv.lighting) score += 10;

        // Score based on similar property ranges
        const rangeProperties = ['density', 'shelterQuality', 'airQuality', 'waterAvailability'];
        for (const prop of rangeProperties) {
          if (nodeEnv[prop] !== undefined) {
            const diff = Math.abs(nodeEnv[prop] - presetEnv[prop]);
            if (diff < 0.2) score += 5;
          }
        }
      }

      if (score > 0) {
        recommendations.push({
          presetId: presetId,
          preset: preset,
          score: score,
          reason: this._generateRecommendationReason(nodeData, preset, score)
        });
      }
    }

    // Sort by score descending and return top 5
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  /**
   * Generates a human-readable reason for a preset recommendation
   * @param {Object} nodeData - The node data
   * @param {Object} preset - The preset being recommended
   * @param {number} score - The recommendation score
   * @returns {string} Human-readable recommendation reason
   * @private
   * @static
   */
  static _generateRecommendationReason(nodeData, preset, score) {
    const reasons = [];

    if (nodeData.type && preset.nodeProperties.type === nodeData.type) {
      reasons.push(`matches ${nodeData.type} type`);
    }

    if (nodeData.environment) {
      const nodeEnv = nodeData.environment;
      const presetEnv = preset.environment;

      if (nodeEnv.terrain === presetEnv.terrain) {
        reasons.push(`compatible ${presetEnv.terrain} terrain`);
      }
      if (nodeEnv.climate === presetEnv.climate) {
        reasons.push(`similar ${presetEnv.climate} climate`);
      }
    }

    if (reasons.length === 0) {
      return 'general compatibility';
    }

    return reasons.join(', ');
  }
}

export default EnvironmentalPresetService;