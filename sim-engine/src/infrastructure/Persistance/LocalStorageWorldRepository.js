// src/infrastructure/persistence/LocalStorageWorldRepository.js

import IWorldRepository from '../../application/use-cases/ports/IWorldRepository.js';
import Character from '../../domain/entities/Character.js';
import Node from '../../domain/entities/Node.js';
import NodeMigrationService from '../../domain/services/NodeMigrationService.js';
import DataStructureUtils from '../../shared/utils/DataStructureUtils.js';

const LocalStorageWorldRepository = {
  saveWorld: async (worldState) => {
    // Ensure data is in Array format for storage
    const arrayData = DataStructureUtils.ensureArrayStructure(worldState);
    
    const stateToSave = {
      time: arrayData.time,
      nodes: arrayData.nodes ? arrayData.nodes.map(node => {
        // Handle both enhanced Node entities and plain objects
        if (node instanceof Node) {
          return node.toJSON();
        } else if (node && typeof node === 'object') {
          // Ensure environmental data is preserved
          return {
            id: node.id,
            name: node.name,
            description: node.description,
            type: node.type,
            position: node.position?.toJSON ? node.position.toJSON() : node.position,
            environment: node.environment?.toJSON ? node.environment.toJSON() : node.environment,
            size: node.size,
            population: node.population,
            connections: node.connections?.map(conn => 
              conn?.toJSON ? conn.toJSON() : conn
            ) || [],
            // Preserve all other properties
            ...node
          };
        }
        return node;
      }) : [],
      npcs: arrayData.npcs ? arrayData.npcs.map(npc => npc.toJSON ? npc.toJSON() : npc) : [],
      characters: arrayData.characters ? arrayData.characters.map(char => char.toJSON ? char.toJSON() : char) : [],
      interactions: arrayData.interactions ? arrayData.interactions.map(int => int.toJSON ? int.toJSON() : int) : [],
      settlements: arrayData.settlements ? arrayData.settlements.map(set => set.toJSON ? set.toJSON() : set) : [],
      resources: arrayData.resources,
      // Preserve additional world state properties
      ...arrayData
    };
    localStorage.setItem('worldState', JSON.stringify(stateToSave));
    return Promise.resolve();
  },

  getWorld: async () => {
    const savedState = JSON.parse(localStorage.getItem('worldState') || '{}');
    if (savedState.time !== undefined) {
      return {
        time: savedState.time,
        nodes: savedState.nodes.map(nodeData => {
          try {
            // Try to create enhanced Node entity
            if (nodeData.environment || nodeData.connections) {
              // Already has environmental data
              return Node.fromJSON(nodeData);
            } else {
              // Migrate old node format
              const migratedData = NodeMigrationService.migrateExistingNode(nodeData);
              return Node.fromJSON(migratedData);
            }
          } catch (error) {
            console.warn('Failed to create Node entity, falling back to migrated plain object:', error);
            console.warn('Node data that failed:', JSON.stringify(nodeData, null, 2));
            // Fallback to migrated plain object (no Position in mapless architecture)
            try {
              const migratedData = NodeMigrationService.migrateExistingNode(nodeData);
              return migratedData;
            } catch (migrationError) {
              console.warn('Migration also failed, using basic fallback:', migrationError);
              return {
                id: nodeData.id || `node_${Date.now()}`,
                name: nodeData.name || 'Unnamed Node',
                description: nodeData.description || '',
                type: nodeData.type || 'location',
                environment: {
                  terrain: 'plains',
                  climate: 'temperate',
                  lighting: 'normal',
                  density: 0.5,
                  shelterQuality: 0.5,
                  waterAvailability: 0.5,
                  airQuality: 0.8,
                  hazards: []
                },
                size: 100,
                population: 0,
                connections: [],
                resources: [],
                ...nodeData
              };
            }
          }
        }),
        npcs: savedState.npcs.map(npcData => {
          try {
            return new Character(npcData);
          } catch (error) {
            console.warn('Failed to create Character entity, using plain object:', error);
            return npcData;
          }
        }),
        resources: savedState.resources,
        // Preserve additional world state properties
        ...savedState
      };
    }
    return null;
  },

  updateNode: async (node) => {
    const world = await this.getWorld();
    if (world) {
      const index = world.nodes.findIndex(n => n.id === node.id);
      if (index >= 0) {
        // Ensure we store the enhanced node data
        world.nodes[index] = node instanceof Node ? node : Node.fromJSON(node);
      }
      await this.saveWorld(world);
    }
    return Promise.resolve();
  },

  /**
   * Migrates all nodes in storage to enhanced environmental format
   * @returns {Promise<boolean>} Success status
   */
  migrateNodesToEnvironmentalFormat: async () => {
    try {
      const world = await LocalStorageWorldRepository.getWorld();
      if (!world) return false;

      // Migrate all nodes
      world.nodes = world.nodes.map(nodeData => {
        if (nodeData instanceof Node) {
          return nodeData;
        }
        
        try {
          const migratedData = NodeMigrationService.migrateExistingNode(nodeData);
          return Node.fromJSON(migratedData);
        } catch (error) {
          console.warn('Failed to migrate node:', nodeData.id, error);
          return nodeData; // Keep original if migration fails
        }
      });

      await LocalStorageWorldRepository.saveWorld(world);
      return true;
    } catch (error) {
      console.error('Failed to migrate nodes to environmental format:', error);
      return false;
    }
  },

  /**
   * Validates environmental data integrity in storage
   * @returns {Promise<Object>} Validation report
   */
  validateEnvironmentalData: async () => {
    try {
      const world = await LocalStorageWorldRepository.getWorld();
      if (!world) {
        return { valid: false, error: 'No world data found' };
      }

      const report = {
        valid: true,
        totalNodes: world.nodes.length,
        enhancedNodes: 0,
        legacyNodes: 0,
        errors: []
      };

      world.nodes.forEach((node, index) => {
        if (node instanceof Node || (node.environment && node.connections)) {
          report.enhancedNodes++;
        } else {
          report.legacyNodes++;
        }

        // Check for environmental data integrity
        if (node.environment && typeof node.environment !== 'object') {
          report.errors.push(`Node ${index}: Invalid environment data type`);
          report.valid = false;
        }

        if (node.connections && !Array.isArray(node.connections)) {
          report.errors.push(`Node ${index}: Invalid connections data type`);
          report.valid = false;
        }
      });

      return report;
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        totalNodes: 0,
        enhancedNodes: 0,
        legacyNodes: 0,
        errors: [error.message]
      };
    }
  },

  /**
   * Clear all simulation state from localStorage to prevent contamination
   * Use this when switching between worlds or resetting simulation
   * @returns {Promise<void>}
   */
  clearSimulationState: async () => {
    try {
      localStorage.removeItem('worldState');
      console.log('Cleared simulation state from localStorage');
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to clear simulation state from localStorage:', error);
      return Promise.reject(error);
    }
  }
};

const WorldRepositoryService = { ...IWorldRepository, ...LocalStorageWorldRepository };

export default WorldRepositoryService;