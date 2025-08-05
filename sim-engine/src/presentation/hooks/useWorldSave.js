/**
 * useWorldSave - React hook for world saving operations
 * 
 * Provides a clean interface for components to interact with world saving,
 * including save status, auto-save controls, and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import worldSaveManager from '../../application/services/WorldSaveManager';
import editorStateManager from '../../application/services/EditorStateManager';
import worldPersistenceService from '../../application/services/WorldPersistenceService';

export const useWorldSave = () => {
  const [saveStatus, setSaveStatus] = useState(worldSaveManager.getSaveStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  
  // World context state
  const [currentWorld, setCurrentWorld] = useState(null);
  const [worldLoading, setWorldLoading] = useState(false);
  const [worldNodes, setWorldNodes] = useState([]);
  const [worldCharacters, setWorldCharacters] = useState([]);
  const [worldInteractions, setWorldInteractions] = useState([]);
  const [worldEncounters, setWorldEncounters] = useState([]);

  // Load world context on mount or when world changes
  useEffect(() => {
    const loadWorldContext = async () => {
      const editorState = editorStateManager.getState();
      const worldId = editorState.currentWorld?.id;
      
      if (worldId && (!currentWorld || currentWorld?.id !== worldId)) {
        setWorldLoading(true);
        try {
          // Load complete world data
          const world = await worldPersistenceService.loadWorld(worldId);
          setCurrentWorld(world);
          
          // Set individual arrays for easy access
          setWorldNodes(world.nodes || []);
          setWorldCharacters(world.characters || []);
          setWorldInteractions(world.interactions || []);
          setWorldEncounters(world.encounters || []);
          
        } catch (error) {
          console.error('Failed to load world context:', error);
          setError(error.message);
        }
        setWorldLoading(false);
      } else if (!worldId) {
        // Clear world context if no world is selected
        setCurrentWorld(null);
        setWorldNodes([]);
        setWorldCharacters([]);
        setWorldInteractions([]);
        setWorldEncounters([]);
      }
    };

    loadWorldContext();
  }, [currentWorld, currentWorld?.id]);

  // Update save status when editor state changes
  useEffect(() => {
    const updateSaveStatus = () => {
      setSaveStatus(worldSaveManager.getSaveStatus());
    };

    // Listen to editor state changes
    const unsubscribeEditor = editorStateManager.subscribe('saveStatusChanged', updateSaveStatus);
    const unsubscribeUnsaved = editorStateManager.subscribe('unsavedChangesChanged', updateSaveStatus);

    // Listen to save manager events
    const handleSaveStarted = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleSaveCompleted = (worldData) => {
      setIsLoading(false);
      setError(null);
      setLastSaveTime(new Date());
      setSaveStatus(worldSaveManager.getSaveStatus());
    };

    const handleSaveError = (error) => {
      setIsLoading(false);
      setError(error.message || 'Save failed');
      setSaveStatus(worldSaveManager.getSaveStatus());
    };

    const handleAutoSaveCompleted = () => {
      setLastSaveTime(new Date());
      setSaveStatus(worldSaveManager.getSaveStatus());
    };

    // Navigation event handlers
    const handleNavigationStarted = (data) => {
      setIsLoading(true);
      setError(null);
    };

    const handleNavigationCompleted = (data) => {
      setIsLoading(false);
      setSaveStatus(worldSaveManager.getSaveStatus());
    };

    const handleNavigationError = (data) => {
      setIsLoading(false);
      setError(data.error);
    };

    // Subscribe to save manager events
    worldSaveManager.on('saveStarted', handleSaveStarted);
    worldSaveManager.on('saveCompleted', handleSaveCompleted);
    worldSaveManager.on('saveError', handleSaveError);
    worldSaveManager.on('autoSaveCompleted', handleAutoSaveCompleted);
    
    // Subscribe to navigation events
    worldSaveManager.on('navigationStarted', handleNavigationStarted);
    worldSaveManager.on('navigationCompleted', handleNavigationCompleted);
    worldSaveManager.on('navigationError', handleNavigationError);

    return () => {
      unsubscribeEditor();
      unsubscribeUnsaved();
      worldSaveManager.off('saveStarted', handleSaveStarted);
      worldSaveManager.off('saveCompleted', handleSaveCompleted);
      worldSaveManager.off('saveError', handleSaveError);
      worldSaveManager.off('autoSaveCompleted', handleAutoSaveCompleted);
      worldSaveManager.off('navigationStarted', handleNavigationStarted);
      worldSaveManager.off('navigationCompleted', handleNavigationCompleted);
      worldSaveManager.off('navigationError', handleNavigationError);
    };
  }, []);

  // Save world function
  const saveWorld = useCallback(async (options = {}) => {
    try {
      setError(null);
      const savedWorld = await worldSaveManager.saveWorld(options);
      return savedWorld;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Load world function
  const loadWorld = useCallback(async (worldId) => {
    try {
      setIsLoading(true);
      setError(null);
      const worldData = await worldSaveManager.loadWorld(worldId);
      return worldData;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new world function
  const createNewWorld = useCallback(async (worldData) => {
    try {
      setError(null);
      const newWorld = await worldSaveManager.createNewWorld(worldData);
      return newWorld;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Delete world function
  const deleteWorld = useCallback(async (worldId) => {
    try {
      setError(null);
      await worldSaveManager.deleteWorld(worldId);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Auto-save controls
  const enableAutoSave = useCallback((delay) => {
    worldSaveManager.enableAutoSave(delay);
    setSaveStatus(worldSaveManager.getSaveStatus());
  }, []);

  const disableAutoSave = useCallback(() => {
    worldSaveManager.disableAutoSave();
    setSaveStatus(worldSaveManager.getSaveStatus());
  }, []);

  // Manual save trigger
  const triggerSave = useCallback(async () => {
    if (saveStatus.canSave && !saveStatus.saveInProgress) {
      return await saveWorld();
    }
  }, [saveWorld, saveStatus]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Navigation functions
  const navigateToEditor = useCallback(async (editorType, options = {}) => {
    try {
      setError(null);
      return await worldSaveManager.navigateToEditor(editorType, options);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);



  const saveCurrentWork = useCallback(async () => {
    try {
      setError(null);
      return await worldSaveManager.saveCurrentWork();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const navigateWithContext = useCallback((path, options = {}) => {
    worldSaveManager.navigateWithContext(path, options);
  }, []);

  // World context management functions
  const addNode = useCallback(async (nodeData) => {
    if (!currentWorld?.id) {
      throw new Error('No current world selected');
    }

    try {
      setError(null);
      const savedNode = await worldPersistenceService.saveNode(currentWorld.id, nodeData);
      
      // Update local state
      setWorldNodes(prev => [...prev, savedNode]);
      
      // Update current world
      setCurrentWorld(prev => ({
        ...prev,
        nodes: [...(prev.nodes || []), savedNode]
      }));

      return savedNode;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [currentWorld?.id]);

  const addCharacter = useCallback(async (characterData) => {
    if (!currentWorld?.id) {
      throw new Error('No current world selected');
    }

    try {
      setError(null);
      // Note: We'll need to add saveCharacter method to WorldPersistenceService
      // For now, we'll use the existing pattern
      const savedCharacter = { 
        ...characterData, 
        id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        worldId: currentWorld.id,
        lastModified: new Date().toISOString()
      };
      
      // Update local state
      setWorldCharacters(prev => [...prev, savedCharacter]);
      
      // Update current world
      setCurrentWorld(prev => ({
        ...prev,
        characters: [...(prev.characters || []), savedCharacter]
      }));

      // Update editor state
      editorStateManager.updateEditorData('characters', savedCharacter.id, savedCharacter);

      return savedCharacter;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [currentWorld?.id]);

  const addInteraction = useCallback(async (interactionData) => {
    if (!currentWorld?.id) {
      throw new Error('No current world selected');
    }

    try {
      setError(null);
      const savedInteraction = { 
        ...interactionData, 
        id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        worldId: currentWorld.id,
        lastModified: new Date().toISOString()
      };
      
      // Update local state
      setWorldInteractions(prev => [...prev, savedInteraction]);
      
      // Update current world
      setCurrentWorld(prev => ({
        ...prev,
        interactions: [...(prev.interactions || []), savedInteraction]
      }));

      // Update editor state
      editorStateManager.updateEditorData('interactions', savedInteraction.id, savedInteraction);

      return savedInteraction;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [currentWorld?.id]);

  const updateNode = useCallback(async (nodeId, nodeData) => {
    if (!currentWorld?.id) {
      throw new Error('No current world selected');
    }

    try {
      setError(null);
      const updatedNode = await worldPersistenceService.saveNode(currentWorld.id, { 
        ...nodeData, 
        id: nodeId 
      });
      
      // Update local state
      setWorldNodes(prev => prev.map(node => 
        node.id === nodeId ? updatedNode : node
      ));
      
      // Update current world
      setCurrentWorld(prev => ({
        ...prev,
        nodes: prev.nodes?.map(node => 
          node.id === nodeId ? updatedNode : node
        ) || [updatedNode]
      }));

      return updatedNode;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [currentWorld?.id]);

  const updateCharacter = useCallback(async (characterId, characterData) => {
    if (!currentWorld?.id) {
      throw new Error('No current world selected');
    }

    try {
      setError(null);
      const updatedCharacter = { 
        ...characterData, 
        id: characterId,
        worldId: currentWorld.id,
        lastModified: new Date().toISOString()
      };
      
      // Update local state
      setWorldCharacters(prev => prev.map(char => 
        char.id === characterId ? updatedCharacter : char
      ));
      
      // Update current world
      setCurrentWorld(prev => ({
        ...prev,
        characters: prev.characters?.map(char => 
          char.id === characterId ? updatedCharacter : char
        ) || [updatedCharacter]
      }));

      // Update editor state
      editorStateManager.updateEditorData('characters', characterId, updatedCharacter);

      return updatedCharacter;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [currentWorld?.id]);

  const deleteNode = useCallback(async (nodeId) => {
    if (!currentWorld?.id) {
      throw new Error('No current world selected');
    }

    try {
      setError(null);
      await worldPersistenceService.deleteNode(currentWorld.id, nodeId);
      
      // Update local state
      setWorldNodes(prev => prev.filter(node => node.id !== nodeId));
      
      // Update current world
      setCurrentWorld(prev => ({
        ...prev,
        nodes: prev.nodes?.filter(node => node.id !== nodeId) || []
      }));

    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [currentWorld?.id]);

  const deleteCharacter = useCallback(async (characterId) => {
    if (!currentWorld?.id) {
      throw new Error('No current world selected');
    }

    try {
      setError(null);
      
      // Update local state
      setWorldCharacters(prev => prev.filter(char => char.id !== characterId));
      
      // Update current world
      setCurrentWorld(prev => ({
        ...prev,
        characters: prev.characters?.filter(char => char.id !== characterId) || []
      }));

      // Update editor state
      const charactersData = editorStateManager.getEditorData('characters');
      delete charactersData[characterId];
      editorStateManager.updateEditorData('characters', characterId, null);

    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [currentWorld?.id]);

  const refreshWorldContext = useCallback(async () => {
    if (!currentWorld?.id) return;

    setWorldLoading(true);
    try {
      const world = await worldPersistenceService.loadWorld(currentWorld.id);
      setCurrentWorld(world);
      setWorldNodes(world.nodes || []);
      setWorldCharacters(world.characters || []);
      setWorldInteractions(world.interactions || []);
      setWorldEncounters(world.encounters || []);
    } catch (error) {
      setError(error.message);
    }
    setWorldLoading(false);
  }, [currentWorld?.id]);

  return {
    // Status
    saveStatus,
    isLoading,
    error,
    lastSaveTime,
    
    // Actions
    saveWorld,
    loadWorld,
    createNewWorld,
    deleteWorld,
    triggerSave,
    
    // Navigation
    navigateToEditor,
    saveCurrentWork,
    navigateWithContext,
    
    // Auto-save controls
    enableAutoSave,
    disableAutoSave,
    
    // Utilities
    clearError,
    refreshWorldContext,
    
    // World Context
    currentWorld,
    worldLoading,
    worldNodes,
    worldCharacters,
    worldInteractions,
    worldEncounters,
    
    // World Context Actions
    addNode,
    addCharacter,
    addInteraction,
    updateNode,
    updateCharacter,
    deleteNode,
    deleteCharacter,
    
    // Computed values
    canSave: saveStatus.canSave,
    hasUnsavedChanges: saveStatus.hasUnsavedChanges,
    isSaving: saveStatus.saveInProgress || isLoading || worldLoading,
    autoSaveEnabled: saveStatus.autoSaveEnabled,
    hasWorld: !!currentWorld
  };
};