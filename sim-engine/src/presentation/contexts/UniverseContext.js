/**
 * UniverseContext - React context for managing universe state
 * Provides universe-level state management and operations
 * Integrates with UniverseBuilder, UniverseValidator, and LocalStorageUniverseRepository
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Universe from '../../domain/entities/Universe.js';
import WorldState from '../../domain/entities/WorldState.js';
import UniverseBuilder from '../../domain/services/UniverseBuilder.js';
import UniverseValidator from '../../domain/services/UniverseValidator.js';
import LocalStorageUniverseRepository from '../../infrastructure/Persistance/LocalStorageUniverseRepository.js';
import TemplateManager from '../../template/TemplateManager.js';

const UniverseContext = createContext();

export const useUniverse = () => {
  const context = useContext(UniverseContext);
  if (!context) {
    throw new Error('useUniverse must be used within a UniverseProvider');
  }
  return context;
};

export const UniverseProvider = ({ children }) => {
  // Initialize template manager
  const [templateManager] = useState(() => new TemplateManager());
  
  // Universe state
  const [universe, setUniverse] = useState(null);
  const [activeWorldId, setActiveWorldId] = useState(null);
  const [universeList, setUniverseList] = useState([]);
  
  // Builder and validation state
  const [universeBuilder, setUniverseBuilder] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load universe list on mount
  useEffect(() => {
    const loadUniverseList = async () => {
      try {
        const list = await LocalStorageUniverseRepository.listUniverses();
        setUniverseList(list);
      } catch (err) {
        console.error('Error loading universe list:', err);
        setError(err.message);
      }
    };

    loadUniverseList();
  }, []);

  /**
   * Creates a new universe builder
   */
  const createUniverseBuilder = useCallback(() => {
    const builder = new UniverseBuilder(templateManager);
    setUniverseBuilder(builder);
    return builder;
  }, [templateManager]);

  /**
   * Builds and sets the current universe from builder
   */
  const buildUniverse = useCallback(() => {
    if (!universeBuilder) {
      throw new Error('No universe builder available. Call createUniverseBuilder first.');
    }

    try {
      const builtUniverse = universeBuilder.build();
      setUniverse(builtUniverse);
      
      // Validate the built universe
      const validation = UniverseValidator.validate(builtUniverse);
      setValidationResult(validation);
      
      // Set first world as active if available
      if (builtUniverse.worlds.length > 0) {
        setActiveWorldId(builtUniverse.worlds[0].id);
      }
      
      return builtUniverse;
    } catch (err) {
      console.error('Error building universe:', err);
      setError(err.message);
      throw err;
    }
  }, [universeBuilder]);

  /**
   * Loads a universe from storage
   */
  const loadUniverse = useCallback(async (universeId, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedUniverse = await LocalStorageUniverseRepository.loadUniverse(universeId, options);
      
      if (!loadedUniverse) {
        throw new Error(`Universe ${universeId} not found`);
      }

      setUniverse(loadedUniverse);
      
      // Validate loaded universe
      const validation = UniverseValidator.validate(loadedUniverse);
      setValidationResult(validation);
      
      // Set first world as active if available
      if (loadedUniverse.worlds.length > 0) {
        setActiveWorldId(loadedUniverse.worlds[0].id);
      }

      return loadedUniverse;
    } catch (err) {
      console.error('Error loading universe:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Saves the current universe to storage
   */
  const saveUniverse = useCallback(async (universeToSave = null, options = {}) => {
    const targetUniverse = universeToSave || universe;
    
    if (!targetUniverse) {
      throw new Error('No universe to save');
    }

    setIsLoading(true);
    setError(null);

    try {
      await LocalStorageUniverseRepository.saveUniverse(targetUniverse, options);
      
      // Update universe list
      const list = await LocalStorageUniverseRepository.listUniverses();
      setUniverseList(list);
      
      // If we saved a new universe, set it as current
      if (universeToSave && universeToSave !== universe) {
        setUniverse(universeToSave);
      }
      
      return true;
    } catch (err) {
      console.error('Error saving universe:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [universe]);

  /**
   * Deletes a universe from storage
   */
  const deleteUniverse = useCallback(async (universeId, deleteWorlds = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const deleted = await LocalStorageUniverseRepository.deleteUniverse(universeId, deleteWorlds);
      
      if (deleted) {
        // Update universe list
        const list = await LocalStorageUniverseRepository.listUniverses();
        setUniverseList(list);
        
        // Clear current universe if it was deleted
        if (universe && universe.id === universeId) {
          setUniverse(null);
          setActiveWorldId(null);
        }
      }
      
      return deleted;
    } catch (err) {
      console.error('Error deleting universe:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [universe]);

  /**
   * Sets a new universe (from external source)
   */
  const setCurrentUniverse = useCallback((newUniverse) => {
    if (newUniverse && !(newUniverse instanceof Universe)) {
      throw new Error('Universe must be a Universe instance');
    }

    setUniverse(newUniverse);
    
    if (newUniverse) {
      // Validate the universe
      const validation = UniverseValidator.validate(newUniverse);
      setValidationResult(validation);
      
      // Set first world as active if available
      if (newUniverse.worlds.length > 0 && !activeWorldId) {
        setActiveWorldId(newUniverse.worlds[0].id);
      }
    } else {
      setValidationResult(null);
      setActiveWorldId(null);
    }
  }, [activeWorldId]);

  /**
   * Gets the active world
   */
  const getActiveWorld = useCallback(() => {
    if (!universe || !activeWorldId) {
      return null;
    }
    return universe.getWorld(activeWorldId);
  }, [universe, activeWorldId]);

  /**
   * Switches to a different world
   */
  const switchWorld = useCallback((worldId) => {
    if (!universe) {
      throw new Error('No universe loaded');
    }

    const world = universe.getWorld(worldId);
    if (!world) {
      throw new Error(`World ${worldId} not found in universe`);
    }

    setActiveWorldId(worldId);
    return world;
  }, [universe]);

  /**
   * Gets all worlds connected to a specific world
   */
  const getConnectedWorlds = useCallback((worldId) => {
    if (!universe) {
      return [];
    }
    return universe.getConnectedWorlds(worldId);
  }, [universe]);

  /**
   * Gets all connections for a specific world
   */
  const getWorldConnections = useCallback((worldId) => {
    if (!universe) {
      return [];
    }
    return universe.getWorldConnections(worldId);
  }, [universe]);

  /**
   * Adds a world to the current universe
   */
  const addWorld = useCallback((world) => {
    if (!universe) {
      throw new Error('No universe loaded');
    }

    try {
      universe.addWorld(world);
      setUniverse(new Universe(universe.toJSON())); // Trigger re-render
      
      // Revalidate
      const validation = UniverseValidator.validate(universe);
      setValidationResult(validation);
      
      return true;
    } catch (err) {
      console.error('Error adding world:', err);
      setError(err.message);
      throw err;
    }
  }, [universe]);

  /**
   * Removes a world from the current universe
   */
  const removeWorld = useCallback((worldId) => {
    if (!universe) {
      throw new Error('No universe loaded');
    }

    try {
      const removed = universe.removeWorld(worldId);
      
      if (removed) {
        setUniverse(new Universe(universe.toJSON())); // Trigger re-render
        
        // Clear active world if it was removed
        if (activeWorldId === worldId) {
          setActiveWorldId(universe.worlds.length > 0 ? universe.worlds[0].id : null);
        }
        
        // Revalidate
        const validation = UniverseValidator.validate(universe);
        setValidationResult(validation);
      }
      
      return removed;
    } catch (err) {
      console.error('Error removing world:', err);
      setError(err.message);
      throw err;
    }
  }, [universe, activeWorldId]);

  /**
   * Connects two worlds
   */
  const connectWorlds = useCallback((sourceWorldId, targetWorldId, connectionConfig = {}) => {
    if (!universe) {
      throw new Error('No universe loaded');
    }

    try {
      universe.connectWorlds(sourceWorldId, targetWorldId, connectionConfig);
      setUniverse(new Universe(universe.toJSON())); // Trigger re-render
      
      // Revalidate
      const validation = UniverseValidator.validate(universe);
      setValidationResult(validation);
      
      return true;
    } catch (err) {
      console.error('Error connecting worlds:', err);
      setError(err.message);
      throw err;
    }
  }, [universe]);

  /**
   * Disconnects two worlds
   */
  const disconnectWorlds = useCallback((sourceWorldId, targetWorldId, removeBidirectional = true) => {
    if (!universe) {
      throw new Error('No universe loaded');
    }

    try {
      const disconnected = universe.disconnectWorlds(sourceWorldId, targetWorldId, removeBidirectional);
      
      if (disconnected) {
        setUniverse(new Universe(universe.toJSON())); // Trigger re-render
        
        // Revalidate
        const validation = UniverseValidator.validate(universe);
        setValidationResult(validation);
      }
      
      return disconnected;
    } catch (err) {
      console.error('Error disconnecting worlds:', err);
      setError(err.message);
      throw err;
    }
  }, [universe]);

  /**
   * Validates the current universe
   */
  const validateUniverse = useCallback(() => {
    if (!universe) {
      return null;
    }

    const validation = UniverseValidator.validate(universe);
    setValidationResult(validation);
    return validation;
  }, [universe]);

  /**
   * Gets universe statistics
   */
  const getStatistics = useCallback(() => {
    if (!universe) {
      return null;
    }
    return universe.getStatistics();
  }, [universe]);

  /**
   * Clears all universe state
   */
  const clearUniverse = useCallback(() => {
    setUniverse(null);
    setActiveWorldId(null);
    setUniverseBuilder(null);
    setValidationResult(null);
    setError(null);
  }, []);

  /**
   * Gets all universes from storage
   */
  const getAllUniverses = useCallback(async () => {
    try {
      const list = await LocalStorageUniverseRepository.listUniverses();
      setUniverseList(list);
      return list;
    } catch (err) {
      console.error('Error getting all universes:', err);
      setError(err.message);
      return [];
    }
  }, []);

  const value = {
    // State
    universe,
    activeWorldId,
    activeWorld: getActiveWorld(),
    universeList,
    validationResult,
    isLoading,
    error,
    universeBuilder,

    // Universe operations
    createUniverseBuilder,
    buildUniverse,
    loadUniverse,
    saveUniverse,
    deleteUniverse,
    setCurrentUniverse,
    clearUniverse,
    getAllUniverses,

    // World operations
    getActiveWorld,
    switchWorld,
    addWorld,
    removeWorld,

    // Connection operations
    getConnectedWorlds,
    getWorldConnections,
    connectWorlds,
    disconnectWorlds,

    // Validation and stats
    validateUniverse,
    getStatistics
  };

  return (
    <UniverseContext.Provider value={value}>
      {children}
    </UniverseContext.Provider>
  );
};

export default UniverseContext;
