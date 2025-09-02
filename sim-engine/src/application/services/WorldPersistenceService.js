/**
 * WorldPersistenceService - Enhanced save/load functionality for worlds and nodes
 * 
 * Provides comprehensive persistence capabilities for world data, nodes, characters,
 * interactions, and encounters with versioning, validation, and error handling.
 * 
 * Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 8.1, 8.2, 8.3, 8.4
 */

import { EventEmitter } from 'events';
import NodeMigrationService from '../../domain/services/NodeMigrationService.js';
import Node from '../../domain/entities/Node.js';

class WorldPersistenceService extends EventEmitter {
  constructor() {
    super();
    
    this.storageKeys = {
      WORLDS: 'worldHistorySimulator_worlds',
      WORLD_PREFIX: 'worldHistorySimulator_world_',
      NODES_PREFIX: 'worldHistorySimulator_nodes_',
      CHARACTERS_PREFIX: 'worldHistorySimulator_characters_',
      INTERACTIONS_PREFIX: 'worldHistorySimulator_interactions_',
      ENCOUNTERS_PREFIX: 'worldHistorySimulator_encounters_',
      METADATA: 'worldHistorySimulator_metadata'
    };

    this.currentVersion = '1.0.0';
    
    // Define version migration chain
    this.supportedVersions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0'];
    this.migrationMethods = new Map([
      ['1.0.0->1.1.0', this.migrateV1_0_to_V1_1.bind(this)],
      ['1.1.0->1.2.0', this.migrateV1_1_to_V1_2.bind(this)],
      ['1.2.0->2.0.0', this.migrateV1_2_to_V2_0.bind(this)]
    ]);
  }

  /**
   * Compare two version strings
   * @param {string} version1 - First version
   * @param {string} version2 - Second version  
   * @returns {number} -1 if version1 < version2, 0 if equal, 1 if version1 > version2
   */
  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }

  /**
   * Check if version is supported
   * @param {string} version - Version to check
   * @returns {boolean} True if version is supported
   */
  isVersionSupported(version) {
    return this.supportedVersions.includes(version) || 
           this.compareVersions(version, this.currentVersion) <= 0;
  }

  /**
   * Migrate data from v1.0.0 to v1.1.0
   * @param {Object} data - Data to migrate
   * @returns {Object} Migrated data
   */
  migrateV1_0_to_V1_1(data) {
    console.log('Migrating data from v1.0.0 to v1.1.0');
    
    const migratedData = { ...data };
    
    // Add new fields introduced in v1.1.0
    if (!migratedData.metadata) {
      migratedData.metadata = {
        createdAt: migratedData.lastModified || new Date().toISOString(),
        updatedAt: migratedData.lastModified || new Date().toISOString(),
        migrationHistory: []
      };
    }
    
    // Ensure characters have proper structure
    if (migratedData.characters) {
      migratedData.characters = migratedData.characters.map(character => ({
        ...character,
        version: '1.1.0',
        personality: character.personality || {},
        relationships: character.relationships || []
      }));
    }
    
    // Ensure nodes have proper structure
    if (migratedData.nodes) {
      migratedData.nodes = migratedData.nodes.map(node => ({
        ...node,
        version: '1.1.0',
        connections: node.connections || [],
        properties: node.properties || {}
      }));
    }
    
    migratedData.version = '1.1.0';
    migratedData.metadata.migrationHistory.push({
      from: '1.0.0',
      to: '1.1.0',
      migratedAt: new Date().toISOString(),
      changes: ['Added metadata structure', 'Enhanced character structure', 'Enhanced node structure']
    });
    
    return migratedData;
  }

  /**
   * Migrate data from v1.1.0 to v1.2.0
   * @param {Object} data - Data to migrate
   * @returns {Object} Migrated data
   */
  migrateV1_1_to_V1_2(data) {
    console.log('Migrating data from v1.1.0 to v1.2.0');
    
    const migratedData = { ...data };
    
    // Add interactions structure if missing
    if (!migratedData.interactions) {
      migratedData.interactions = [];
    }
    
    // Add encounters structure if missing
    if (!migratedData.encounters) {
      migratedData.encounters = [];
    }
    
    // Enhance characters with interaction references
    if (migratedData.characters) {
      migratedData.characters = migratedData.characters.map(character => ({
        ...character,
        version: '1.2.0',
        interactionIds: character.interactionIds || [],
        encounterIds: character.encounterIds || [],
        attributes: character.attributes || {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        }
      }));
    }
    
    // Enhance nodes with population data
    if (migratedData.nodes) {
      migratedData.nodes = migratedData.nodes.map(node => ({
        ...node,
        version: '1.2.0',
        population: node.population || 0,
        resources: node.resources || {},
        events: node.events || []
      }));
    }
    
    migratedData.version = '1.2.0';
    migratedData.metadata.migrationHistory.push({
      from: '1.1.0',
      to: '1.2.0',
      migratedAt: new Date().toISOString(),
      changes: ['Added interactions structure', 'Added encounters structure', 'Enhanced character attributes', 'Enhanced node population data']
    });
    
    return migratedData;
  }

  /**
   * Migrate data from v1.2.0 to v2.0.0
   * @param {Object} data - Data to migrate
   * @returns {Object} Migrated data
   */
  migrateV1_2_to_V2_0(data) {
    console.log('Migrating data from v1.2.0 to v2.0.0');
    
    const migratedData = { ...data };
    
    // Major restructuring for v2.0.0
    // Add new simulation engine capabilities
    if (!migratedData.simulationConfig) {
      migratedData.simulationConfig = {
        turnBasedMode: true,
        timeScale: 'days',
        autoAdvance: false,
        pauseOnEvents: true
      };
    }
    
    // Add world-level rules
    if (!migratedData.worldRules) {
      migratedData.worldRules = {
        economicSystem: 'basic',
        politicalSystem: 'feudal',
        magicSystem: 'none',
        technology: 'medieval'
      };
    }
    
    // Restructure characters for new system
    if (migratedData.characters) {
      migratedData.characters = migratedData.characters.map(character => ({
        ...character,
        version: '2.0.0',
        consciousness: character.consciousness || {
          frequency: 50,
          coherence: 0.5
        },
        goals: character.goals || [],
        memory: character.memory || {
          shortTerm: [],
          longTerm: []
        }
      }));
    }
    
    // Enhanced node migration with environmental data
    if (migratedData.nodes) {
      migratedData.nodes = migratedData.nodes.map(nodeData => {
        try {
          // Use NodeMigrationService to add environmental properties
          const migratedNode = NodeMigrationService.migrateExistingNode(nodeData);
          
          // Add v2.0.0 specific enhancements
          return {
            ...migratedNode,
            version: '2.0.0',
            settlementType: migratedNode.settlementType || migratedNode.type || 'village',
            governance: migratedNode.governance || {
              type: 'local',
              ruler: null,
              laws: []
            },
            economy: migratedNode.economy || {
              primaryIndustry: 'agriculture',
              wealth: 'poor',
              tradeRoutes: []
            }
          };
        } catch (error) {
          console.warn(`Failed to migrate node ${nodeData.id || 'unknown'} to environmental format:`, error);
          // Fallback to basic migration
          return {
            ...nodeData,
            version: '2.0.0',
            settlementType: nodeData.settlementType || nodeData.type || 'village',
            governance: nodeData.governance || {
              type: 'local',
              ruler: null,
              laws: []
            },
            economy: nodeData.economy || {
              primaryIndustry: 'agriculture',
              wealth: 'poor',
              tradeRoutes: []
            }
          };
        }
      });
    }
    
    migratedData.version = '2.0.0';
    migratedData.metadata.migrationHistory.push({
      from: '1.2.0',
      to: '2.0.0',
      migratedAt: new Date().toISOString(),
      changes: [
        'Added simulation configuration',
        'Added world rules system',
        'Enhanced character consciousness and goals',
        'Added settlement governance and economy',
        'Migrated nodes to environmental format'
      ]
    });
    
    return migratedData;
  }

  /**
   * Migrate data through version chain to current version
   * @param {Object} data - Data to migrate
   * @returns {Object} Migrated data at current version
   */
  migrateToCurrentVersion(data) {
    if (!data) {
      throw new Error('Data is required for migration');
    }
    
    let currentData = { ...data };
    const dataVersion = currentData.version || '1.0.0';
    
    // If already at current version, return as-is
    if (this.compareVersions(dataVersion, this.currentVersion) === 0) {
      return currentData;
    }
    
    // If data is newer than current version, warn but don't migrate
    if (this.compareVersions(dataVersion, this.currentVersion) > 0) {
      console.warn(`Data version ${dataVersion} is newer than current version ${this.currentVersion}. No migration performed.`);
      return currentData;
    }
    
    // Check if version is supported
    if (!this.isVersionSupported(dataVersion)) {
      throw new Error(`Unsupported data version: ${dataVersion}. Supported versions: ${this.supportedVersions.join(', ')}`);
    }
    
    console.log(`Starting migration from ${dataVersion} to ${this.currentVersion}`);
    
    // Find migration path
    const migrationPath = this.findMigrationPath(dataVersion, this.currentVersion);
    if (!migrationPath) {
      throw new Error(`No migration path found from ${dataVersion} to ${this.currentVersion}`);
    }
    
    // Apply migrations in sequence
    for (const migrationKey of migrationPath) {
      const migrationMethod = this.migrationMethods.get(migrationKey);
      if (!migrationMethod) {
        throw new Error(`Migration method not found for ${migrationKey}`);
      }
      
      try {
        currentData = migrationMethod(currentData);
        console.log(`Successfully applied migration: ${migrationKey}`);
      } catch (error) {
        throw new Error(`Migration failed at ${migrationKey}: ${error.message}`);
      }
    }
    
    // Ensure final version is set
    currentData.version = this.currentVersion;
    currentData.lastModified = new Date().toISOString();
    
    if (!currentData.metadata) {
      currentData.metadata = {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        migrationHistory: []
      };
    }
    
    currentData.metadata.updatedAt = new Date().toISOString();
    
    console.log(`Migration completed successfully to version ${this.currentVersion}`);
    this.emit('dataMigrated', {
      from: dataVersion,
      to: this.currentVersion,
      migrationPath,
      data: currentData
    });
    
    return currentData;
  }

  /**
   * Find migration path between two versions
   * @param {string} fromVersion - Starting version
   * @param {string} toVersion - Target version
   * @returns {Array|null} Array of migration keys or null if no path found
   */
  findMigrationPath(fromVersion, toVersion) {
    const sortedVersions = this.supportedVersions.sort((a, b) => this.compareVersions(a, b));
    const fromIndex = sortedVersions.indexOf(fromVersion);
    const toIndex = sortedVersions.indexOf(toVersion);
    
    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
      return null;
    }
    
    const migrationPath = [];
    for (let i = fromIndex; i < toIndex; i++) {
      const migrationKey = `${sortedVersions[i]}->${sortedVersions[i + 1]}`;
      migrationPath.push(migrationKey);
    }
    
    return migrationPath;
  }

  /**
   * Migrate individual data item (character, node, interaction, encounter)
   * @param {Object} dataItem - Data item to migrate
   * @param {string} itemType - Type of data item (character, node, interaction, encounter)
   * @returns {Object} Migrated data item
   */
  migrateDataItem(dataItem, itemType) {
    if (!dataItem) {
      return dataItem;
    }

    const itemVersion = dataItem.version || '1.0.0';
    
    // If already at current version, return as-is
    if (this.compareVersions(itemVersion, this.currentVersion) === 0) {
      return dataItem;
    }

    // If item is newer than current version, return as-is with warning
    if (this.compareVersions(itemVersion, this.currentVersion) > 0) {
      console.warn(`${itemType} version ${itemVersion} is newer than current version ${this.currentVersion}`);
      return dataItem;
    }

    try {
      // Apply basic version update to individual items
      let migratedItem = { ...dataItem };
      
      // Migrate from 1.0.0 to 1.1.0
      if (this.compareVersions(itemVersion, '1.1.0') < 0) {
        switch (itemType) {
          case 'character':
            migratedItem.personality = migratedItem.personality || {};
            migratedItem.relationships = migratedItem.relationships || [];
            break;
          case 'node':
            migratedItem.connections = migratedItem.connections || [];
            migratedItem.properties = migratedItem.properties || {};
            break;
          case 'interaction':
            migratedItem.participants = migratedItem.participants || [];
            migratedItem.outcome = migratedItem.outcome || null;
            break;
          case 'encounter':
            migratedItem.location = migratedItem.location || null;
            migratedItem.participants = migratedItem.participants || [];
            break;
          default:
            // Unknown item type, no specific migration needed
            break;
        }
        migratedItem.version = '1.1.0';
      }

      // Migrate from 1.1.0 to 1.2.0
      if (this.compareVersions(migratedItem.version, '1.2.0') < 0) {
        switch (itemType) {
          case 'character':
            migratedItem.interactionIds = migratedItem.interactionIds || [];
            migratedItem.encounterIds = migratedItem.encounterIds || [];
            migratedItem.attributes = migratedItem.attributes || {
              strength: 10, dexterity: 10, constitution: 10,
              intelligence: 10, wisdom: 10, charisma: 10
            };
            break;
          case 'node':
            migratedItem.population = migratedItem.population || 0;
            migratedItem.resources = migratedItem.resources || {};
            migratedItem.events = migratedItem.events || [];
            break;
          case 'interaction':
            migratedItem.timestamp = migratedItem.timestamp || new Date().toISOString();
            migratedItem.effects = migratedItem.effects || [];
            break;
          case 'encounter':
            migratedItem.timestamp = migratedItem.timestamp || new Date().toISOString();
            migratedItem.resolution = migratedItem.resolution || 'pending';
            break;
          default:
            // Unknown item type, no specific migration needed
            break;
        }
        migratedItem.version = '1.2.0';
      }

      // Migrate from 1.2.0 to 2.0.0 with environmental enhancements
      if (this.compareVersions(migratedItem.version, '2.0.0') < 0) {
        switch (itemType) {
          case 'character':
            migratedItem.consciousness = migratedItem.consciousness || {
              frequency: 50, coherence: 0.5
            };
            migratedItem.goals = migratedItem.goals || [];
            migratedItem.memory = migratedItem.memory || {
              shortTerm: [], longTerm: []
            };
            break;
          case 'node':
            // Use NodeMigrationService for comprehensive environmental migration
            try {
              migratedItem = NodeMigrationService.migrateExistingNode(migratedItem);
            } catch (error) {
              console.warn(`Failed to apply environmental migration to node ${migratedItem.id}:`, error);
              // Fallback to basic migration
              migratedItem.settlementType = migratedItem.settlementType || migratedItem.type || 'village';
              migratedItem.governance = migratedItem.governance || {
                type: 'local', ruler: null, laws: []
              };
              migratedItem.economy = migratedItem.economy || {
                primaryIndustry: 'agriculture', wealth: 'poor', tradeRoutes: []
              };
            }
            break;
          case 'interaction':
            migratedItem.complexity = migratedItem.complexity || 'simple';
            migratedItem.consequences = migratedItem.consequences || [];
            break;
          case 'encounter':
            migratedItem.type = migratedItem.type || 'social';
            migratedItem.difficulty = migratedItem.difficulty || 'easy';
            break;
          default:
            // Unknown item type, no specific migration needed
            break;
        }
        migratedItem.version = '2.0.0';
      }

      // Ensure current version
      migratedItem.version = this.currentVersion;
      migratedItem.lastModified = new Date().toISOString();

      return migratedItem;

    } catch (error) {
      console.error(`Failed to migrate ${itemType}:`, error);
      return dataItem; // Return original if migration fails
    }
  }

  /**
   * Migrates all nodes in a world to environmental format
   * @param {string} worldId - ID of world to migrate
   * @returns {Promise<Object>} Migration result
   */
  async migrateWorldNodesToEnvironmentalFormat(worldId) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      const worldData = await this.loadWorld(worldId);
      if (!worldData) {
        throw new Error(`World ${worldId} not found`);
      }

      const migrationResult = {
        worldId,
        totalNodes: worldData.nodes ? worldData.nodes.length : 0,
        migratedNodes: 0,
        failedNodes: 0,
        errors: []
      };

      if (worldData.nodes && Array.isArray(worldData.nodes)) {
        worldData.nodes = worldData.nodes.map((nodeData, index) => {
          try {
            // Check if node already has environmental data
            if (nodeData.environment && nodeData.connections) {
              migrationResult.migratedNodes++;
              return nodeData; // Already migrated
            }

            // Apply environmental migration
            const migratedNode = NodeMigrationService.migrateExistingNode(nodeData);
            migrationResult.migratedNodes++;
            return migratedNode;

          } catch (error) {
            migrationResult.failedNodes++;
            migrationResult.errors.push({
              nodeIndex: index,
              nodeId: nodeData.id || 'unknown',
              error: error.message
            });
            console.warn(`Failed to migrate node ${nodeData.id || index}:`, error);
            return nodeData; // Return original if migration fails
          }
        });

        // Save the migrated world data
        await this.saveWorld(worldData);
      }

      this.emit('environmentalMigrationComplete', migrationResult);
      return migrationResult;

    } catch (error) {
      const errorResult = {
        worldId,
        totalNodes: 0,
        migratedNodes: 0,
        failedNodes: 0,
        errors: [{ error: error.message }]
      };
      this.emit('environmentalMigrationError', errorResult);
      throw error;
    }
  }

  /**
   * Validates environmental data integrity for a world
   * @param {string} worldId - ID of world to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateWorldEnvironmentalData(worldId) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      const worldData = await this.loadWorld(worldId);
      if (!worldData) {
        throw new Error(`World ${worldId} not found`);
      }

      const validationResult = {
        worldId,
        totalNodes: worldData.nodes ? worldData.nodes.length : 0,
        enhancedNodes: 0,
        legacyNodes: 0,
        invalidNodes: 0,
        errors: [],
        warnings: []
      };

      if (worldData.nodes && Array.isArray(worldData.nodes)) {
        worldData.nodes.forEach((nodeData, index) => {
          try {
            // Check if node has environmental data
            if (nodeData.environment && nodeData.connections) {
              validationResult.enhancedNodes++;
              
              // Try to create Node entity to validate structure
              try {
                const node = Node.fromJSON(nodeData);
                // Test environmental calculations
                node.getEnvironmentalDanger();
                node.getPopulationCapacity();
              } catch (validationError) {
                validationResult.warnings.push({
                  nodeIndex: index,
                  nodeId: nodeData.id || 'unknown',
                  warning: `Environmental data validation warning: ${validationError.message}`
                });
              }
            } else {
              validationResult.legacyNodes++;
              validationResult.warnings.push({
                nodeIndex: index,
                nodeId: nodeData.id || 'unknown',
                warning: 'Node lacks environmental data'
              });
            }

          } catch (error) {
            validationResult.invalidNodes++;
            validationResult.errors.push({
              nodeIndex: index,
              nodeId: nodeData.id || 'unknown',
              error: error.message
            });
          }
        });
      }

      return validationResult;

    } catch (error) {
      return {
        worldId,
        totalNodes: 0,
        enhancedNodes: 0,
        legacyNodes: 0,
        invalidNodes: 0,
        errors: [{ error: error.message }],
        warnings: []
      };
    }
  }

  /**
   * Get migration status for all worlds
   * @returns {Promise<Array>} Array of world migration status info
   */
  async getMigrationStatus() {
    try {
      const worlds = await this.getAllWorlds();
      const migrationStatus = [];

      for (const world of worlds) {
        try {
          const worldData = localStorage.getItem(`${this.storageKeys.WORLD_PREFIX}${world.id}`);
          if (worldData) {
            const parsedWorld = JSON.parse(worldData);
            const dataVersion = parsedWorld.version || '1.0.0';
            
            migrationStatus.push({
              worldId: world.id,
              worldName: world.name,
              currentVersion: dataVersion,
              targetVersion: this.currentVersion,
              needsMigration: this.compareVersions(dataVersion, this.currentVersion) < 0,
              isNewer: this.compareVersions(dataVersion, this.currentVersion) > 0,
              isSupported: this.isVersionSupported(dataVersion),
              migrationPath: this.findMigrationPath(dataVersion, this.currentVersion)
            });
          }
        } catch (error) {
          migrationStatus.push({
            worldId: world.id,
            worldName: world.name,
            error: `Failed to check migration status: ${error.message}`,
            needsMigration: false,
            isSupported: false
          });
        }
      }

      return migrationStatus;

    } catch (error) {
      console.error('Error getting migration status:', error);
      return [];
    }
  }

  /**
   * Perform bulk migration of all worlds
   * @param {boolean} autoSave - Whether to automatically save migrated worlds
   * @returns {Promise<Object>} Migration results
   */
  async bulkMigrateWorlds(autoSave = true) {
    try {
      const migrationStatus = await this.getMigrationStatus();
      const results = {
        total: migrationStatus.length,
        migrated: 0,
        failed: 0,
        skipped: 0,
        details: []
      };

      for (const status of migrationStatus) {
        if (status.error) {
          results.skipped++;
          results.details.push({
            worldId: status.worldId,
            worldName: status.worldName,
            status: 'skipped',
            reason: status.error
          });
          continue;
        }

        if (!status.needsMigration) {
          results.skipped++;
          results.details.push({
            worldId: status.worldId,
            worldName: status.worldName,
            status: 'skipped',
            reason: 'Already at current version'
          });
          continue;
        }

        try {
          const worldData = await this.loadWorld(status.worldId);
          
          if (autoSave) {
            // World is automatically migrated and saved during load
            results.migrated++;
            results.details.push({
              worldId: status.worldId,
              worldName: status.worldName,
              status: 'migrated',
              from: status.currentVersion,
              to: this.currentVersion
            });
          } else {
            // Just check if migration would succeed
            this.migrateToCurrentVersion(worldData);
            results.migrated++;
            results.details.push({
              worldId: status.worldId,
              worldName: status.worldName,
              status: 'validated',
              from: status.currentVersion,
              to: this.currentVersion
            });
          }

        } catch (error) {
          results.failed++;
          results.details.push({
            worldId: status.worldId,
            worldName: status.worldName,
            status: 'failed',
            error: error.message
          });
        }
      }

      this.emit('bulkMigrationComplete', results);
      return results;

    } catch (error) {
      this.emit('bulkMigrationError', { error: error.message });
      throw error;
    }
  }

  /**
   * Check storage space before saving data
   * @param {Object} dataToSave - Data that will be saved
   * @param {number} limit - Storage limit in bytes (default: 5MB)
   * @throws {Error} If storage limit would be exceeded
   */
  checkStorageSpace(dataToSave, limit = 5 * 1024 * 1024) {
    try {
      // Calculate size of data to be saved
      const dataSize = new Blob([JSON.stringify(dataToSave)]).size;
      
      // Calculate current localStorage usage
      let currentUsage = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          currentUsage += localStorage[key].length;
        }
      }
      
      // Convert to bytes (localStorage stores as UTF-16, so 2 bytes per character)
      const currentUsageBytes = currentUsage * 2;
      const projectedUsage = currentUsageBytes + dataSize;
      
      console.log(`Storage check: Current usage: ${this.formatBytes(currentUsageBytes)}, Data to save: ${this.formatBytes(dataSize)}, Projected: ${this.formatBytes(projectedUsage)}, Limit: ${this.formatBytes(limit)}`);
      
      if (projectedUsage > limit) {
        const available = limit - currentUsageBytes;
        throw new Error(
          `Storage limit exceeded. ` +
          `Current usage: ${this.formatBytes(currentUsageBytes)}, ` +
          `Data size: ${this.formatBytes(dataSize)}, ` +
          `Available space: ${this.formatBytes(available)}, ` +
          `Limit: ${this.formatBytes(limit)}. ` +
          `Please delete some worlds or reduce data size.`
        );
      }
      
      // Emit warning if getting close to limit (80% usage)
      if (projectedUsage > limit * 0.8) {
        this.emit('storageWarning', {
          currentUsage: currentUsageBytes,
          projectedUsage,
          limit,
          percentageUsed: (projectedUsage / limit) * 100
        });
      }
      
      return {
        currentUsage: currentUsageBytes,
        dataSize,
        projectedUsage,
        limit,
        percentageUsed: (projectedUsage / limit) * 100,
        available: limit - projectedUsage
      };
      
    } catch (error) {
      // Re-throw storage limit errors
      if (error.message.includes('Storage limit exceeded')) {
        throw error;
      }
      
      // Log other errors but don't block saving
      console.error('Error checking storage space:', error);
      return null;
    }
  }

  /**
   * Generate unique ID
   * @returns {string} Unique identifier
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Ensure world data has complete structure with all required fields
   * @param {Object} worldData - World data to complete
   * @returns {Object} Complete world data structure
   */
  ensureCompleteWorldStructure(worldData) {
    return {
      // Preserve all existing data
      ...worldData,
      // Ensure core properties exist
      id: worldData.id || this.generateId(),
      name: worldData.name || 'Untitled World',
      description: worldData.description || 'A world created with the World History Simulator',
      version: worldData.version || this.currentVersion,
      lastModified: worldData.lastModified || new Date().toISOString(),
      // Ensure arrays exist even if empty
      nodes: Array.isArray(worldData.nodes) ? worldData.nodes : [],
      characters: Array.isArray(worldData.characters) ? worldData.characters : [],
      interactions: Array.isArray(worldData.interactions) ? worldData.interactions : [],
      encounters: Array.isArray(worldData.encounters) ? worldData.encounters : [],
      // Ensure objects exist with defaults
      rules: (worldData.rules && typeof worldData.rules === 'object') ? worldData.rules : {},
      initialConditions: (worldData.initialConditions && typeof worldData.initialConditions === 'object') ? worldData.initialConditions : {},
      nodePopulations: (worldData.nodePopulations && typeof worldData.nodePopulations === 'object') ? worldData.nodePopulations : {},
      // Preserve WorldBuilder-specific fields if they exist
      currentStep: worldData.currentStep || 'world',
      isComplete: worldData.isComplete || false,
      isValid: worldData.isValid || false
    };
  }

  /**
   * Validate world data structure (compatible with WorldBuilder)
   * @param {Object} worldData - World data to validate
   * @returns {Object} Validation result
   */
  validateWorldData(worldData) {
    const errors = [];
    const warnings = [];

    if (!worldData) {
      errors.push('World data is required');
      return { isValid: false, errors, warnings };
    }

    if (!worldData.name || typeof worldData.name !== 'string') {
      errors.push('World name is required and must be a string');
    }

    if (!worldData.description || typeof worldData.description !== 'string') {
      errors.push('World description is required and must be a string');
    }

    if (!worldData.id) {
      warnings.push('World ID will be auto-generated');
    }

    if (!worldData.lastModified) {
      warnings.push('Last modified timestamp will be set to current time');
    }

    // Validate WorldBuilder-specific structure (arrays)
    if (worldData.nodes && !Array.isArray(worldData.nodes)) {
      errors.push('Nodes must be an array');
    }

    if (worldData.characters && !Array.isArray(worldData.characters)) {
      errors.push('Characters must be an array');
    }

    if (worldData.interactions && !Array.isArray(worldData.interactions)) {
      errors.push('Interactions must be an array');
    }

    if (worldData.encounters && !Array.isArray(worldData.encounters)) {
      errors.push('Encounters must be an array');
    }

    // Validate object structures
    if (worldData.rules && typeof worldData.rules !== 'object') {
      errors.push('Rules must be an object');
    }

    if (worldData.initialConditions && typeof worldData.initialConditions !== 'object') {
      errors.push('Initial conditions must be an object');
    }

    if (worldData.nodePopulations && typeof worldData.nodePopulations !== 'object') {
      errors.push('Node populations must be an object');
    }

    // Validate version and metadata
    if (worldData.version && typeof worldData.version !== 'string') {
      warnings.push('Version should be a string');
    }

    if (worldData.currentStep && typeof worldData.currentStep !== 'string') {
      warnings.push('Current step should be a string');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate node data structure
   * @param {Object} nodeData - Node data to validate
   * @returns {Object} Validation result
   */
  validateNodeData(nodeData) {
    const errors = [];
    const warnings = [];

    if (!nodeData) {
      errors.push('Node data is required');
      return { isValid: false, errors, warnings };
    }

    if (!nodeData.name || typeof nodeData.name !== 'string') {
      errors.push('Node name is required and must be a string');
    }

    if (!nodeData.type || typeof nodeData.type !== 'string') {
      errors.push('Node type is required and must be a string');
    }

    if (!nodeData.id) {
      warnings.push('Node ID will be auto-generated');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Save world data to localStorage (compatible with WorldBuilder)
   * @param {Object} worldData - World data to save (can be WorldBuilder config)
   * @returns {Promise<Object>} Saved world data with generated ID
   */
  async saveWorld(worldData) {
    try {
      // If worldData is a WorldBuilder instance, extract the config
      let dataToSave = worldData;
      if (worldData && typeof worldData.worldConfig === 'object') {
        dataToSave = {
          ...worldData.worldConfig,
          currentStep: worldData.currentStep
        };
      }

      // Migrate data to current version before saving
      try {
        dataToSave = this.migrateToCurrentVersion(dataToSave);
        console.log(`Data migrated to version ${dataToSave.version} before saving`);
      } catch (migrationError) {
        console.warn(`Migration failed, proceeding with original data:`, migrationError.message);
        // Continue with original data if migration fails, but log the issue
        this.emit('migrationWarning', { 
          worldId: dataToSave.id, 
          error: migrationError.message 
        });
      }

      // Validate world data
      const validation = this.validateWorldData(dataToSave);
      if (!validation.isValid) {
        throw new Error(`World validation failed: ${validation.errors.join(', ')}`);
      }

      // Ensure complete data structure with all required fields
      const worldToSave = this.ensureCompleteWorldStructure(dataToSave);

      // Check storage space before saving
      this.checkStorageSpace(worldToSave);

      // Get existing worlds list
      const existingWorlds = await this.getAllWorlds();
      
      // Update or add world to list
      const worldIndex = existingWorlds.findIndex(w => w.id === worldToSave.id);
      if (worldIndex >= 0) {
        existingWorlds[worldIndex] = {
          id: worldToSave.id,
          name: worldToSave.name,
          description: worldToSave.description,
          lastModified: worldToSave.lastModified,
          version: worldToSave.version
        };
      } else {
        existingWorlds.push({
          id: worldToSave.id,
          name: worldToSave.name,
          description: worldToSave.description,
          lastModified: worldToSave.lastModified,
          version: worldToSave.version
        });
      }

      // Save world list
      localStorage.setItem(this.storageKeys.WORLDS, JSON.stringify(existingWorlds));
      
      // Save full world data
      localStorage.setItem(
        `${this.storageKeys.WORLD_PREFIX}${worldToSave.id}`,
        JSON.stringify(worldToSave)
      );

      this.emit('worldSaved', worldToSave);
      return worldToSave;

    } catch (error) {
      this.emit('saveError', { type: 'world', error: error.message });
      throw error;
    }
  }

  /**
   * Load world data from localStorage
   * @param {string} worldId - ID of world to load
   * @returns {Promise<Object>} World data
   */
  async loadWorld(worldId) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      const worldData = localStorage.getItem(`${this.storageKeys.WORLD_PREFIX}${worldId}`);
      
      if (!worldData) {
        throw new Error(`World with ID ${worldId} not found`);
      }

      const parsedWorld = JSON.parse(worldData);
      
      // Migrate data to current version if needed
      let migratedWorld = parsedWorld;
      const dataVersion = parsedWorld.version || '1.0.0';
      
      if (this.compareVersions(dataVersion, this.currentVersion) < 0) {
        console.log(`Loading world ${worldId} with version ${dataVersion}, migrating to ${this.currentVersion}`);
        try {
          migratedWorld = this.migrateToCurrentVersion(parsedWorld);
          
          // Auto-save migrated data back to storage to avoid repeated migrations
          console.log(`Auto-saving migrated world ${worldId} to storage`);
          localStorage.setItem(
            `${this.storageKeys.WORLD_PREFIX}${worldId}`,
            JSON.stringify(migratedWorld)
          );
          
          // Update world list with new version
          const existingWorlds = await this.getAllWorlds();
          const worldIndex = existingWorlds.findIndex(w => w.id === worldId);
          if (worldIndex >= 0) {
            existingWorlds[worldIndex].version = migratedWorld.version;
            existingWorlds[worldIndex].lastModified = migratedWorld.lastModified;
            localStorage.setItem(this.storageKeys.WORLDS, JSON.stringify(existingWorlds));
          }
          
        } catch (migrationError) {
          console.error(`Migration failed for world ${worldId}:`, migrationError.message);
          this.emit('migrationError', { 
            worldId, 
            dataVersion, 
            targetVersion: this.currentVersion, 
            error: migrationError.message 
          });
          // Continue with original data if migration fails
          migratedWorld = parsedWorld;
        }
      }
      
      // Ensure complete data structure when loading
      const completeWorld = this.ensureCompleteWorldStructure(migratedWorld);
      
      // Validate loaded data
      const validation = this.validateWorldData(completeWorld);
      if (!validation.isValid) {
        console.warn('Loaded world data has validation issues:', validation.errors);
      }

      this.emit('worldLoaded', completeWorld);
      return completeWorld;

    } catch (error) {
      this.emit('loadError', { type: 'world', worldId, error: error.message });
      throw error;
    }
  }

  /**
   * Get all available worlds
   * @returns {Promise<Array>} Array of world metadata
   */
  async getAllWorlds() {
    try {
      const worldsData = localStorage.getItem(this.storageKeys.WORLDS);
      return worldsData ? JSON.parse(worldsData) : [];
    } catch (error) {
      console.error('Error loading worlds list:', error);
      return [];
    }
  }

  /**
   * Delete world and all associated data
   * @param {string} worldId - ID of world to delete
   * @returns {Promise<void>}
   */
  async deleteWorld(worldId) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      // Remove from worlds list
      const existingWorlds = await this.getAllWorlds();
      const updatedWorlds = existingWorlds.filter(w => w.id !== worldId);
      localStorage.setItem(this.storageKeys.WORLDS, JSON.stringify(updatedWorlds));

      // Remove world data
      localStorage.removeItem(`${this.storageKeys.WORLD_PREFIX}${worldId}`);
      
      // Remove associated data
      localStorage.removeItem(`${this.storageKeys.NODES_PREFIX}${worldId}`);
      localStorage.removeItem(`${this.storageKeys.CHARACTERS_PREFIX}${worldId}`);
      localStorage.removeItem(`${this.storageKeys.INTERACTIONS_PREFIX}${worldId}`);
      localStorage.removeItem(`${this.storageKeys.ENCOUNTERS_PREFIX}${worldId}`);

      this.emit('worldDeleted', worldId);

    } catch (error) {
      this.emit('deleteError', { type: 'world', worldId, error: error.message });
      throw error;
    }
  }

  /**
   * Save node to world
   * @param {string} worldId - ID of world to save node to
   * @param {Object} nodeData - Node data to save
   * @returns {Promise<Object>} Saved node data
   */
  async saveNode(worldId, nodeData) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      // Validate node data
      const validation = this.validateNodeData(nodeData);
      if (!validation.isValid) {
        throw new Error(`Node validation failed: ${validation.errors.join(', ')}`);
      }

      // Migrate node data to current version
      const migratedNode = this.migrateDataItem(nodeData, 'node');

      // Prepare node data for saving
      const nodeToSave = {
        ...migratedNode,
        id: migratedNode.id || this.generateId(),
        worldId,
        lastModified: new Date().toISOString()
      };

      // Get existing nodes for this world
      const existingNodes = await this.getWorldNodes(worldId);
      
      // Update or add node
      const nodeIndex = existingNodes.findIndex(n => n.id === nodeToSave.id);
      if (nodeIndex >= 0) {
        existingNodes[nodeIndex] = nodeToSave;
      } else {
        existingNodes.push(nodeToSave);
      }

      // Check storage space before saving
      this.checkStorageSpace(existingNodes);

      // Save nodes back to storage
      localStorage.setItem(
        `${this.storageKeys.NODES_PREFIX}${worldId}`,
        JSON.stringify(existingNodes)
      );

      this.emit('nodeSaved', { worldId, node: nodeToSave });
      return nodeToSave;

    } catch (error) {
      this.emit('saveError', { type: 'node', worldId, error: error.message });
      throw error;
    }
  }

  /**
   * Get all nodes for a world
   * @param {string} worldId - ID of world
   * @returns {Promise<Array>} Array of nodes
   */
  async getWorldNodes(worldId) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      const nodesData = localStorage.getItem(`${this.storageKeys.NODES_PREFIX}${worldId}`);
      return nodesData ? JSON.parse(nodesData) : [];

    } catch (error) {
      console.error('Error loading nodes:', error);
      return [];
    }
  }

  /**
   * Delete node from world
   * @param {string} worldId - ID of world
   * @param {string} nodeId - ID of node to delete
   * @returns {Promise<void>}
   */
  async deleteNode(worldId, nodeId) {
    try {
      if (!worldId || !nodeId) {
        throw new Error('World ID and Node ID are required');
      }

      const existingNodes = await this.getWorldNodes(worldId);
      const updatedNodes = existingNodes.filter(n => n.id !== nodeId);
      
      localStorage.setItem(
        `${this.storageKeys.NODES_PREFIX}${worldId}`,
        JSON.stringify(updatedNodes)
      );

      this.emit('nodeDeleted', { worldId, nodeId });

    } catch (error) {
      this.emit('deleteError', { type: 'node', worldId, nodeId, error: error.message });
      throw error;
    }
  }

  /**
   * Save character to world
   * @param {string} worldId - ID of world to save character to
   * @param {Object} characterData - Character data to save
   * @returns {Promise<Object>} Saved character data
   */
  async saveCharacter(worldId, characterData) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      if (!characterData) {
        throw new Error('Character data is required');
      }

      // Migrate character data to current version
      const migratedCharacter = this.migrateDataItem(characterData, 'character');

      // Prepare character data for saving
      const characterToSave = {
        ...migratedCharacter,
        id: migratedCharacter.id || this.generateId(),
        worldId,
        lastModified: new Date().toISOString()
      };

      // Get existing characters for this world
      const existingCharacters = await this.getWorldCharacters(worldId);
      
      // Update or add character
      const characterIndex = existingCharacters.findIndex(c => c.id === characterToSave.id);
      if (characterIndex >= 0) {
        existingCharacters[characterIndex] = characterToSave;
      } else {
        existingCharacters.push(characterToSave);
      }

      // Check storage space before saving
      this.checkStorageSpace(existingCharacters);

      // Save characters back to storage
      localStorage.setItem(
        `${this.storageKeys.CHARACTERS_PREFIX}${worldId}`,
        JSON.stringify(existingCharacters)
      );

      this.emit('characterSaved', { worldId, character: characterToSave });
      return characterToSave;

    } catch (error) {
      this.emit('saveError', { type: 'character', worldId, error: error.message });
      throw error;
    }
  }

  /**
   * Get all characters for a world
   * @param {string} worldId - ID of world
   * @returns {Promise<Array>} Array of characters
   */
  async getWorldCharacters(worldId) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      const charactersData = localStorage.getItem(`${this.storageKeys.CHARACTERS_PREFIX}${worldId}`);
      return charactersData ? JSON.parse(charactersData) : [];

    } catch (error) {
      console.error('Error loading characters:', error);
      return [];
    }
  }

  /**
   * Delete character from world
   * @param {string} worldId - ID of world
   * @param {string} characterId - ID of character to delete
   * @returns {Promise<void>}
   */
  async deleteCharacter(worldId, characterId) {
    try {
      if (!worldId || !characterId) {
        throw new Error('World ID and Character ID are required');
      }

      const existingCharacters = await this.getWorldCharacters(worldId);
      const updatedCharacters = existingCharacters.filter(c => c.id !== characterId);
      
      localStorage.setItem(
        `${this.storageKeys.CHARACTERS_PREFIX}${worldId}`,
        JSON.stringify(updatedCharacters)
      );

      this.emit('characterDeleted', { worldId, characterId });

    } catch (error) {
      this.emit('deleteError', { type: 'character', worldId, characterId, error: error.message });
      throw error;
    }
  }

  /**
   * Save interaction to world
   * @param {string} worldId - ID of world to save interaction to
   * @param {Object} interactionData - Interaction data to save
   * @returns {Promise<Object>} Saved interaction data
   */
  async saveInteraction(worldId, interactionData) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      if (!interactionData) {
        throw new Error('Interaction data is required');
      }

      // Prepare interaction data for saving
      const interactionToSave = {
        ...interactionData,
        id: interactionData.id || this.generateId(),
        worldId,
        lastModified: new Date().toISOString()
      };

      // Get existing interactions for this world
      const existingInteractions = await this.getWorldInteractions(worldId);
      
      // Update or add interaction
      const interactionIndex = existingInteractions.findIndex(i => i.id === interactionToSave.id);
      if (interactionIndex >= 0) {
        existingInteractions[interactionIndex] = interactionToSave;
      } else {
        existingInteractions.push(interactionToSave);
      }

      // Check storage space before saving
      this.checkStorageSpace(existingInteractions);

      // Save interactions back to storage
      localStorage.setItem(
        `${this.storageKeys.INTERACTIONS_PREFIX}${worldId}`,
        JSON.stringify(existingInteractions)
      );

      this.emit('interactionSaved', { worldId, interaction: interactionToSave });
      return interactionToSave;

    } catch (error) {
      this.emit('saveError', { type: 'interaction', worldId, error: error.message });
      throw error;
    }
  }

  /**
   * Get all interactions for a world
   * @param {string} worldId - ID of world
   * @returns {Promise<Array>} Array of interactions
   */
  async getWorldInteractions(worldId) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      const interactionsData = localStorage.getItem(`${this.storageKeys.INTERACTIONS_PREFIX}${worldId}`);
      return interactionsData ? JSON.parse(interactionsData) : [];

    } catch (error) {
      console.error('Error loading interactions:', error);
      return [];
    }
  }

  /**
   * Delete interaction from world
   * @param {string} worldId - ID of world
   * @param {string} interactionId - ID of interaction to delete
   * @returns {Promise<void>}
   */
  async deleteInteraction(worldId, interactionId) {
    try {
      if (!worldId || !interactionId) {
        throw new Error('World ID and Interaction ID are required');
      }

      const existingInteractions = await this.getWorldInteractions(worldId);
      const updatedInteractions = existingInteractions.filter(i => i.id !== interactionId);
      
      localStorage.setItem(
        `${this.storageKeys.INTERACTIONS_PREFIX}${worldId}`,
        JSON.stringify(updatedInteractions)
      );

      this.emit('interactionDeleted', { worldId, interactionId });

    } catch (error) {
      this.emit('deleteError', { type: 'interaction', worldId, interactionId, error: error.message });
      throw error;
    }
  }

  /**
   * Save encounter to world
   * @param {string} worldId - ID of world to save encounter to
   * @param {Object} encounterData - Encounter data to save
   * @returns {Promise<Object>} Saved encounter data
   */
  async saveEncounter(worldId, encounterData) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      if (!encounterData) {
        throw new Error('Encounter data is required');
      }

      // Prepare encounter data for saving
      const encounterToSave = {
        ...encounterData,
        id: encounterData.id || this.generateId(),
        worldId,
        lastModified: new Date().toISOString()
      };

      // Get existing encounters for this world
      const existingEncounters = await this.getWorldEncounters(worldId);
      
      // Update or add encounter
      const encounterIndex = existingEncounters.findIndex(e => e.id === encounterToSave.id);
      if (encounterIndex >= 0) {
        existingEncounters[encounterIndex] = encounterToSave;
      } else {
        existingEncounters.push(encounterToSave);
      }

      // Check storage space before saving
      this.checkStorageSpace(existingEncounters);

      // Save encounters back to storage
      localStorage.setItem(
        `${this.storageKeys.ENCOUNTERS_PREFIX}${worldId}`,
        JSON.stringify(existingEncounters)
      );

      this.emit('encounterSaved', { worldId, encounter: encounterToSave });
      return encounterToSave;

    } catch (error) {
      this.emit('saveError', { type: 'encounter', worldId, error: error.message });
      throw error;
    }
  }

  /**
   * Get all encounters for a world
   * @param {string} worldId - ID of world
   * @returns {Promise<Array>} Array of encounters
   */
  async getWorldEncounters(worldId) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      const encountersData = localStorage.getItem(`${this.storageKeys.ENCOUNTERS_PREFIX}${worldId}`);
      return encountersData ? JSON.parse(encountersData) : [];

    } catch (error) {
      console.error('Error loading encounters:', error);
      return [];
    }
  }

  /**
   * Delete encounter from world
   * @param {string} worldId - ID of world
   * @param {string} encounterId - ID of encounter to delete
   * @returns {Promise<void>}
   */
  async deleteEncounter(worldId, encounterId) {
    try {
      if (!worldId || !encounterId) {
        throw new Error('World ID and Encounter ID are required');
      }

      const existingEncounters = await this.getWorldEncounters(worldId);
      const updatedEncounters = existingEncounters.filter(e => e.id !== encounterId);
      
      localStorage.setItem(
        `${this.storageKeys.ENCOUNTERS_PREFIX}${worldId}`,
        JSON.stringify(updatedEncounters)
      );

      this.emit('encounterDeleted', { worldId, encounterId });

    } catch (error) {
      this.emit('deleteError', { type: 'encounter', worldId, encounterId, error: error.message });
      throw error;
    }
  }

  /**
   * Save multiple data items with storage checking (batch operation)
   * @param {string} worldId - ID of world
   * @param {Object} batchData - Object containing arrays of different data types
   * @param {Array} batchData.characters - Characters to save
   * @param {Array} batchData.interactions - Interactions to save
   * @param {Array} batchData.encounters - Encounters to save
   * @param {Array} batchData.nodes - Nodes to save
   * @returns {Promise<Object>} Results of batch operation
   */
  async saveBatch(worldId, batchData) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      if (!batchData || typeof batchData !== 'object') {
        throw new Error('Batch data is required');
      }

      // Check total storage space for all batch data
      this.checkStorageSpace(batchData);

      const results = {};

      // Save characters
      if (batchData.characters && Array.isArray(batchData.characters)) {
        results.characters = [];
        for (const character of batchData.characters) {
          try {
            const savedCharacter = await this.saveCharacter(worldId, character);
            results.characters.push(savedCharacter);
          } catch (error) {
            console.error(`Failed to save character ${character.id || 'unknown'}:`, error);
            results.characters.push({ error: error.message, data: character });
          }
        }
      }

      // Save interactions
      if (batchData.interactions && Array.isArray(batchData.interactions)) {
        results.interactions = [];
        for (const interaction of batchData.interactions) {
          try {
            const savedInteraction = await this.saveInteraction(worldId, interaction);
            results.interactions.push(savedInteraction);
          } catch (error) {
            console.error(`Failed to save interaction ${interaction.id || 'unknown'}:`, error);
            results.interactions.push({ error: error.message, data: interaction });
          }
        }
      }

      // Save encounters
      if (batchData.encounters && Array.isArray(batchData.encounters)) {
        results.encounters = [];
        for (const encounter of batchData.encounters) {
          try {
            const savedEncounter = await this.saveEncounter(worldId, encounter);
            results.encounters.push(savedEncounter);
          } catch (error) {
            console.error(`Failed to save encounter ${encounter.id || 'unknown'}:`, error);
            results.encounters.push({ error: error.message, data: encounter });
          }
        }
      }

      // Save nodes
      if (batchData.nodes && Array.isArray(batchData.nodes)) {
        results.nodes = [];
        for (const node of batchData.nodes) {
          try {
            const savedNode = await this.saveNode(worldId, node);
            results.nodes.push(savedNode);
          } catch (error) {
            console.error(`Failed to save node ${node.id || 'unknown'}:`, error);
            results.nodes.push({ error: error.message, data: node });
          }
        }
      }

      this.emit('batchSaved', { worldId, results });
      return results;

    } catch (error) {
      this.emit('saveError', { type: 'batch', worldId, error: error.message });
      throw error;
    }
  }

  /**
   * Check if there are unsaved changes
   * @param {string} worldId - ID of world to check
   * @returns {boolean} Whether there are unsaved changes
   */
  hasUnsavedChanges(worldId) {
    // This would be implemented based on comparing current editor state
    // with saved data - for now return false as placeholder
    // TODO: Implement actual unsaved changes detection
    console.log('Checking unsaved changes for world:', worldId);
    return false;
  }

  /**
   * Export world data as JSON
   * @param {string} worldId - ID of world to export
   * @returns {Promise<Object>} Complete world data for export
   */
  async exportWorld(worldId) {
    try {
      const world = await this.loadWorld(worldId);
      const nodes = await this.getWorldNodes(worldId);
      const characters = await this.getWorldCharacters(worldId);
      const interactions = await this.getWorldInteractions(worldId);
      const encounters = await this.getWorldEncounters(worldId);
      
      const exportData = {
        world,
        nodes,
        characters,
        interactions,
        encounters,
        exportedAt: new Date().toISOString(),
        version: this.currentVersion
      };

      // Check if export data would exceed storage limits
      this.checkStorageSpace(exportData);
      
      return exportData;

    } catch (error) {
      this.emit('exportError', { worldId, error: error.message });
      throw error;
    }
  }

  /**
   * Import world data from JSON
   * @param {Object} worldData - Complete world data to import
   * @returns {Promise<Object>} Imported world data
   */
  async importWorld(worldData) {
    try {
      if (!worldData.world) {
        throw new Error('Invalid import data: missing world data');
      }

      // Check storage space for entire import before starting
      this.checkStorageSpace(worldData);

      // Generate new ID to avoid conflicts
      const newWorldId = this.generateId();
      const worldToImport = {
        ...worldData.world,
        id: newWorldId,
        lastModified: new Date().toISOString()
      };

      // Save world
      await this.saveWorld(worldToImport);

      const importResults = {
        world: worldToImport,
        nodes: [],
        characters: [],
        interactions: [],
        encounters: []
      };

      // Save nodes if present
      if (worldData.nodes && Array.isArray(worldData.nodes)) {
        for (const node of worldData.nodes) {
          try {
            const savedNode = await this.saveNode(newWorldId, {
              ...node,
              id: this.generateId(), // Generate new node ID
              worldId: newWorldId
            });
            importResults.nodes.push(savedNode);
          } catch (error) {
            console.error(`Failed to import node:`, error);
            importResults.nodes.push({ error: error.message, originalData: node });
          }
        }
      }

      // Save characters if present
      if (worldData.characters && Array.isArray(worldData.characters)) {
        for (const character of worldData.characters) {
          try {
            const savedCharacter = await this.saveCharacter(newWorldId, {
              ...character,
              id: this.generateId(), // Generate new character ID
              worldId: newWorldId
            });
            importResults.characters.push(savedCharacter);
          } catch (error) {
            console.error(`Failed to import character:`, error);
            importResults.characters.push({ error: error.message, originalData: character });
          }
        }
      }

      // Save interactions if present
      if (worldData.interactions && Array.isArray(worldData.interactions)) {
        for (const interaction of worldData.interactions) {
          try {
            const savedInteraction = await this.saveInteraction(newWorldId, {
              ...interaction,
              id: this.generateId(), // Generate new interaction ID
              worldId: newWorldId
            });
            importResults.interactions.push(savedInteraction);
          } catch (error) {
            console.error(`Failed to import interaction:`, error);
            importResults.interactions.push({ error: error.message, originalData: interaction });
          }
        }
      }

      // Save encounters if present
      if (worldData.encounters && Array.isArray(worldData.encounters)) {
        for (const encounter of worldData.encounters) {
          try {
            const savedEncounter = await this.saveEncounter(newWorldId, {
              ...encounter,
              id: this.generateId(), // Generate new encounter ID
              worldId: newWorldId
            });
            importResults.encounters.push(savedEncounter);
          } catch (error) {
            console.error(`Failed to import encounter:`, error);
            importResults.encounters.push({ error: error.message, originalData: encounter });
          }
        }
      }

      this.emit('worldImported', importResults);
      return importResults;

    } catch (error) {
      this.emit('importError', { error: error.message });
      throw error;
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Object} Storage usage information
   */
  getStorageStats() {
    try {
      let totalSize = 0;
      let worldCount = 0;
      let nodeCount = 0;
      let characterCount = 0;
      let interactionCount = 0;
      let encounterCount = 0;

      for (let key in localStorage) {
        if (key.startsWith('worldHistorySimulator_')) {
          const value = localStorage.getItem(key);
          totalSize += value ? value.length : 0;
          
          if (key.startsWith(this.storageKeys.WORLD_PREFIX)) {
            worldCount++;
          } else if (key.startsWith(this.storageKeys.NODES_PREFIX)) {
            const nodes = JSON.parse(value || '[]');
            nodeCount += nodes.length;
          } else if (key.startsWith(this.storageKeys.CHARACTERS_PREFIX)) {
            const characters = JSON.parse(value || '[]');
            characterCount += characters.length;
          } else if (key.startsWith(this.storageKeys.INTERACTIONS_PREFIX)) {
            const interactions = JSON.parse(value || '[]');
            interactionCount += interactions.length;
          } else if (key.startsWith(this.storageKeys.ENCOUNTERS_PREFIX)) {
            const encounters = JSON.parse(value || '[]');
            encounterCount += encounters.length;
          }
        }
      }

      // Convert to bytes (localStorage stores as UTF-16, so 2 bytes per character)
      const totalSizeBytes = totalSize * 2;
      const limit = 5 * 1024 * 1024; // 5MB default limit
      const percentageUsed = (totalSizeBytes / limit) * 100;

      return {
        totalSize: totalSizeBytes,
        totalSizeChars: totalSize,
        worldCount,
        nodeCount,
        characterCount,
        interactionCount,
        encounterCount,
        formattedSize: this.formatBytes(totalSizeBytes),
        limit,
        formattedLimit: this.formatBytes(limit),
        percentageUsed: Math.round(percentageUsed * 100) / 100,
        available: limit - totalSizeBytes,
        formattedAvailable: this.formatBytes(limit - totalSizeBytes)
      };

    } catch (error) {
      console.error('Error calculating storage stats:', error);
      return { 
        totalSize: 0, 
        worldCount: 0, 
        nodeCount: 0,
        characterCount: 0,
        interactionCount: 0,
        encounterCount: 0,
        formattedSize: '0 B',
        limit: 5 * 1024 * 1024,
        formattedLimit: '5 MB',
        percentageUsed: 0,
        available: 5 * 1024 * 1024,
        formattedAvailable: '5 MB'
      };
    }
  }

  /**
   * Get current storage usage percentage
   * @returns {number} Percentage of storage used (0-100)
   */
  getStorageUsagePercentage() {
    const stats = this.getStorageStats();
    return stats.percentageUsed;
  }

  /**
   * Check if storage is getting full (over 80% usage)
   * @returns {boolean} True if storage usage is over 80%
   */
  isStorageNearFull() {
    return this.getStorageUsagePercentage() > 80;
  }

  /**
   * Format bytes to human readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Clear all world data (use with caution)
   * @returns {Promise<void>}
   */
  async clearAllData() {
    try {
      const keysToRemove = [];
      
      for (let key in localStorage) {
        if (key.startsWith('worldHistorySimulator_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      this.emit('allDataCleared');

    } catch (error) {
      this.emit('clearError', { error: error.message });
      throw error;
    }
  }

  /**
   * Detect all orphaned data in the storage
   * @returns {Promise<Object>} Orphaned data analysis
   */
  async detectOrphanedData() {
    try {
      console.log('Starting orphaned data detection...');
      
      // Get list of valid world IDs
      const worlds = await this.getAllWorlds();
      const validWorldIds = new Set(worlds.map(w => w.id));
      
      const orphanedData = {
        orphanedWorldData: [],
        orphanedNodeData: [],
        orphanedCharacterData: [],
        orphanedInteractionData: [],
        orphanedEncounterData: [],
        corruptedData: [],
        totalOrphanedSize: 0,
        totalOrphanedCount: 0,
        analysis: {
          worldsInList: worlds.length,
          validWorldIds: Array.from(validWorldIds),
          checkedKeys: []
        }
      };

      // Check all localStorage keys
      for (let key in localStorage) {
        if (key.startsWith('worldHistorySimulator_')) {
          orphanedData.analysis.checkedKeys.push(key);
          
          try {
            const dataSize = localStorage[key].length * 2; // UTF-16 bytes
            
            // Check world data
            if (key.startsWith(this.storageKeys.WORLD_PREFIX)) {
              const worldId = key.replace(this.storageKeys.WORLD_PREFIX, '');
              if (!validWorldIds.has(worldId)) {
                orphanedData.orphanedWorldData.push({
                  key,
                  worldId,
                  size: dataSize,
                  formattedSize: this.formatBytes(dataSize),
                  reason: 'World not in worlds list'
                });
                orphanedData.totalOrphanedSize += dataSize;
                orphanedData.totalOrphanedCount++;
              }
            }
            
            // Check node data
            else if (key.startsWith(this.storageKeys.NODES_PREFIX)) {
              const worldId = key.replace(this.storageKeys.NODES_PREFIX, '');
              if (!validWorldIds.has(worldId)) {
                orphanedData.orphanedNodeData.push({
                  key,
                  worldId,
                  size: dataSize,
                  formattedSize: this.formatBytes(dataSize),
                  reason: 'Parent world does not exist'
                });
                orphanedData.totalOrphanedSize += dataSize;
                orphanedData.totalOrphanedCount++;
              } else {
                // Check for internal orphaned nodes (nodes referencing non-existent characters/interactions)
                try {
                  const nodes = JSON.parse(localStorage[key]);
                  const orphanedNodes = await this.findOrphanedNodesInArray(nodes, worldId);
                  if (orphanedNodes.length > 0) {
                    orphanedData.orphanedNodeData.push({
                      key,
                      worldId,
                      size: 0, // Internal orphaned references, not entire key
                      formattedSize: '0 B',
                      reason: 'Contains nodes with broken references',
                      orphanedNodes: orphanedNodes
                    });
                  }
                } catch (parseError) {
                  orphanedData.corruptedData.push({
                    key,
                    worldId,
                    size: dataSize,
                    formattedSize: this.formatBytes(dataSize),
                    reason: 'Failed to parse node data',
                    error: parseError.message
                  });
                  orphanedData.totalOrphanedSize += dataSize;
                  orphanedData.totalOrphanedCount++;
                }
              }
            }
            
            // Check character data
            else if (key.startsWith(this.storageKeys.CHARACTERS_PREFIX)) {
              const worldId = key.replace(this.storageKeys.CHARACTERS_PREFIX, '');
              if (!validWorldIds.has(worldId)) {
                orphanedData.orphanedCharacterData.push({
                  key,
                  worldId,
                  size: dataSize,
                  formattedSize: this.formatBytes(dataSize),
                  reason: 'Parent world does not exist'
                });
                orphanedData.totalOrphanedSize += dataSize;
                orphanedData.totalOrphanedCount++;
              } else {
                // Check for internal orphaned characters (characters referencing non-existent data)
                try {
                  const characters = JSON.parse(localStorage[key]);
                  const orphanedChars = await this.findOrphanedCharactersInArray(characters, worldId);
                  if (orphanedChars.length > 0) {
                    orphanedData.orphanedCharacterData.push({
                      key,
                      worldId,
                      size: 0, // Internal orphaned references
                      formattedSize: '0 B',
                      reason: 'Contains characters with broken references',
                      orphanedCharacters: orphanedChars
                    });
                  }
                } catch (parseError) {
                  orphanedData.corruptedData.push({
                    key,
                    worldId,
                    size: dataSize,
                    formattedSize: this.formatBytes(dataSize),
                    reason: 'Failed to parse character data',
                    error: parseError.message
                  });
                  orphanedData.totalOrphanedSize += dataSize;
                  orphanedData.totalOrphanedCount++;
                }
              }
            }
            
            // Check interaction data
            else if (key.startsWith(this.storageKeys.INTERACTIONS_PREFIX)) {
              const worldId = key.replace(this.storageKeys.INTERACTIONS_PREFIX, '');
              if (!validWorldIds.has(worldId)) {
                orphanedData.orphanedInteractionData.push({
                  key,
                  worldId,
                  size: dataSize,
                  formattedSize: this.formatBytes(dataSize),
                  reason: 'Parent world does not exist'
                });
                orphanedData.totalOrphanedSize += dataSize;
                orphanedData.totalOrphanedCount++;
              } else {
                // Check for internal orphaned interactions
                try {
                  const interactions = JSON.parse(localStorage[key]);
                  const orphanedInteractions = await this.findOrphanedInteractionsInArray(interactions, worldId);
                  if (orphanedInteractions.length > 0) {
                    orphanedData.orphanedInteractionData.push({
                      key,
                      worldId,
                      size: 0,
                      formattedSize: '0 B',
                      reason: 'Contains interactions with broken references',
                      orphanedInteractions: orphanedInteractions
                    });
                  }
                } catch (parseError) {
                  orphanedData.corruptedData.push({
                    key,
                    worldId,
                    size: dataSize,
                    formattedSize: this.formatBytes(dataSize),
                    reason: 'Failed to parse interaction data',
                    error: parseError.message
                  });
                  orphanedData.totalOrphanedSize += dataSize;
                  orphanedData.totalOrphanedCount++;
                }
              }
            }
            
            // Check encounter data
            else if (key.startsWith(this.storageKeys.ENCOUNTERS_PREFIX)) {
              const worldId = key.replace(this.storageKeys.ENCOUNTERS_PREFIX, '');
              if (!validWorldIds.has(worldId)) {
                orphanedData.orphanedEncounterData.push({
                  key,
                  worldId,
                  size: dataSize,
                  formattedSize: this.formatBytes(dataSize),
                  reason: 'Parent world does not exist'
                });
                orphanedData.totalOrphanedSize += dataSize;
                orphanedData.totalOrphanedCount++;
              } else {
                // Check for internal orphaned encounters
                try {
                  const encounters = JSON.parse(localStorage[key]);
                  const orphanedEncounters = await this.findOrphanedEncountersInArray(encounters, worldId);
                  if (orphanedEncounters.length > 0) {
                    orphanedData.orphanedEncounterData.push({
                      key,
                      worldId,
                      size: 0,
                      formattedSize: '0 B',
                      reason: 'Contains encounters with broken references',
                      orphanedEncounters: orphanedEncounters
                    });
                  }
                } catch (parseError) {
                  orphanedData.corruptedData.push({
                    key,
                    worldId,
                    size: dataSize,
                    formattedSize: this.formatBytes(dataSize),
                    reason: 'Failed to parse encounter data',
                    error: parseError.message
                  });
                  orphanedData.totalOrphanedSize += dataSize;
                  orphanedData.totalOrphanedCount++;
                }
              }
            }

          } catch (error) {
            orphanedData.corruptedData.push({
              key,
              worldId: 'unknown',
              size: 0,
              formattedSize: '0 B',
              reason: 'Error processing key',
              error: error.message
            });
          }
        }
      }

      orphanedData.formattedTotalSize = this.formatBytes(orphanedData.totalOrphanedSize);
      
      console.log(`Orphaned data detection complete. Found ${orphanedData.totalOrphanedCount} orphaned items totaling ${orphanedData.formattedTotalSize}`);
      
      this.emit('orphanedDataDetected', orphanedData);
      return orphanedData;

    } catch (error) {
      console.error('Error detecting orphaned data:', error);
      this.emit('orphanDetectionError', { error: error.message });
      throw error;
    }
  }

  /**
   * Find orphaned nodes within a node array (nodes with broken references)
   * @param {Array} nodes - Array of nodes to check
   * @param {string} worldId - World ID for context
   * @returns {Promise<Array>} Array of orphaned node issues
   */
  async findOrphanedNodesInArray(nodes, worldId) {
    const orphanedIssues = [];
    const characters = await this.getWorldCharacters(worldId);
    const characterIds = new Set(characters.map(c => c.id));

    for (const node of nodes) {
      const issues = [];
      
      // Check character references
      if (node.characters && Array.isArray(node.characters)) {
        const invalidCharacterRefs = node.characters.filter(charId => !characterIds.has(charId));
        if (invalidCharacterRefs.length > 0) {
          issues.push(`Invalid character references: ${invalidCharacterRefs.join(', ')}`);
        }
      }

      // Check connection references
      if (node.connections && Array.isArray(node.connections)) {
        const nodeIds = new Set(nodes.map(n => n.id));
        const invalidConnections = node.connections.filter(connId => !nodeIds.has(connId));
        if (invalidConnections.length > 0) {
          issues.push(`Invalid node connections: ${invalidConnections.join(', ')}`);
        }
      }

      if (issues.length > 0) {
        orphanedIssues.push({
          nodeId: node.id,
          nodeName: node.name,
          issues: issues
        });
      }
    }

    return orphanedIssues;
  }

  /**
   * Find orphaned characters within a character array
   * @param {Array} characters - Array of characters to check
   * @param {string} worldId - World ID for context
   * @returns {Promise<Array>} Array of orphaned character issues
   */
  async findOrphanedCharactersInArray(characters, worldId) {
    const orphanedIssues = [];
    const interactions = await this.getWorldInteractions(worldId);
    const encounters = await this.getWorldEncounters(worldId);
    const nodes = await this.getWorldNodes(worldId);
    
    const interactionIds = new Set(interactions.map(i => i.id));
    const encounterIds = new Set(encounters.map(e => e.id));
    const nodeIds = new Set(nodes.map(n => n.id));

    for (const character of characters) {
      const issues = [];

      // Check interaction references
      if (character.interactionIds && Array.isArray(character.interactionIds)) {
        const invalidInteractionRefs = character.interactionIds.filter(intId => !interactionIds.has(intId));
        if (invalidInteractionRefs.length > 0) {
          issues.push(`Invalid interaction references: ${invalidInteractionRefs.join(', ')}`);
        }
      }

      // Check encounter references
      if (character.encounterIds && Array.isArray(character.encounterIds)) {
        const invalidEncounterRefs = character.encounterIds.filter(encId => !encounterIds.has(encId));
        if (invalidEncounterRefs.length > 0) {
          issues.push(`Invalid encounter references: ${invalidEncounterRefs.join(', ')}`);
        }
      }

      // Check location references
      if (character.locationId && !nodeIds.has(character.locationId)) {
        issues.push(`Invalid location reference: ${character.locationId}`);
      }

      // Check relationship references
      if (character.relationships && Array.isArray(character.relationships)) {
        const characterIds = new Set(characters.map(c => c.id));
        for (const relationship of character.relationships) {
          if (relationship.targetCharacterId && !characterIds.has(relationship.targetCharacterId)) {
            issues.push(`Invalid relationship target: ${relationship.targetCharacterId}`);
          }
        }
      }

      if (issues.length > 0) {
        orphanedIssues.push({
          characterId: character.id,
          characterName: character.name,
          issues: issues
        });
      }
    }

    return orphanedIssues;
  }

  /**
   * Find orphaned interactions within an interaction array
   * @param {Array} interactions - Array of interactions to check
   * @param {string} worldId - World ID for context
   * @returns {Promise<Array>} Array of orphaned interaction issues
   */
  async findOrphanedInteractionsInArray(interactions, worldId) {
    const orphanedIssues = [];
    const characters = await this.getWorldCharacters(worldId);
    const nodes = await this.getWorldNodes(worldId);
    
    const characterIds = new Set(characters.map(c => c.id));
    const nodeIds = new Set(nodes.map(n => n.id));

    for (const interaction of interactions) {
      const issues = [];

      // Check participant references
      if (interaction.participants && Array.isArray(interaction.participants)) {
        const invalidParticipants = interaction.participants.filter(partId => !characterIds.has(partId));
        if (invalidParticipants.length > 0) {
          issues.push(`Invalid participant references: ${invalidParticipants.join(', ')}`);
        }
      }

      // Check location references
      if (interaction.locationId && !nodeIds.has(interaction.locationId)) {
        issues.push(`Invalid location reference: ${interaction.locationId}`);
      }

      if (issues.length > 0) {
        orphanedIssues.push({
          interactionId: interaction.id,
          interactionName: interaction.name || 'Unnamed Interaction',
          issues: issues
        });
      }
    }

    return orphanedIssues;
  }

  /**
   * Find orphaned encounters within an encounter array
   * @param {Array} encounters - Array of encounters to check
   * @param {string} worldId - World ID for context
   * @returns {Promise<Array>} Array of orphaned encounter issues
   */
  async findOrphanedEncountersInArray(encounters, worldId) {
    const orphanedIssues = [];
    const characters = await this.getWorldCharacters(worldId);
    const nodes = await this.getWorldNodes(worldId);
    
    const characterIds = new Set(characters.map(c => c.id));
    const nodeIds = new Set(nodes.map(n => n.id));

    for (const encounter of encounters) {
      const issues = [];

      // Check participant references
      if (encounter.participants && Array.isArray(encounter.participants)) {
        const invalidParticipants = encounter.participants.filter(partId => !characterIds.has(partId));
        if (invalidParticipants.length > 0) {
          issues.push(`Invalid participant references: ${invalidParticipants.join(', ')}`);
        }
      }

      // Check location references
      if (encounter.location && !nodeIds.has(encounter.location)) {
        issues.push(`Invalid location reference: ${encounter.location}`);
      }

      if (issues.length > 0) {
        orphanedIssues.push({
          encounterId: encounter.id,
          encounterName: encounter.name || 'Unnamed Encounter',
          issues: issues
        });
      }
    }

    return orphanedIssues;
  }

  /**
   * Get storage breakdown by data type for a specific world
   * @param {string} worldId - ID of world to analyze
   * @returns {Promise<Object>} Detailed storage breakdown
   */
  async getWorldStorageBreakdown(worldId) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      const breakdown = {
        worldId,
        world: 0,
        nodes: 0,
        characters: 0,
        interactions: 0,
        encounters: 0,
        total: 0
      };

      // Check world data
      const worldData = localStorage.getItem(`${this.storageKeys.WORLD_PREFIX}${worldId}`);
      if (worldData) {
        breakdown.world = worldData.length * 2; // UTF-16 bytes
      }

      // Check nodes data
      const nodesData = localStorage.getItem(`${this.storageKeys.NODES_PREFIX}${worldId}`);
      if (nodesData) {
        breakdown.nodes = nodesData.length * 2;
      }

      // Check characters data
      const charactersData = localStorage.getItem(`${this.storageKeys.CHARACTERS_PREFIX}${worldId}`);
      if (charactersData) {
        breakdown.characters = charactersData.length * 2;
      }

      // Check interactions data
      const interactionsData = localStorage.getItem(`${this.storageKeys.INTERACTIONS_PREFIX}${worldId}`);
      if (interactionsData) {
        breakdown.interactions = interactionsData.length * 2;
      }

      // Check encounters data
      const encountersData = localStorage.getItem(`${this.storageKeys.ENCOUNTERS_PREFIX}${worldId}`);
      if (encountersData) {
        breakdown.encounters = encountersData.length * 2;
      }

      breakdown.total = breakdown.world + breakdown.nodes + breakdown.characters + breakdown.interactions + breakdown.encounters;

      // Add formatted versions
      breakdown.formatted = {
        world: this.formatBytes(breakdown.world),
        nodes: this.formatBytes(breakdown.nodes),
        characters: this.formatBytes(breakdown.characters),
        interactions: this.formatBytes(breakdown.interactions),
        encounters: this.formatBytes(breakdown.encounters),
        total: this.formatBytes(breakdown.total)
      };

      return breakdown;

    } catch (error) {
      console.error('Error getting world storage breakdown:', error);
      return { 
        worldId, 
        world: 0, 
        nodes: 0, 
        characters: 0, 
        interactions: 0, 
        encounters: 0, 
        total: 0,
        formatted: {
          world: '0 B',
          nodes: '0 B',
          characters: '0 B',
          interactions: '0 B',
          encounters: '0 B',
          total: '0 B'
        }
      };
    }
  }

  /**
   * Clean up unused or corrupted data
   * @returns {Promise<Object>} Cleanup results
   */
  async cleanupStorage() {
    try {
      const cleanupResults = {
        removedKeys: [],
        reclaimedSpace: 0,
        errors: []
      };

      // Get list of valid world IDs
      const worlds = await this.getAllWorlds();
      const validWorldIds = new Set(worlds.map(w => w.id));

      // Check all localStorage keys
      const keysToRemove = [];
      let reclaimedBytes = 0;

      for (let key in localStorage) {
        if (key.startsWith('worldHistorySimulator_')) {
          try {
            // Check if it's a world-specific key
            if (key.startsWith(this.storageKeys.WORLD_PREFIX)) {
              const worldId = key.replace(this.storageKeys.WORLD_PREFIX, '');
              if (!validWorldIds.has(worldId)) {
                keysToRemove.push(key);
                reclaimedBytes += localStorage[key].length * 2;
              }
            } else if (key.startsWith(this.storageKeys.NODES_PREFIX) ||
                      key.startsWith(this.storageKeys.CHARACTERS_PREFIX) ||
                      key.startsWith(this.storageKeys.INTERACTIONS_PREFIX) ||
                      key.startsWith(this.storageKeys.ENCOUNTERS_PREFIX)) {
              
              // Extract world ID from key
              const worldId = key.split('_').pop();
              if (!validWorldIds.has(worldId)) {
                keysToRemove.push(key);
                reclaimedBytes += localStorage[key].length * 2;
              }
            }

            // Check for corrupted data
            if (key !== this.storageKeys.WORLDS && key !== this.storageKeys.METADATA) {
              try {
                JSON.parse(localStorage[key]);
              } catch (parseError) {
                console.warn(`Corrupted data found in key: ${key}`);
                keysToRemove.push(key);
                reclaimedBytes += localStorage[key].length * 2;
                cleanupResults.errors.push(`Corrupted data in ${key}: ${parseError.message}`);
              }
            }

          } catch (error) {
            cleanupResults.errors.push(`Error checking key ${key}: ${error.message}`);
          }
        }
      }

      // Remove identified keys
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          cleanupResults.removedKeys.push(key);
        } catch (error) {
          cleanupResults.errors.push(`Failed to remove key ${key}: ${error.message}`);
        }
      });

      cleanupResults.reclaimedSpace = reclaimedBytes;
      cleanupResults.formattedReclaimedSpace = this.formatBytes(reclaimedBytes);

      this.emit('storageCleanup', cleanupResults);
      return cleanupResults;

    } catch (error) {
      this.emit('cleanupError', { error: error.message });
      throw error;
    }
  }

  /**
   * Get storage recommendations to free up space
   * @returns {Promise<Array>} Array of recommendations
   */
  async getStorageRecommendations() {
    try {
      const recommendations = [];
      const stats = this.getStorageStats();
      const worlds = await this.getAllWorlds();

      // If storage is over 80% full
      if (stats.percentageUsed > 80) {
        recommendations.push({
          type: 'critical',
          priority: 'high',
          message: `Storage is ${stats.percentageUsed.toFixed(1)}% full. Consider deleting unused worlds or data.`,
          action: 'deleteWorlds',
          impact: 'high'
        });

        // Find largest worlds
        const worldSizes = [];
        for (const world of worlds) {
          try {
            const breakdown = await this.getWorldStorageBreakdown(world.id);
            worldSizes.push({
              worldId: world.id,
              worldName: world.name,
              size: breakdown.total,
              formattedSize: breakdown.formatted.total
            });
          } catch (error) {
            console.error(`Error getting size for world ${world.id}:`, error);
          }
        }

        // Sort by size (largest first)
        worldSizes.sort((a, b) => b.size - a.size);

        if (worldSizes.length > 0) {
          const largestWorld = worldSizes[0];
          recommendations.push({
            type: 'suggestion',
            priority: 'medium',
            message: `Largest world "${largestWorld.worldName}" uses ${largestWorld.formattedSize}. Consider deleting if no longer needed.`,
            action: 'deleteSpecificWorld',
            worldId: largestWorld.worldId,
            impact: 'medium'
          });
        }
      }

      // If storage is over 90% full
      if (stats.percentageUsed > 90) {
        recommendations.push({
          type: 'warning',
          priority: 'critical',
          message: `Storage critically full at ${stats.percentageUsed.toFixed(1)}%. New saves may fail.`,
          action: 'immediate',
          impact: 'critical'
        });
      }

      // Check for cleanup opportunities
      const cleanupTest = await this.cleanupStorage();
      if (cleanupTest.reclaimedSpace > 0) {
        recommendations.push({
          type: 'suggestion',
          priority: 'low',
          message: `Storage cleanup could reclaim ${this.formatBytes(cleanupTest.reclaimedSpace)} of orphaned data.`,
          action: 'cleanup',
          impact: 'low'
        });
      }

      return recommendations;

    } catch (error) {
      console.error('Error generating storage recommendations:', error);
      return [];
    }
  }

  /**
   * Clean up orphaned data
   * @param {Object} orphanedData - Result from detectOrphanedData()
   * @param {Object} options - Cleanup options
   * @param {boolean} options.removeCompletelyOrphaned - Remove data for non-existent worlds
   * @param {boolean} options.fixBrokenReferences - Fix broken references within data
   * @param {boolean} options.removeCorrupted - Remove corrupted data
   * @param {boolean} options.dryRun - Only report what would be cleaned, don't actually clean
   * @returns {Promise<Object>} Cleanup results
   */
  async cleanupOrphanedData(orphanedData = null, options = {}) {
    try {
      const defaultOptions = {
        removeCompletelyOrphaned: true,
        fixBrokenReferences: true,
        removeCorrupted: true,
        dryRun: false
      };
      
      const cleanupOptions = { ...defaultOptions, ...options };
      
      // Detect orphaned data if not provided
      if (!orphanedData) {
        console.log('Detecting orphaned data for cleanup...');
        orphanedData = await this.detectOrphanedData();
      }

      const cleanupResults = {
        removedKeys: [],
        fixedReferences: [],
        reclaimedSpace: 0,
        errors: [],
        dryRun: cleanupOptions.dryRun,
        summary: {
          totalItemsProcessed: 0,
          totalKeysRemoved: 0,
          totalReferencesFixed: 0,
          totalSpaceReclaimed: 0
        }
      };

      console.log(`Starting orphaned data cleanup (dry run: ${cleanupOptions.dryRun})`);

      // Remove completely orphaned world data
      if (cleanupOptions.removeCompletelyOrphaned) {
        await this.cleanupCompletelyOrphanedData(orphanedData, cleanupOptions, cleanupResults);
      }

      // Fix broken references within existing data
      if (cleanupOptions.fixBrokenReferences) {
        await this.fixBrokenReferences(orphanedData, cleanupOptions, cleanupResults);
      }

      // Remove corrupted data
      if (cleanupOptions.removeCorrupted) {
        await this.removeCorruptedData(orphanedData, cleanupOptions, cleanupResults);
      }

      // Calculate summary
      cleanupResults.summary.totalKeysRemoved = cleanupResults.removedKeys.length;
      cleanupResults.summary.totalReferencesFixed = cleanupResults.fixedReferences.length;
      cleanupResults.summary.totalSpaceReclaimed = cleanupResults.reclaimedSpace;
      cleanupResults.summary.totalItemsProcessed = 
        orphanedData.orphanedWorldData.length +
        orphanedData.orphanedNodeData.length +
        orphanedData.orphanedCharacterData.length +
        orphanedData.orphanedInteractionData.length +
        orphanedData.orphanedEncounterData.length +
        orphanedData.corruptedData.length;

      cleanupResults.formattedSpaceReclaimed = this.formatBytes(cleanupResults.reclaimedSpace);

      console.log(`Orphaned data cleanup completed. Removed ${cleanupResults.summary.totalKeysRemoved} keys, fixed ${cleanupResults.summary.totalReferencesFixed} references, reclaimed ${cleanupResults.formattedSpaceReclaimed}`);

      this.emit('orphanedDataCleanup', cleanupResults);
      return cleanupResults;

    } catch (error) {
      console.error('Error during orphaned data cleanup:', error);
      this.emit('orphanCleanupError', { error: error.message });
      throw error;
    }
  }

  /**
   * Clean up completely orphaned data (data for non-existent worlds)
   * @param {Object} orphanedData - Orphaned data analysis
   * @param {Object} options - Cleanup options
   * @param {Object} results - Results object to update
   */
  async cleanupCompletelyOrphanedData(orphanedData, options, results) {
    const dataTypes = [
      'orphanedWorldData',
      'orphanedNodeData', 
      'orphanedCharacterData',
      'orphanedInteractionData',
      'orphanedEncounterData'
    ];

    for (const dataType of dataTypes) {
      const orphanedItems = orphanedData[dataType];
      
      for (const item of orphanedItems) {
        if (item.reason === 'Parent world does not exist' || item.reason === 'World not in worlds list') {
          try {
            if (!options.dryRun) {
              localStorage.removeItem(item.key);
            }
            
            results.removedKeys.push({
              key: item.key,
              worldId: item.worldId,
              reason: item.reason,
              size: item.size,
              formattedSize: item.formattedSize
            });
            
            results.reclaimedSpace += item.size;

          } catch (error) {
            results.errors.push({
              key: item.key,
              action: 'remove',
              error: error.message
            });
          }
        }
      }
    }
  }

  /**
   * Fix broken references within existing data
   * @param {Object} orphanedData - Orphaned data analysis
   * @param {Object} options - Cleanup options
   * @param {Object} results - Results object to update
   */
  async fixBrokenReferences(orphanedData, options, results) {
    // Fix broken references in characters
    for (const characterIssue of orphanedData.orphanedCharacterData) {
      if (characterIssue.orphanedCharacters) {
        await this.fixCharacterReferences(characterIssue, options, results);
      }
    }

    // Fix broken references in interactions
    for (const interactionIssue of orphanedData.orphanedInteractionData) {
      if (interactionIssue.orphanedInteractions) {
        await this.fixInteractionReferences(interactionIssue, options, results);
      }
    }
  }

  /**
   * Fix character references
   * @param {Object} characterIssue - Character issue data
   * @param {Object} options - Cleanup options
   * @param {Object} results - Results object to update
   */
  async fixCharacterReferences(characterIssue, options, results) {
    try {
      const characters = JSON.parse(localStorage.getItem(characterIssue.key));
      let hasChanges = false;

      for (const character of characters) {
        const orphanedChar = characterIssue.orphanedCharacters.find(oc => oc.characterId === character.id);
        if (orphanedChar) {
          // Clean up interaction references
          if (character.interactionIds && Array.isArray(character.interactionIds)) {
            const originalCount = character.interactionIds.length;
            character.interactionIds = character.interactionIds.filter(id => id && typeof id === 'string');
            if (character.interactionIds.length !== originalCount) {
              hasChanges = true;
            }
          }

          // Clean up encounter references
          if (character.encounterIds && Array.isArray(character.encounterIds)) {
            const originalCount = character.encounterIds.length;
            character.encounterIds = character.encounterIds.filter(id => id && typeof id === 'string');
            if (character.encounterIds.length !== originalCount) {
              hasChanges = true;
            }
          }

          // Clean up relationship references
          if (character.relationships && Array.isArray(character.relationships)) {
            const characterIds = new Set(characters.map(c => c.id));
            const originalCount = character.relationships.length;
            character.relationships = character.relationships.filter(rel => 
              rel.targetCharacterId && characterIds.has(rel.targetCharacterId)
            );
            if (character.relationships.length !== originalCount) {
              hasChanges = true;
            }
          }
        }
      }

      if (hasChanges && !options.dryRun) {
        localStorage.setItem(characterIssue.key, JSON.stringify(characters));
      }

      if (hasChanges) {
        results.fixedReferences.push({
          key: characterIssue.key,
          worldId: characterIssue.worldId,
          type: 'characters',
          issuesFixed: characterIssue.orphanedCharacters.length
        });
      }

    } catch (error) {
      results.errors.push({
        key: characterIssue.key,
        action: 'fix character references',
        error: error.message
      });
    }
  }

  /**
   * Fix interaction references
   * @param {Object} interactionIssue - Interaction issue data
   * @param {Object} options - Cleanup options
   * @param {Object} results - Results object to update
   */
  async fixInteractionReferences(interactionIssue, options, results) {
    try {
      const interactions = JSON.parse(localStorage.getItem(interactionIssue.key));
      let hasChanges = false;

      for (const interaction of interactions) {
        const orphanedInt = interactionIssue.orphanedInteractions.find(oi => oi.interactionId === interaction.id);
        if (orphanedInt) {
          // Clean up participant references
          if (interaction.participants && Array.isArray(interaction.participants)) {
            const originalCount = interaction.participants.length;
            interaction.participants = interaction.participants.filter(id => id && typeof id === 'string');
            if (interaction.participants.length !== originalCount) {
              hasChanges = true;
            }
          }
        }
      }

      if (hasChanges && !options.dryRun) {
        localStorage.setItem(interactionIssue.key, JSON.stringify(interactions));
      }

      if (hasChanges) {
        results.fixedReferences.push({
          key: interactionIssue.key,
          worldId: interactionIssue.worldId,
          type: 'interactions',
          issuesFixed: interactionIssue.orphanedInteractions.length
        });
      }

    } catch (error) {
      results.errors.push({
        key: interactionIssue.key,
        action: 'fix interaction references',
        error: error.message
      });
    }
  }

  /**
   * Remove corrupted data
   * @param {Object} orphanedData - Orphaned data analysis
   * @param {Object} options - Cleanup options
   * @param {Object} results - Results object to update
   */
  async removeCorruptedData(orphanedData, options, results) {
    for (const corruptedItem of orphanedData.corruptedData) {
      try {
        if (!options.dryRun) {
          localStorage.removeItem(corruptedItem.key);
        }
        
        results.removedKeys.push({
          key: corruptedItem.key,
          worldId: corruptedItem.worldId,
          reason: `Corrupted: ${corruptedItem.reason}`,
          size: corruptedItem.size,
          formattedSize: corruptedItem.formattedSize
        });
        
        results.reclaimedSpace += corruptedItem.size;

      } catch (error) {
        results.errors.push({
          key: corruptedItem.key,
          action: 'remove corrupted data',
          error: error.message
        });
      }
    }
  }

  /**
   * Auto-cleanup orphaned data (safe cleanup with conservative options)
   * @returns {Promise<Object>} Cleanup results
   */
  async autoCleanupOrphanedData() {
    console.log('Starting auto-cleanup of orphaned data...');
    
    const safeOptions = {
      removeCompletelyOrphaned: true,  // Safe - removes data for worlds that don't exist
      fixBrokenReferences: false,      // Conservative - don't auto-fix references
      removeCorrupted: true,           // Safe - removes clearly corrupted data
      dryRun: false
    };

    return await this.cleanupOrphanedData(null, safeOptions);
  }
}

// Create singleton instance
const worldPersistenceService = new WorldPersistenceService();

export default worldPersistenceService;
export { WorldPersistenceService };