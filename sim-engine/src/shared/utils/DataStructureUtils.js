// src/shared/utils/DataStructureUtils.js

// Import Character for proper instance handling
import Character from '../../domain/entities/Character.js';

/**
 * DataStructureUtils - Centralized utilities for consistent Map/Array handling
 * 
 * Provides standardized conversion between Maps and Arrays for world data structures.
 * Ensures consistent data handling across the entire simulation pipeline.
 */
class DataStructureUtils {
  /**
   * Convert arrays to Maps for simulation-ready data
   * Used by: DemoService, WorldContext, any service providing data to SimulationContext
   */
  static ensureMapStructure(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data structure: expected object');
    }

    const result = { ...data };

    // Convert nodes array to Map
    if (data.nodes && Array.isArray(data.nodes)) {
      result.nodes = new Map();
      data.nodes.forEach(node => {
        if (!node.id) {
          throw new Error('Node missing required id property');
        }
        result.nodes.set(node.id, node);
      });
    } else if (data.nodes && !(data.nodes instanceof Map)) {
      throw new Error('Nodes must be an Array or Map');
    }

    // Convert characters array to Map
    if (data.characters && Array.isArray(data.characters)) {
      result.characters = new Map();
      data.characters.forEach(character => {
        if (!character.id) {
          throw new Error('Character missing required id property');
        }
        
        // Ensure character is a proper Character instance
        let characterInstance = character;
        if (!(character instanceof Character)) {
          try {
            characterInstance = Character.fromJSON(character);
            console.log(`DataStructureUtils: Converted ${character.name} to Character instance`);
          } catch (error) {
            console.warn(`DataStructureUtils: Failed to convert ${character.name || character.id} to Character instance:`, error);
            // Fall back to the original object if conversion fails
            characterInstance = character;
          }
        }
        
        result.characters.set(character.id, characterInstance);
      });
    } else if (data.characters instanceof Map) {
      // Ensure Map values are proper Character instances
      result.characters = new Map();
      data.characters.forEach((character, id) => {
        let characterInstance = character;
        if (!(character instanceof Character)) {
          try {
            characterInstance = Character.fromJSON(character);
            // Only log individual conversions for small datasets or development
            const shouldLog = data.characters.size <= 10 || process.env.NODE_ENV === 'development';
            if (shouldLog) {
              console.log(`DataStructureUtils: Converted Map character ${character.name} to Character instance`);
            }
          } catch (error) {
            console.warn(`DataStructureUtils: Failed to convert Map character ${character.name || id} to Character instance:`, error);
            // Fall back to the original object if conversion fails
            characterInstance = character;
          }
        }
        result.characters.set(id, characterInstance);
      });
    } else if (data.characters && !(data.characters instanceof Map)) {
      throw new Error('Characters must be an Array or Map');
    }

    // Convert interactions array to Map
    if (data.interactions && Array.isArray(data.interactions)) {
      result.interactions = new Map();
      data.interactions.forEach(interaction => {
        if (!interaction.id) {
          throw new Error('Interaction missing required id property');
        }
        result.interactions.set(interaction.id, interaction);
      });
    } else if (data.interactions && !(data.interactions instanceof Map)) {
      throw new Error('Interactions must be an Array or Map');
    }

    // Convert settlements array to Map
    if (data.settlements && Array.isArray(data.settlements)) {
      result.settlements = new Map();
      data.settlements.forEach(settlement => {
        if (!settlement.id) {
          throw new Error('Settlement missing required id property');
        }
        result.settlements.set(settlement.id, settlement);
      });
    } else if (data.settlements && !(data.settlements instanceof Map)) {
      throw new Error('Settlements must be an Array or Map');
    }

    return result;
  }

  /**
   * Convert Maps to arrays for storage/serialization
   * Used by: LocalStorageWorldRepository, any service that needs to serialize data
   */
  static ensureArrayStructure(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data structure: expected object');
    }

    const result = { ...data };

    // Convert nodes Map to Array
    if (data.nodes instanceof Map) {
      result.nodes = Array.from(data.nodes.values());
    } else if (data.nodes && !Array.isArray(data.nodes)) {
      throw new Error('Nodes must be a Map or Array');
    }

    // Convert characters Map to Array
    if (data.characters instanceof Map) {
      result.characters = Array.from(data.characters.values()).map(character => {
        // Ensure character is a proper Character instance
        if (!(character instanceof Character)) {
          try {
            const characterInstance = Character.fromJSON(character);
            // Only log individual conversions for small datasets or development
            const shouldLog = data.characters.size <= 10 || process.env.NODE_ENV === 'development';
            if (shouldLog) {
              console.log(`DataStructureUtils: Converted ${character.name} to Character instance during array conversion`);
            }
            return characterInstance;
          } catch (error) {
            console.warn(`DataStructureUtils: Failed to convert ${character.name || character.id} to Character instance:`, error);
            // Fall back to the original object if conversion fails
            return character;
          }
        }
        return character;
      });
    } else if (data.characters && !Array.isArray(data.characters)) {
      throw new Error('Characters must be a Map or Array');
    }

    // Convert interactions Map to Array
    if (data.interactions instanceof Map) {
      result.interactions = Array.from(data.interactions.values());
    } else if (data.interactions && !Array.isArray(data.interactions)) {
      throw new Error('Interactions must be a Map or Array');
    }

    // Convert settlements Map to Array
    if (data.settlements instanceof Map) {
      result.settlements = Array.from(data.settlements.values());
    } else if (data.settlements && !Array.isArray(data.settlements)) {
      throw new Error('Settlements must be a Map or Array');
    }

    return result;
  }

  /**
   * Check if data structure uses Maps (simulation-ready format)
   */
  static isMapStructure(data) {
    if (!data || typeof data !== 'object') return false;
    
    const hasMapNodes = data.nodes instanceof Map;
    const hasMapCharacters = data.characters instanceof Map;
    const hasMapInteractions = data.interactions instanceof Map;
    
    return hasMapNodes || hasMapCharacters || hasMapInteractions;
  }

  /**
   * Check if data structure uses Arrays (storage-ready format)
   */
  static isArrayStructure(data) {
    if (!data || typeof data !== 'object') return false;
    
    const hasArrayNodes = Array.isArray(data.nodes);
    const hasArrayCharacters = Array.isArray(data.characters);
    const hasArrayInteractions = Array.isArray(data.interactions);
    
    return hasArrayNodes || hasArrayCharacters || hasArrayInteractions;
  }

  /**
   * Validate that data structure is consistent (all Maps or all Arrays)
   */
  static validateStructureConsistency(data) {
    if (!data || typeof data !== 'object') {
      return { isValid: false, error: 'Invalid data structure: expected object' };
    }

    const mapCount = [
      data.nodes instanceof Map,
      data.characters instanceof Map,
      data.interactions instanceof Map,
      data.settlements instanceof Map
    ].filter(Boolean).length;

    const arrayCount = [
      Array.isArray(data.nodes),
      Array.isArray(data.characters),
      Array.isArray(data.interactions),
      Array.isArray(data.settlements)
    ].filter(Boolean).length;

    const totalStructures = mapCount + arrayCount;

    if (mapCount > 0 && arrayCount > 0) {
      return {
        isValid: false,
        error: `Inconsistent data structures: ${mapCount} Maps and ${arrayCount} Arrays. Use DataStructureUtils.ensureMapStructure() or ensureArrayStructure().`,
        mapCount,
        arrayCount
      };
    }

    if (totalStructures === 0) {
      return {
        isValid: false,
        error: 'No valid data structures found (nodes, characters, interactions, settlements)',
        mapCount: 0,
        arrayCount: 0
      };
    }

    return {
      isValid: true,
      structure: mapCount > 0 ? 'Map' : 'Array',
      mapCount,
      arrayCount
    };
  }

  /**
   * Convert world data to the appropriate format for a specific service
   */
  static formatForService(data, serviceName) {
    switch (serviceName) {
      case 'SimulationService':
      case 'SimulationContext':
        return this.ensureMapStructure(data);
      
      case 'LocalStorageWorldRepository':
      case 'WorldSaveManager':
      case 'storage':
        return this.ensureArrayStructure(data);
      
      case 'DemoService':
        // DemoService can handle both, but should output Maps for simulation
        return this.ensureMapStructure(data);
      
      case 'WorldContext':
        // WorldContext typically works with Arrays for configurations
        return this.ensureArrayStructure(data);
      
      default:
        throw new Error(`Unknown service: ${serviceName}. Use 'SimulationService', 'LocalStorageWorldRepository', 'DemoService', or 'WorldContext'`);
    }
  }

  /**
   * Create a summary report of data structure usage
   * Useful for debugging data structure inconsistencies
   */
  static getStructureReport(data) {
    if (!data || typeof data !== 'object') {
      return { error: 'Invalid data structure' };
    }

    return {
      nodes: {
        type: data.nodes instanceof Map ? 'Map' : Array.isArray(data.nodes) ? 'Array' : 'Other',
        count: data.nodes instanceof Map ? data.nodes.size : Array.isArray(data.nodes) ? data.nodes.length : 0
      },
      characters: {
        type: data.characters instanceof Map ? 'Map' : Array.isArray(data.characters) ? 'Array' : 'Other',
        count: data.characters instanceof Map ? data.characters.size : Array.isArray(data.characters) ? data.characters.length : 0
      },
      interactions: {
        type: data.interactions instanceof Map ? 'Map' : Array.isArray(data.interactions) ? 'Array' : 'Other',
        count: data.interactions instanceof Map ? data.interactions.size : Array.isArray(data.interactions) ? data.interactions.length : 0
      },
      settlements: {
        type: data.settlements instanceof Map ? 'Map' : Array.isArray(data.settlements) ? 'Array' : 'Other',
        count: data.settlements instanceof Map ? data.settlements.size : Array.isArray(data.settlements) ? data.settlements.length : 0
      },
      consistency: this.validateStructureConsistency(data)
    };
  }
}

export default DataStructureUtils;