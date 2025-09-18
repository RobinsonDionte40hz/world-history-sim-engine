// src/infrastructure/persistence/LocalStorageWorldRepository.js

import IWorldRepository from '../../application/use-cases/ports/IWorldRepository.js';
import Character from '../../domain/entities/Character.js';
import Node from '../../domain/entities/Node.js';
import NodeMigrationService from '../../domain/services/NodeMigrationService.js';
import DataStructureUtils from '../../shared/utils/DataStructureUtils.js';

// Simple compression utility for localStorage quota management
const CompressionUtils = {
  // Compress data by removing redundant properties and using shorter keys
  compress: (data) => {
    const compressed = { ...data };

    // Compress nodes
    if (compressed.nodes) {
      compressed.nodes = compressed.nodes.map(node => {
        const compressedNode = { ...node };
        // Remove redundant or large properties that can be reconstructed
        if (compressedNode.description && compressedNode.description.length > 200) {
          compressedNode.desc = compressedNode.description.substring(0, 200) + '...';
          delete compressedNode.description;
        }
        // Compress environment data
        if (compressedNode.environment) {
          compressedNode.env = {
            t: compressedNode.environment.terrain,
            c: compressedNode.environment.climate,
            l: compressedNode.environment.lighting,
            d: compressedNode.environment.density,
            s: compressedNode.environment.shelterQuality,
            w: compressedNode.environment.waterAvailability,
            a: compressedNode.environment.airQuality,
            h: compressedNode.environment.hazards
          };
          delete compressedNode.environment;
        }
        return compressedNode;
      });
    }

    // Compress characters - keep only essential data
    if (compressed.characters) {
      compressed.characters = compressed.characters.map(char => ({
        id: char.id,
        n: char.name, // name
        lod: char.lodTier,
        node: char.currentNodeId,
        attrs: char.attributes,
        cons: char.consciousness,
        assign: char.assignments,
        // Keep only essential properties
        ...Object.fromEntries(
          Object.entries(char).filter(([key]) =>
            ['id', 'name', 'lodTier', 'currentNodeId', 'attributes', 'consciousness', 'assignments'].includes(key) ||
            key.startsWith('player') // Keep player interaction data
          )
        )
      }));
    }

    // Compress settlements - remove detailed building data
    if (compressed.settlements) {
      compressed.settlements = compressed.settlements.map(settlement => ({
        id: settlement.id,
        n: settlement.name,
        t: settlement.type,
        pop: settlement.population,
        gov: settlement.government,
        econ: settlement.economy,
        cult: settlement.culture,
        // Keep essential properties only
        ...Object.fromEntries(
          Object.entries(settlement).filter(([key]) =>
            ['id', 'name', 'type', 'population', 'government', 'economy', 'culture'].includes(key)
          )
        )
      }));
    }

    // Compress interactions - keep only essential data
    if (compressed.interactions) {
      compressed.interactions = compressed.interactions.slice(-50); // Keep only last 50 interactions
    }

    return compressed;
  },

  // Decompress data back to original format
  decompress: (compressed) => {
    const data = { ...compressed };

    // Decompress nodes
    if (data.nodes) {
      data.nodes = data.nodes.map(node => {
        const decompressedNode = { ...node };
        // Restore description
        if (decompressedNode.desc) {
          decompressedNode.description = decompressedNode.desc;
          delete decompressedNode.desc;
        }
        // Restore environment
        if (decompressedNode.env) {
          decompressedNode.environment = {
            terrain: decompressedNode.env.t,
            climate: decompressedNode.env.c,
            lighting: decompressedNode.env.l,
            density: decompressedNode.env.d,
            shelterQuality: decompressedNode.env.s,
            waterAvailability: decompressedNode.env.w,
            airQuality: decompressedNode.env.a,
            hazards: decompressedNode.env.h
          };
          delete decompressedNode.env;
        }
        return decompressedNode;
      });
    }

    // Decompress characters
    if (data.characters) {
      data.characters = data.characters.map(char => ({
        ...char,
        name: char.n || char.name,
        currentNodeId: char.node || char.currentNodeId,
        attributes: char.attrs || char.attributes,
        consciousness: char.cons || char.consciousness,
        assignments: char.assign || char.assignments,
        // Remove compressed keys
        ...Object.fromEntries(
          Object.entries(char).filter(([key]) => !['n', 'node', 'attrs', 'cons', 'assign'].includes(key))
        )
      }));
    }

    // Decompress settlements
    if (data.settlements) {
      data.settlements = data.settlements.map(settlement => ({
        ...settlement,
        name: settlement.n || settlement.name,
        type: settlement.t || settlement.type,
        population: settlement.pop || settlement.population,
        government: settlement.gov || settlement.government,
        economy: settlement.econ || settlement.economy,
        culture: settlement.cult || settlement.culture,
        // Remove compressed keys
        ...Object.fromEntries(
          Object.entries(settlement).filter(([key]) => !['n', 't', 'pop', 'gov', 'econ', 'cult'].includes(key))
        )
      }));
    }

    return data;
  }
};

const LocalStorageWorldRepository = {
  saveWorld: async (worldState) => {
    try {
      // Ensure data is in Array format for storage
      const arrayData = DataStructureUtils.ensureArrayStructure(worldState);

      // Compress the data to reduce storage size
      const compressedData = CompressionUtils.compress(arrayData);

      const stateToSave = {
        time: compressedData.time,
        nodes: compressedData.nodes ? compressedData.nodes.map(node => {
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
        npcs: compressedData.npcs ? compressedData.npcs.map(npc => npc.toJSON ? npc.toJSON() : npc) : [],
        characters: compressedData.characters ? compressedData.characters.map(char => char.toJSON ? char.toJSON() : char) : [],
        interactions: compressedData.interactions ? compressedData.interactions.map(int => int.toJSON ? int.toJSON() : int) : [],
        settlements: compressedData.settlements ? compressedData.settlements.map(set => set.toJSON ? set.toJSON() : set) : [],
        resources: compressedData.resources,
        // Preserve additional world state properties
        ...compressedData
      };

      // Try to save with compression
      const jsonString = JSON.stringify(stateToSave);

      // Check if the data is too large and implement fallback strategies
      if (jsonString.length > 4 * 1024 * 1024) { // 4MB threshold
        console.warn('World state is very large, implementing size reduction strategies...');

        // Strategy 1: Reduce interaction history
        if (stateToSave.interactions && stateToSave.interactions.length > 20) {
          stateToSave.interactions = stateToSave.interactions.slice(-20);
          console.log('Reduced interactions to last 20 entries');
        }

        // Strategy 2: Reduce character detail for background characters
        if (stateToSave.characters) {
          stateToSave.characters = stateToSave.characters.map(char => {
            if (char.lodTier === 'background') {
              // Keep only essential data for background characters
              return {
                id: char.id,
                name: char.name,
                lodTier: char.lodTier,
                currentNodeId: char.currentNodeId,
                assignments: char.assignments
              };
            }
            return char;
          });
        }

        // Strategy 3: Compress further by removing non-essential properties
        const minimalState = {
          time: stateToSave.time,
          nodes: stateToSave.nodes.map(node => ({
            id: node.id,
            name: node.name,
            type: node.type,
            environment: node.environment,
            population: node.population
          })),
          characters: stateToSave.characters,
          settlements: stateToSave.settlements?.slice(0, 10) || [], // Limit settlements
          resources: stateToSave.resources
        };

        localStorage.setItem('worldState', JSON.stringify(minimalState));
        console.log('Saved minimal world state to avoid quota exceeded error');
      } else {
        localStorage.setItem('worldState', jsonString);
      }

      return Promise.resolve();
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Implementing emergency cleanup...');

        // Emergency strategy: Save only essential data
        try {
          const emergencyState = {
            time: worldState.time || 0,
            nodes: worldState.nodes?.slice(0, 5) || [], // Keep only first 5 nodes
            characters: worldState.characters?.slice(0, 10) || [], // Keep only first 10 characters
            resources: worldState.resources || {}
          };

          localStorage.setItem('worldState', JSON.stringify(emergencyState));
          console.log('Emergency save completed with minimal data');
          return Promise.resolve();
        } catch (emergencyError) {
          console.error('Emergency save also failed:', emergencyError);
          // Clear storage as last resort
          localStorage.removeItem('worldState');
          console.log('Cleared world state due to persistent quota issues');
          return Promise.reject(new Error('Storage quota exceeded - cleared world state'));
        }
      }

      console.error('Failed to save world state:', error);
      return Promise.reject(error);
    }
  },

  getWorld: async () => {
    try {
      const savedState = JSON.parse(localStorage.getItem('worldState') || '{}');
      if (savedState.time !== undefined) {
        // Decompress the data back to original format
        const decompressedData = CompressionUtils.decompress(savedState);

        return {
          time: decompressedData.time,
          nodes: decompressedData.nodes.map(nodeData => {
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
          npcs: decompressedData.npcs?.map(npcData => {
            try {
              return new Character(npcData);
            } catch (error) {
              console.warn('Failed to create Character entity, using plain object:', error);
              return npcData;
            }
          }) || [],
          characters: decompressedData.characters?.map(charData => {
            try {
              return new Character(charData);
            } catch (error) {
              console.warn('Failed to create Character entity, using plain object:', error);
              return charData;
            }
          }) || [],
          interactions: decompressedData.interactions || [],
          settlements: decompressedData.settlements || [],
          resources: decompressedData.resources,
          // Preserve additional world state properties
          ...decompressedData
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to load world state from localStorage:', error);
      // Return null if data is corrupted
      return null;
    }
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