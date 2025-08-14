// src/presentation/hooks/useAssignmentManager.js

import { useState, useEffect, useCallback } from 'react';
import assignmentManager from '../../domain/services/AssignmentManager';

/**
 * Hook for using AssignmentManager in React components
 */
export const useAssignmentManager = () => {
  const [statistics, setStatistics] = useState(assignmentManager.getStatistics());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update statistics when assignments change
  useEffect(() => {
    const updateStats = () => {
      setStatistics(assignmentManager.getStatistics());
    };

    // Listen to assignment events
    assignmentManager.on('characterAssignedToNode', updateStats);
    assignmentManager.on('characterUnassignedFromNode', updateStats);
    assignmentManager.on('characterAssignedToInteraction', updateStats);
    assignmentManager.on('characterUnassignedFromInteraction', updateStats);
    assignmentManager.on('assignmentsLoaded', updateStats);
    assignmentManager.on('assignmentsCleared', updateStats);

    // Handle errors
    const handleError = (error) => {
      setError(error.message || 'Assignment operation failed');
      setIsLoading(false);
    };
    assignmentManager.on('assignmentError', handleError);

    return () => {
      assignmentManager.removeListener('characterAssignedToNode', updateStats);
      assignmentManager.removeListener('characterUnassignedFromNode', updateStats);
      assignmentManager.removeListener('characterAssignedToInteraction', updateStats);
      assignmentManager.removeListener('characterUnassignedFromInteraction', updateStats);
      assignmentManager.removeListener('assignmentsLoaded', updateStats);
      assignmentManager.removeListener('assignmentsCleared', updateStats);
      assignmentManager.removeListener('assignmentError', handleError);
    };
  }, []);

  // Wrapped assignment methods
  const assignCharacterToNode = useCallback(async (characterId, nodeId) => {
    setIsLoading(true);
    setError(null);
    
    const success = assignmentManager.assignCharacterToNode(characterId, nodeId);
    
    setIsLoading(false);
    return success;
  }, []);

  const assignCharacterToInteraction = useCallback(async (characterId, interactionId) => {
    setIsLoading(true);
    setError(null);
    
    const success = assignmentManager.assignCharacterToInteraction(characterId, interactionId);
    
    setIsLoading(false);
    return success;
  }, []);

  const getCharacterAssignments = useCallback((characterId) => {
    return assignmentManager.getCharacterAssignments(characterId);
  }, []);

  const validateAssignments = useCallback(() => {
    return assignmentManager.validateAssignments();
  }, []);

  return {
    // State
    statistics,
    isLoading,
    error,
    
    // Assignment methods
    assignCharacterToNode,
    assignCharacterToInteraction,
    unassignCharacterFromNode: assignmentManager.unassignCharacterFromNode.bind(assignmentManager),
    unassignCharacterFromInteraction: assignmentManager.unassignCharacterFromInteraction.bind(assignmentManager),
    
    // Query methods
    getCharactersByNode: assignmentManager.getCharactersByNode.bind(assignmentManager),
    getNodeByCharacter: assignmentManager.getNodeByCharacter.bind(assignmentManager),
    getInteractionsByCharacter: assignmentManager.getInteractionsByCharacter.bind(assignmentManager),
    getCharactersByInteraction: assignmentManager.getCharactersByInteraction.bind(assignmentManager),
    getCharacterAssignments,
    
    // Cleanup methods
    cleanupDeletedCharacter: assignmentManager.cleanupDeletedCharacter.bind(assignmentManager),
    cleanupDeletedNode: assignmentManager.cleanupDeletedNode.bind(assignmentManager),
    cleanupDeletedInteraction: assignmentManager.cleanupDeletedInteraction.bind(assignmentManager),
    
    // Utility methods
    validateAssignments,
    repairAssignments: assignmentManager.repairAssignments.bind(assignmentManager),
    exportAssignments: assignmentManager.exportAssignments.bind(assignmentManager),
    importAssignments: assignmentManager.importAssignments.bind(assignmentManager),
    
    // Clear error
    clearError: useCallback(() => setError(null), [])
  };
};