// src/infrastructure/Persistance/LocalStorageUniverseRepository.js

import Universe from '../../domain/entities/Universe.js';
import WorldState from '../../domain/entities/WorldState.js';
import WorldConnection from '../../domain/value-objects/WorldConnection.js';

/**
 * LocalStorageUniverseRepository - Persistence layer for Universe entities
 * Handles saving/loading universes with proper serialization
 * Supports both full universe storage and reference-based storage for efficiency
 */
const LocalStorageUniverseRepository = {
  /**
   * Saves a universe to localStorage
   * @param {Universe} universe - Universe to save
   * @param {Object} options - Save options
   * @param {boolean} options.saveWorlds - Whether to save full world data (default: false, uses references)
   * @returns {Promise<void>}
   */
  saveUniverse: async (universe, options = {}) => {
    const { saveWorlds = false } = options;

    if (!universe || !(universe instanceof Universe)) {
      throw new Error('Universe must be a Universe instance');
    }

    // Convert universe to JSON
    const universeData = universe.toJSON();

    // If saveWorlds is false, only store world IDs for reference
    if (!saveWorlds) {
      universeData.worlds = universeData.worlds.map(world => ({
        id: world.id,
        name: world.name,
        isReference: true
      }));
    }

    // Save to localStorage with universe ID as key
    const key = `universe_${universe.id}`;
    localStorage.setItem(key, JSON.stringify(universeData));

    // Update universe list
    await LocalStorageUniverseRepository._updateUniverseList(universe.id, universe.name);

    return Promise.resolve();
  },

  /**
   * Loads a universe from localStorage
   * @param {string} universeId - Universe ID to load
   * @param {Object} options - Load options
   * @param {boolean} options.loadWorlds - Whether to load full world data (default: true)
   * @returns {Promise<Universe|null>} Loaded universe or null if not found
   */
  loadUniverse: async (universeId, options = {}) => {
    const { loadWorlds = true } = options;

    if (!universeId || typeof universeId !== 'string') {
      throw new Error('Universe ID must be a non-empty string');
    }

    const key = `universe_${universeId}`;
    const savedData = localStorage.getItem(key);

    if (!savedData) {
      return null;
    }

    try {
      const universeData = JSON.parse(savedData);

      // If worlds are references, load them from separate storage
      if (loadWorlds && universeData.worlds) {
        const loadedWorlds = [];
        
        for (const worldRef of universeData.worlds) {
          if (worldRef.isReference) {
            // Load world from separate storage
            const world = await LocalStorageUniverseRepository._loadWorldById(worldRef.id);
            if (world) {
              loadedWorlds.push(world);
            }
          } else {
            // World data is embedded, convert to WorldState
            loadedWorlds.push(new WorldState(worldRef));
          }
        }

        universeData.worlds = loadedWorlds;
      }

      // Convert world connections to WorldConnection instances
      if (universeData.worldConnections) {
        universeData.worldConnections = universeData.worldConnections.map(conn =>
          new WorldConnection(conn)
        );
      }

      // Create Universe instance
      return Universe.fromJSON(universeData);
    } catch (error) {
      console.error(`Error loading universe ${universeId}:`, error);
      return null;
    }
  },

  /**
   * Deletes a universe from localStorage
   * @param {string} universeId - Universe ID to delete
   * @param {boolean} deleteWorlds - Whether to delete associated worlds (default: false)
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  deleteUniverse: async (universeId, deleteWorlds = false) => {
    if (!universeId || typeof universeId !== 'string') {
      throw new Error('Universe ID must be a non-empty string');
    }

    const key = `universe_${universeId}`;
    const savedData = localStorage.getItem(key);

    if (!savedData) {
      return false;
    }

    // If deleteWorlds is true, delete all associated worlds
    if (deleteWorlds) {
      try {
        const universeData = JSON.parse(savedData);
        if (universeData.worlds && Array.isArray(universeData.worlds)) {
          for (const worldRef of universeData.worlds) {
            const worldId = worldRef.id || worldRef;
            await LocalStorageUniverseRepository._deleteWorldById(worldId);
          }
        }
      } catch (error) {
        console.error(`Error deleting worlds for universe ${universeId}:`, error);
      }
    }

    // Remove universe from storage
    localStorage.removeItem(key);

    // Update universe list
    await LocalStorageUniverseRepository._removeFromUniverseList(universeId);

    return true;
  },

  /**
   * Lists all saved universes
   * @returns {Promise<Array>} Array of universe metadata
   */
  listUniverses: async () => {
    const listKey = 'universe_list';
    const savedList = localStorage.getItem(listKey);

    if (!savedList) {
      return [];
    }

    try {
      return JSON.parse(savedList);
    } catch (error) {
      console.error('Error parsing universe list:', error);
      return [];
    }
  },

  /**
   * Checks if a universe exists
   * @param {string} universeId - Universe ID to check
   * @returns {Promise<boolean>} True if exists
   */
  exists: async (universeId) => {
    if (!universeId || typeof universeId !== 'string') {
      return false;
    }

    const key = `universe_${universeId}`;
    return localStorage.getItem(key) !== null;
  },

  /**
   * Updates universe metadata without loading full data
   * @param {string} universeId - Universe ID
   * @param {Object} metadata - Metadata to update
   * @returns {Promise<boolean>} True if updated
   */
  updateMetadata: async (universeId, metadata) => {
    const universe = await LocalStorageUniverseRepository.loadUniverse(universeId, { loadWorlds: false });
    
    if (!universe) {
      return false;
    }

    // Update metadata
    universe.metadata = { ...universe.metadata, ...metadata };
    universe.modifiedAt = new Date();

    await LocalStorageUniverseRepository.saveUniverse(universe, { saveWorlds: false });
    return true;
  },

  /**
   * Gets universe statistics without loading full data
   * @param {string} universeId - Universe ID
   * @returns {Promise<Object|null>} Statistics or null if not found
   */
  getStatistics: async (universeId) => {
    const key = `universe_${universeId}`;
    const savedData = localStorage.getItem(key);

    if (!savedData) {
      return null;
    }

    try {
      const universeData = JSON.parse(savedData);
      return {
        id: universeData.id,
        name: universeData.name,
        worldCount: universeData.worlds ? universeData.worlds.length : 0,
        connectionCount: universeData.worldConnections ? universeData.worldConnections.length : 0,
        cosmicEventCount: universeData.cosmicEvents ? universeData.cosmicEvents.length : 0,
        timeCoordination: universeData.timeCoordination,
        createdAt: universeData.createdAt,
        modifiedAt: universeData.modifiedAt
      };
    } catch (error) {
      console.error(`Error getting statistics for universe ${universeId}:`, error);
      return null;
    }
  },

  // Private helper methods

  /**
   * Updates the universe list with a new or updated universe
   * @private
   */
  _updateUniverseList: async (universeId, universeName) => {
    const listKey = 'universe_list';
    const savedList = localStorage.getItem(listKey);
    let universeList = [];

    if (savedList) {
      try {
        universeList = JSON.parse(savedList);
      } catch (error) {
        console.error('Error parsing universe list:', error);
        universeList = [];
      }
    }

    // Update or add universe to list
    const existingIndex = universeList.findIndex(u => u.id === universeId);
    const universeEntry = {
      id: universeId,
      name: universeName,
      lastModified: Date.now()
    };

    if (existingIndex >= 0) {
      universeList[existingIndex] = universeEntry;
    } else {
      universeList.push(universeEntry);
    }

    localStorage.setItem(listKey, JSON.stringify(universeList));
  },

  /**
   * Removes a universe from the list
   * @private
   */
  _removeFromUniverseList: async (universeId) => {
    const listKey = 'universe_list';
    const savedList = localStorage.getItem(listKey);

    if (!savedList) {
      return;
    }

    try {
      let universeList = JSON.parse(savedList);
      universeList = universeList.filter(u => u.id !== universeId);
      localStorage.setItem(listKey, JSON.stringify(universeList));
    } catch (error) {
      console.error('Error updating universe list:', error);
    }
  },

  /**
   * Loads a world by ID from separate world storage
   * @private
   */
  _loadWorldById: async (worldId) => {
    const key = `world_${worldId}`;
    const savedData = localStorage.getItem(key);

    if (!savedData) {
      console.warn(`World ${worldId} not found in storage`);
      return null;
    }

    try {
      const worldData = JSON.parse(savedData);
      return new WorldState(worldData);
    } catch (error) {
      console.error(`Error loading world ${worldId}:`, error);
      return null;
    }
  },

  /**
   * Deletes a world by ID from storage
   * @private
   */
  _deleteWorldById: async (worldId) => {
    const key = `world_${worldId}`;
    localStorage.removeItem(key);
  }
};

export default LocalStorageUniverseRepository;
