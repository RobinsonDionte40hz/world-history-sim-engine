// src/domain/services/EnvironmentalCalculationService.js

import { TerrainTypes } from '../../shared/constants/TerrainTypes.js';
import { ClimateTypes } from '../../shared/constants/ClimateTypes.js';
import { LightingTypes } from '../../shared/constants/LightingTypes.js';
import { HazardTypes, getHazardBaseDanger } from '../../shared/constants/HazardTypes.js';

/**
 * EnvironmentalCalculationService provides centralized calculations for environmental effects
 * This service handles danger calculations, environmental modifiers, and population capacity
 * based on node environmental properties and interaction types.
 */
class EnvironmentalCalculationService {
  
  /**
   * Calculates the environmental danger level for a node
   * @param {Node} node - The node to calculate danger for
   * @returns {number} Danger level from 0.0 to 1.0
   */
  static calculateDanger(node) {
    if (!node || !node.environment) {
      return 0;
    }

    let danger = 0;
    
    // Base danger from node type
    const typeDanger = {
      'wilderness': 0.3,
      'dungeon': 0.6,
      'settlement': 0.1,
      'landmark': 0.2,
      'resource': 0.25,
      'sacred': 0.15,
      'location': 0.1 // Default type
    };
    
    danger += typeDanger[node.type] || 0.1;
    
    // Add hazard danger - each hazard contributes based on its type and severity
    if (node.environment.hazards && node.environment.hazards.length > 0) {
      const hazardDanger = node.environment.hazards.reduce((total, hazard) => {
        const baseDanger = getHazardBaseDanger(hazard.type);
        return total + (baseDanger * hazard.severity);
      }, 0);
      danger += Math.min(0.5, hazardDanger); // Cap hazard contribution at 0.5
    }
    
    // Environmental factors
    if (node.environment.shelterQuality < 0.3) {
      danger += 0.2;
    }
    if (node.environment.airQuality < 0.4) {
      danger += 0.15;
    }
    if (node.environment.waterAvailability < 0.3) {
      danger += 0.25;
    }
    
    // Climate extremes
    if (node.environment.climate === ClimateTypes.ARCTIC) {
      danger += 0.2;
    }
    if (node.environment.climate === ClimateTypes.ARID) {
      danger += 0.15;
    }
    
    // Lighting conditions
    if (node.environment.lighting === LightingTypes.DARK) {
      danger += 0.2;
    }
    if (node.environment.lighting === LightingTypes.DIM) {
      danger += 0.1;
    }
    
    // Temperature extremes
    if (node.environment.temperature < -20 || node.environment.temperature > 45) {
      danger += 0.15;
    }
    
    // Population density can increase danger in some cases
    const density = node.getPopulationDensity ? node.getPopulationDensity() : 0;
    if (density > 0.9) {
      danger += 0.1; // Overcrowding increases danger
    }
    
    return Math.min(1.0, danger);
  }

  /**
   * Gets environmental modifiers for different interaction types
   * @param {Node} node - The node to get modifiers for
   * @param {string} interactionType - Type of interaction (combat, social, stealth, etc.)
   * @returns {Object} Environmental modifiers
   */
  static getModifiers(node, interactionType) {
    if (!node || !node.environment) {
      return {};
    }

    const modifiers = {};
    
    // Get base environmental modifiers
    const terrainMods = this._getTerrainModifiers(node.environment.terrain);
    const climateMods = this._getClimateModifiers(node.environment.climate);
    const lightingMods = this._getLightingModifiers(node.environment.lighting);
    
    // Combine base modifiers
    Object.assign(modifiers, terrainMods, climateMods, lightingMods);
    
    // Apply interaction-specific modifiers
    const interactionMods = this._getInteractionModifiers(node, interactionType);
    Object.assign(modifiers, interactionMods);
    
    // Apply density-based modifiers
    const densityMods = this._getDensityModifiers(node.environment.density, interactionType);
    Object.assign(modifiers, densityMods);
    
    // Apply hazard-based modifiers
    const hazardMods = this._getHazardModifiers(node.environment.hazards, interactionType);
    Object.assign(modifiers, hazardMods);
    
    return modifiers;
  }

  /**
   * Gets terrain-specific modifiers
   * @param {string} terrain - Terrain type
   * @returns {Object} Terrain modifiers
   * @private
   */
  static _getTerrainModifiers(terrain) {
    const terrainModifiers = {
      [TerrainTypes.PLAINS]: { 
        movement: 1.2, 
        visibility: 1.2,
        ranged_combat: 1.1
      },
      [TerrainTypes.FOREST]: { 
        stealth: 1.3, 
        movement: 0.8, 
        visibility: 0.7,
        survival: 1.2,
        ranged_combat: 0.8
      },
      [TerrainTypes.MOUNTAINS]: { 
        movement: 0.6, 
        defense: 1.4, 
        visibility: 1.5,
        ranged_combat: 1.3,
        climbing: 1.5
      },
      [TerrainTypes.DESERT]: { 
        movement: 0.7, 
        survival: 0.6, 
        visibility: 1.3,
        constitution_checks: 0.8,
        water_consumption: 1.5
      },
      [TerrainTypes.SWAMP]: { 
        movement: 0.5, 
        disease_resistance: 0.7, 
        stealth: 1.2,
        constitution_checks: 0.9,
        navigation: 0.7
      },
      [TerrainTypes.URBAN]: { 
        social: 1.2, 
        information: 1.4, 
        stealth: 0.8,
        commerce: 1.3,
        law_enforcement: 1.2
      },
      [TerrainTypes.RUINS]: {
        exploration: 1.3,
        stealth: 1.1,
        structural_danger: 0.7,
        archaeology: 1.5
      },
      [TerrainTypes.UNDERGROUND]: {
        movement: 0.8,
        visibility: 0.6,
        stealth: 1.1,
        claustrophobia_checks: 0.8
      },
      [TerrainTypes.COASTAL]: {
        movement: 1.0,
        swimming: 1.3,
        navigation: 1.2,
        fishing: 1.4
      },
      [TerrainTypes.TUNDRA]: {
        movement: 0.7,
        survival: 0.6,
        constitution_checks: 0.7,
        visibility: 1.1
      }
    };
    
    return terrainModifiers[terrain] || {};
  }

  /**
   * Gets climate-specific modifiers
   * @param {string} climate - Climate type
   * @returns {Object} Climate modifiers
   * @private
   */
  static _getClimateModifiers(climate) {
    const climateModifiers = {
      [ClimateTypes.ARCTIC]: { 
        constitution_checks: 0.8, 
        survival: 0.7, 
        movement: 0.8,
        cold_resistance: 1.2,
        heat_vulnerability: 0.6
      },
      [ClimateTypes.TROPICAL]: { 
        disease_resistance: 0.8, 
        plant_knowledge: 1.2,
        heat_resistance: 1.1,
        humidity_tolerance: 0.9
      },
      [ClimateTypes.ARID]: { 
        survival: 0.7, 
        constitution_checks: 0.9, 
        visibility: 1.2,
        water_conservation: 1.3,
        heat_resistance: 1.1
      },
      [ClimateTypes.TEMPERATE]: { 
        // Balanced climate - no significant modifiers
        adaptability: 1.1
      },
      [ClimateTypes.SUBTROPICAL]: {
        disease_resistance: 0.9,
        plant_knowledge: 1.1,
        humidity_tolerance: 1.0
      },
      [ClimateTypes.CONTINENTAL]: {
        temperature_adaptation: 1.2,
        seasonal_awareness: 1.1
      }
    };
    
    return climateModifiers[climate] || {};
  }

  /**
   * Gets lighting condition modifiers
   * @param {string} lighting - Lighting type
   * @returns {Object} Lighting modifiers
   * @private
   */
  static _getLightingModifiers(lighting) {
    const lightingModifiers = {
      [LightingTypes.BRIGHT]: { 
        visibility: 1.3, 
        stealth: 0.7,
        accuracy: 1.1,
        morale: 1.1
      },
      [LightingTypes.NORMAL]: { 
        // Standard lighting - no modifiers
      },
      [LightingTypes.DIM]: { 
        visibility: 0.8, 
        stealth: 1.2,
        accuracy: 0.9,
        fear_checks: 0.9
      },
      [LightingTypes.DARK]: { 
        visibility: 0.4, 
        stealth: 1.5, 
        fear_checks: 0.8,
        accuracy: 0.7,
        navigation: 0.6
      },
      [LightingTypes.MAGICAL]: { 
        magic_checks: 1.2, 
        perception: 1.1,
        supernatural_awareness: 1.3,
        visibility: 1.1
      }
    };
    
    return lightingModifiers[lighting] || {};
  }

  /**
   * Gets interaction-type-specific modifiers
   * @param {Node} node - The node
   * @param {string} interactionType - Type of interaction
   * @returns {Object} Interaction-specific modifiers
   * @private
   */
  static _getInteractionModifiers(node, interactionType) {
    const modifiers = {};
    
    switch (interactionType) {
      case 'combat':
        // Terrain affects combat
        if (node.environment.terrain === TerrainTypes.MOUNTAINS) {
          modifiers.ranged_attacks = 1.2;
          modifiers.high_ground_advantage = 1.3;
        }
        if (node.environment.terrain === TerrainTypes.FOREST) {
          modifiers.melee_combat = 1.1;
          modifiers.ranged_attacks = 0.8;
        }
        if (node.environment.terrain === TerrainTypes.SWAMP) {
          modifiers.movement_in_combat = 0.6;
          modifiers.footing = 0.8;
        }
        
        // Lighting affects combat accuracy
        if (node.environment.lighting === LightingTypes.DARK) {
          modifiers.accuracy = 0.7;
          modifiers.surprise_attacks = 1.3;
        }
        
        // Density affects combat space
        if (node.environment.density > 0.8) {
          modifiers.area_attacks = 1.2;
          modifiers.movement_in_combat = 0.8;
        }
        break;
        
      case 'social':
        // Urban environments enhance social interactions
        if (node.type === 'settlement' || node.environment.terrain === TerrainTypes.URBAN) {
          modifiers.persuasion = 1.1;
          modifiers.information_gathering = 1.2;
        }
        
        // Density affects social dynamics
        if (node.environment.density > 0.8) {
          modifiers.intimidation = 0.8; // Harder to intimidate in crowds
          modifiers.crowd_manipulation = 1.2;
        } else if (node.environment.density < 0.3) {
          modifiers.privacy = 1.3;
          modifiers.intimate_conversation = 1.2;
        }
        
        // Lighting affects social comfort
        if (node.environment.lighting === LightingTypes.DIM) {
          modifiers.secretive_conversations = 1.2;
        }
        break;
        
      case 'stealth':
        // Already handled in terrain/lighting modifiers, but add specific combinations
        if (node.environment.terrain === TerrainTypes.URBAN && node.environment.lighting === LightingTypes.DIM) {
          modifiers.urban_stealth = 1.3;
        }
        if (node.environment.terrain === TerrainTypes.FOREST && node.environment.lighting === LightingTypes.DARK) {
          modifiers.wilderness_stealth = 1.4;
        }
        break;
        
      case 'survival':
        // Environmental factors heavily affect survival
        if (node.environment.waterAvailability < 0.3) {
          modifiers.water_finding = 0.6;
        }
        if (node.environment.shelterQuality < 0.3) {
          modifiers.shelter_building = 0.7;
        }
        break;
        
      case 'exploration':
        // Visibility and terrain affect exploration
        if (node.environment.terrain === TerrainTypes.RUINS) {
          modifiers.archaeological_discovery = 1.3;
        }
        if (node.environment.lighting === LightingTypes.DARK) {
          modifiers.exploration_speed = 0.7;
          modifiers.hidden_discovery = 1.2;
        }
        break;
        
      case 'magic':
        // Magical lighting enhances magic
        if (node.environment.lighting === LightingTypes.MAGICAL) {
          modifiers.spell_power = 1.2;
          modifiers.mana_regeneration = 1.1;
        }
        
        // Some terrains affect magic
        if (node.environment.terrain === TerrainTypes.RUINS) {
          modifiers.ancient_magic = 1.3;
        }
        break;
        
      default:
        // No specific modifiers for unknown interaction types
        break;
    }
    
    return modifiers;
  }

  /**
   * Gets density-based modifiers
   * @param {number} density - Population/object density (0.0 to 1.0)
   * @param {string} interactionType - Type of interaction
   * @returns {Object} Density modifiers
   * @private
   */
  static _getDensityModifiers(density, interactionType) {
    const modifiers = {};
    
    if (density > 0.8) {
      // High density
      modifiers.crowd_navigation = 0.8;
      modifiers.privacy = 0.6;
      if (interactionType === 'social') {
        modifiers.audience_effects = 1.2;
      }
    } else if (density < 0.2) {
      // Low density
      modifiers.isolation_effects = 1.1;
      modifiers.echo_effects = 1.2;
      if (interactionType === 'stealth') {
        modifiers.open_ground_stealth = 0.7;
      }
    }
    
    return modifiers;
  }

  /**
   * Gets hazard-based modifiers
   * @param {Array} hazards - Array of environmental hazards
   * @param {string} interactionType - Type of interaction
   * @returns {Object} Hazard modifiers
   * @private
   */
  static _getHazardModifiers(hazards, interactionType) {
    const modifiers = {};
    
    if (!Array.isArray(hazards) || hazards.length === 0) {
      return modifiers;
    }
    
    hazards.forEach(hazard => {
      switch (hazard.type) {
        case HazardTypes.EXTREME_HEAT:
          modifiers.constitution_checks = (modifiers.constitution_checks || 1.0) * (1 - hazard.severity * 0.3);
          modifiers.endurance = (modifiers.endurance || 1.0) * (1 - hazard.severity * 0.4);
          break;
          
        case HazardTypes.EXTREME_COLD:
          modifiers.constitution_checks = (modifiers.constitution_checks || 1.0) * (1 - hazard.severity * 0.3);
          modifiers.dexterity_checks = (modifiers.dexterity_checks || 1.0) * (1 - hazard.severity * 0.2);
          break;
          
        case HazardTypes.TOXIC_AIR:
          modifiers.constitution_checks = (modifiers.constitution_checks || 1.0) * (1 - hazard.severity * 0.4);
          modifiers.perception = (modifiers.perception || 1.0) * (1 - hazard.severity * 0.2);
          break;
          
        case HazardTypes.SUPERNATURAL:
          modifiers.fear_checks = (modifiers.fear_checks || 1.0) * (1 - hazard.severity * 0.3);
          modifiers.sanity_checks = (modifiers.sanity_checks || 1.0) * (1 - hazard.severity * 0.4);
          break;
          
        case HazardTypes.WILD_ANIMALS:
          modifiers.stealth = (modifiers.stealth || 1.0) * (1 - hazard.severity * 0.2);
          modifiers.survival = (modifiers.survival || 1.0) * (1 + hazard.severity * 0.1);
          break;
          
        case HazardTypes.BANDITS:
          modifiers.alertness = (modifiers.alertness || 1.0) * (1 + hazard.severity * 0.2);
          modifiers.trust_interactions = (modifiers.trust_interactions || 1.0) * (1 - hazard.severity * 0.3);
          break;
          
        default:
          // Unknown hazard type - apply generic negative modifier
          modifiers.general_safety = (modifiers.general_safety || 1.0) * (1 - hazard.severity * 0.1);
          break;
      }
    });
    
    return modifiers;
  }

  /**
   * Calculates population capacity based on environmental factors
   * @param {Node} node - The node to calculate capacity for
   * @returns {number} Maximum sustainable population
   */
  static calculatePopulationCapacity(node) {
    if (!node || !node.environment) {
      return node?.size || 100;
    }

    let baseCapacity = node.size || 100;
    
    // Environmental factors
    baseCapacity *= Math.max(0.1, node.environment.shelterQuality);
    baseCapacity *= Math.max(0.1, node.environment.waterAvailability);
    baseCapacity *= Math.max(0.1, node.environment.airQuality);
    
    // Hazard reduction
    if (node.environment.hazards && node.environment.hazards.length > 0) {
      const hazardReduction = node.environment.hazards.reduce((total, hazard) => {
        return total + (hazard.severity * 0.1);
      }, 0);
      baseCapacity *= Math.max(0.1, 1 - Math.min(0.8, hazardReduction));
    }
    
    // Climate adjustments
    const climateMultipliers = {
      [ClimateTypes.TEMPERATE]: 1.0,
      [ClimateTypes.SUBTROPICAL]: 0.95,
      [ClimateTypes.TROPICAL]: 0.9,
      [ClimateTypes.CONTINENTAL]: 0.85,
      [ClimateTypes.ARID]: 0.6,
      [ClimateTypes.ARCTIC]: 0.4
    };
    
    baseCapacity *= climateMultipliers[node.environment.climate] || 1.0;
    
    // Terrain adjustments
    const terrainMultipliers = {
      [TerrainTypes.URBAN]: 1.5,
      [TerrainTypes.PLAINS]: 1.2,
      [TerrainTypes.COASTAL]: 1.1,
      [TerrainTypes.FOREST]: 1.0,
      [TerrainTypes.RUINS]: 0.8,
      [TerrainTypes.MOUNTAINS]: 0.7,
      [TerrainTypes.TUNDRA]: 0.6,
      [TerrainTypes.DESERT]: 0.5,
      [TerrainTypes.SWAMP]: 0.4,
      [TerrainTypes.UNDERGROUND]: 0.3
    };
    
    baseCapacity *= terrainMultipliers[node.environment.terrain] || 1.0;
    
    // Temperature extremes reduce capacity
    if (node.environment.temperature < -20 || node.environment.temperature > 45) {
      baseCapacity *= 0.7;
    } else if (node.environment.temperature < -10 || node.environment.temperature > 35) {
      baseCapacity *= 0.85;
    }
    
    // Lighting affects capacity (very dark places are harder to inhabit)
    if (node.environment.lighting === LightingTypes.DARK) {
      baseCapacity *= 0.8;
    } else if (node.environment.lighting === LightingTypes.BRIGHT) {
      baseCapacity *= 1.1;
    }
    
    return Math.floor(Math.max(1, baseCapacity));
  }

  /**
   * Calculates comfort level for characters in the environment
   * @param {Node} node - The node to calculate comfort for
   * @returns {number} Comfort level from 0.0 to 1.0
   */
  static calculateComfortLevel(node) {
    if (!node || !node.environment) {
      return 0.5;
    }

    return node.environment.getComfortLevel();
  }

  /**
   * Determines if an environment is suitable for a specific activity
   * @param {Node} node - The node to check
   * @param {string} activityType - Type of activity
   * @returns {boolean} True if environment supports the activity
   */
  static supportsActivity(node, activityType) {
    if (!node || !node.environment) {
      return true; // Default to allowing activities
    }

    return node.environment.supportsActivity(activityType);
  }

  /**
   * Gets a summary of all environmental effects for a node
   * @param {Node} node - The node to analyze
   * @returns {Object} Summary of environmental effects
   */
  static getEnvironmentalSummary(node) {
    if (!node || !node.environment) {
      return {
        danger: 0,
        comfort: 0.5,
        capacity: 100,
        hospitable: true,
        majorFactors: []
      };
    }

    const danger = this.calculateDanger(node);
    const comfort = this.calculateComfortLevel(node);
    const capacity = this.calculatePopulationCapacity(node);
    const hospitable = node.environment.isHospitable();
    
    const majorFactors = [];
    
    // Identify major environmental factors
    if (danger > 0.5) {
      majorFactors.push('High danger level');
    }
    if (comfort < 0.3) {
      majorFactors.push('Low comfort level');
    }
    if (node.environment.hazards && node.environment.hazards.length > 0) {
      majorFactors.push(`${node.environment.hazards.length} environmental hazard(s)`);
    }
    if (node.environment.waterAvailability < 0.3) {
      majorFactors.push('Limited water availability');
    }
    if (node.environment.shelterQuality < 0.3) {
      majorFactors.push('Poor shelter quality');
    }
    
    return {
      danger,
      comfort,
      capacity,
      hospitable,
      majorFactors
    };
  }
}

export default EnvironmentalCalculationService;