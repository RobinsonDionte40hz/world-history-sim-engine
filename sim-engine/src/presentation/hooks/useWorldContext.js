/**
 * useWorldContext - Unified world context hook
 * 
 * Provides complete world context that persists across all navigation.
 * This hook ensures that world data is always available and synchronized
 * across all editors and components.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import editorStateManager from '../../application/services/EditorStateManager';
import worldPersistenceService from '../../application/services/WorldPersistenceService';

export const useWorldContext = () => {
  const [currentWorld, setCurrentWorld] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Individual world components for easy access
  const [worldNodes, setWorldNodes] = useState([]);
  const [worldCharacters, setWorldCharacters] = useState([]);
  const [worldInteractions, setWorldInteractions] = useState([]);
  const [worldEncounters, setWorldEncounters] = useState([]);

  // Use ref to store async unsubscribe function
  const unsubscribeSaveManagerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Manual refresh function
  const refreshWorldContext = useCallback(async (forceWorldId = null) => {
    const editorState = editorStateManager.getState();
    const worldId = forceWorldId || editorState.currentWorld?.id;
    
    if (worldId) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Force reload from persistence
        const world = await worldPersistenceService.loadWorld(worldId);
        setCurrentWorld(world);
        setWorldNodes(world.nodes || []);
        setWorldCharacters(world.characters || []);
        setWorldInteractions(world.interactions || []);
        setWorldEncounters(world.encounters || []);
      } catch (loadError) {
        console.error('Failed to refresh world context:', loadError);
        setError(loadError.message);
      }
      
      setIsLoading(false);
    } else if (!worldId && currentWorld) {
      // Clear world context if no world is selected
      setCurrentWorld(null);
      setWorldNodes([]);
      setWorldCharacters([]);
      setWorldInteractions([]);
      setWorldEncounters([]);
    }
  }, [currentWorld]);

  // Listen for world changes AND save completion
  useEffect(() => {
    const unsubscribeWorldChanged = editorStateManager.subscribe('worldChanged', refreshWorldContext);
    const unsubscribeEditorDataChanged = editorStateManager.subscribe('editorDataChanged', (event) => {
      // Refresh context when world-level data changes
      if (event.editorType === 'world') {
        refreshWorldContext();
      }
    });
    const unsubscribeSaveStatusChanged = editorStateManager.subscribe('saveStatusChanged', (event) => {
      // Refresh context when save is completed
      if (event.status === 'saved') {
        refreshWorldContext();
      }
    });
    
    // Also listen to WorldSaveManager events
    try {
      // Import WorldSaveManager dynamically to avoid circular dependencies
      import('../../application/services/WorldSaveManager')
        .then(({ default: worldSaveManager }) => {
          // Only set up listener if component is still mounted
          if (isMountedRef.current && worldSaveManager && typeof worldSaveManager.on === 'function') {
            const unsubscribe = worldSaveManager.on('saveCompleted', refreshWorldContext);
            // Only set if it's actually a function and component is still mounted
            if (typeof unsubscribe === 'function' && isMountedRef.current) {
              unsubscribeSaveManagerRef.current = unsubscribe;
            }
          }
        })
        .catch(importError => {
          console.warn('Could not import WorldSaveManager for event listening:', importError);
        });
    } catch (importError) {
      console.warn('Could not setup WorldSaveManager event listening:', importError);
    }
    
    // Initial load
    refreshWorldContext();
    
    return () => {
      // Mark as unmounted to prevent async operations
      isMountedRef.current = false;
      
      if (unsubscribeWorldChanged) unsubscribeWorldChanged();
      if (unsubscribeEditorDataChanged) unsubscribeEditorDataChanged();
      if (unsubscribeSaveStatusChanged) unsubscribeSaveStatusChanged();
      if (unsubscribeSaveManagerRef.current && typeof unsubscribeSaveManagerRef.current === 'function') {
        unsubscribeSaveManagerRef.current();
        unsubscribeSaveManagerRef.current = null; // Clear the ref
      }
    };
  }, [refreshWorldContext]); // Remove currentWorld dependency to prevent loops

  // Node management functions
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

      // Update editor state
      editorStateManager.updateEditorData('nodes', savedNode.id, savedNode);

      return savedNode;
    } catch (nodeError) {
      setError(nodeError.message);
      throw nodeError;
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

      // Update editor state
      editorStateManager.updateEditorData('nodes', nodeId, updatedNode);

      return updatedNode;
    } catch (nodeError) {
      setError(nodeError.message);
      throw nodeError;
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

      // Update editor state
      const nodesData = editorStateManager.getEditorData('nodes');
      delete nodesData[nodeId];

    } catch (nodeError) {
      setError(nodeError.message);
      throw nodeError;
    }
  }, [currentWorld?.id]);

  // Character management functions
  const addCharacter = useCallback(async (characterData) => {
    if (!currentWorld?.id) {
      throw new Error('No current world selected');
    }

    try {
      setError(null);
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
    } catch (characterError) {
      setError(characterError.message);
      throw characterError;
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
    } catch (characterError) {
      setError(characterError.message);
      throw characterError;
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

    } catch (characterError) {
      setError(characterError.message);
      throw characterError;
    }
  }, [currentWorld?.id]);

  // Interaction management functions
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
    } catch (interactionError) {
      setError(interactionError.message);
      throw interactionError;
    }
  }, [currentWorld?.id]);

  const updateInteraction = useCallback(async (interactionId, interactionData) => {
    if (!currentWorld?.id) {
      throw new Error('No current world selected');
    }

    try {
      setError(null);
      const updatedInteraction = { 
        ...interactionData, 
        id: interactionId,
        worldId: currentWorld.id,
        lastModified: new Date().toISOString()
      };
      
      // Update local state
      setWorldInteractions(prev => prev.map(interaction => 
        interaction.id === interactionId ? updatedInteraction : interaction
      ));
      
      // Update current world
      setCurrentWorld(prev => ({
        ...prev,
        interactions: prev.interactions?.map(interaction => 
          interaction.id === interactionId ? updatedInteraction : interaction
        ) || [updatedInteraction]
      }));

      // Update editor state
      editorStateManager.updateEditorData('interactions', interactionId, updatedInteraction);

      return updatedInteraction;
    } catch (interactionError) {
      setError(interactionError.message);
      throw interactionError;
    }
  }, [currentWorld?.id]);

  const deleteInteraction = useCallback(async (interactionId) => {
    if (!currentWorld?.id) {
      throw new Error('No current world selected');
    }

    try {
      setError(null);
      
      // Update local state
      setWorldInteractions(prev => prev.filter(interaction => interaction.id !== interactionId));
      
      // Update current world
      setCurrentWorld(prev => ({
        ...prev,
        interactions: prev.interactions?.filter(interaction => interaction.id !== interactionId) || []
      }));

      // Update editor state
      const interactionsData = editorStateManager.getEditorData('interactions');
      delete interactionsData[interactionId];

    } catch (interactionError) {
      setError(interactionError.message);
      throw interactionError;
    }
  }, [currentWorld?.id]);

  // Sync with editor state without reloading from persistence (more efficient)
  const syncWithEditorState = useCallback(() => {
    const editorState = editorStateManager.getState();
    const worldData = editorState.editorData.world;
    const nodesData = editorState.editorData.nodes || {};
    const charactersData = editorState.editorData.characters || {};
    const interactionsData = editorState.editorData.interactions || {};
    const encountersData = editorState.editorData.encounters || {};
    
    if (worldData) {
      setCurrentWorld(worldData);
      setWorldNodes(Object.values(nodesData));
      setWorldCharacters(Object.values(charactersData));
      setWorldInteractions(Object.values(interactionsData));
      setWorldEncounters(Object.values(encountersData));
    }
  }, []);

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get specific world component by ID
  const getNodeById = useCallback((nodeId) => {
    return worldNodes.find(node => node.id === nodeId);
  }, [worldNodes]);

  const getCharacterById = useCallback((characterId) => {
    return worldCharacters.find(character => character.id === characterId);
  }, [worldCharacters]);

  const getInteractionById = useCallback((interactionId) => {
    return worldInteractions.find(interaction => interaction.id === interactionId);
  }, [worldInteractions]);

  // Get characters by node
  const getCharactersByNode = useCallback((nodeId) => {
    const nodePopulations = currentWorld?.nodePopulations || {};
    const characterIds = nodePopulations[nodeId] || [];
    return worldCharacters.filter(character => characterIds.includes(character.id));
  }, [worldCharacters, currentWorld?.nodePopulations]);

  return {
    // World state
    currentWorld,
    isLoading,
    error,
    
    // World components
    worldNodes,
    worldCharacters,
    worldInteractions,
    worldEncounters,
    
    // Node management
    addNode,
    updateNode,
    deleteNode,
    getNodeById,
    
    // Character management
    addCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacterById,
    getCharactersByNode,
    
    // Interaction management
    addInteraction,
    updateInteraction,
    deleteInteraction,
    getInteractionById,
    
    // Utilities
    refreshWorldContext, // Export for manual refresh
    syncWithEditorState, // Export for efficient sync with editor state
    clearError,
    
    // Computed values
    hasWorld: !!currentWorld,
    worldId: currentWorld?.id,
    worldName: currentWorld?.name,
    nodeCount: worldNodes.length,
    characterCount: worldCharacters.length,
    interactionCount: worldInteractions.length
  };
};