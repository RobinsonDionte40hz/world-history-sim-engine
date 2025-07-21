/**
 * useUnsavedChanges Hook - Track and manage unsaved changes
 * 
 * Provides functionality to track unsaved changes across editors,
 * with automatic save detection and user warnings.
 * 
 * Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import editorStateManager from '../../application/services/EditorStateManager';

const useUnsavedChanges = (options = {}) => {
  const {
    autoSaveInterval = 30000, // 30 seconds
    enableAutoSave = false,
    onUnsavedChanges = null,
    onSaved = null,
    onAutoSave = null
  } = options;

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(enableAutoSave);
  
  const autoSaveTimerRef = useRef(null);
  const lastChangeTimeRef = useRef(null);

  // Subscribe to editor state changes
  useEffect(() => {
    const unsubscribeUnsavedChanges = editorStateManager.subscribe('unsavedChangesChanged', (hasChanges) => {
      setHasUnsavedChanges(hasChanges);
      
      if (hasChanges) {
        lastChangeTimeRef.current = Date.now();
        if (onUnsavedChanges) {
          onUnsavedChanges();
        }
      }
    });

    const unsubscribeSaveStatus = editorStateManager.subscribe('saveStatusChanged', (data) => {
      setSaveStatus(data.status);
      
      if (data.status === 'saved') {
        setLastSaved(data.timestamp);
        if (onSaved) {
          onSaved(data);
        }
      }
    });

    // Initialize state from editor state manager
    const currentState = editorStateManager.getState();
    setHasUnsavedChanges(currentState.hasUnsavedChanges);
    setSaveStatus(currentState.saveStatus);

    return () => {
      unsubscribeUnsavedChanges();
      unsubscribeSaveStatus();
    };
  }, [onUnsavedChanges, onSaved]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      return;
    }

    // Set up auto-save timer
    autoSaveTimerRef.current = setTimeout(() => {
      if (hasUnsavedChanges && lastChangeTimeRef.current) {
        const timeSinceLastChange = Date.now() - lastChangeTimeRef.current;
        
        // Only auto-save if there haven't been changes for at least 5 seconds
        if (timeSinceLastChange >= 5000) {
          performAutoSave();
        } else {
          // Reset timer for remaining time
          autoSaveTimerRef.current = setTimeout(() => {
            if (hasUnsavedChanges) {
              performAutoSave();
            }
          }, 5000 - timeSinceLastChange);
        }
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveEnabled, hasUnsavedChanges, autoSaveInterval]);

  /**
   * Perform auto-save operation
   */
  const performAutoSave = useCallback(async () => {
    try {
      setSaveStatus('saving');
      
      // Trigger auto-save event for current editor to handle
      window.dispatchEvent(new CustomEvent('autoSave', {
        detail: { source: 'useUnsavedChanges' }
      }));
      
      if (onAutoSave) {
        onAutoSave();
      }
      
      // Note: The actual save status will be updated by the editor
      // through the EditorStateManager when save completes
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
    }
  }, [onAutoSave]);

  /**
   * Mark changes as saved
   */
  const markAsSaved = useCallback(() => {
    editorStateManager.setUnsavedChanges(false);
    editorStateManager.setSaveStatus('saved');
  }, []);

  /**
   * Mark that changes have been made
   */
  const markAsChanged = useCallback(() => {
    editorStateManager.setUnsavedChanges(true);
    editorStateManager.setSaveStatus('idle');
  }, []);

  /**
   * Clear unsaved changes without saving
   */
  const clearUnsavedChanges = useCallback(() => {
    editorStateManager.setUnsavedChanges(false);
    editorStateManager.setSaveStatus('idle');
  }, []);

  /**
   * Manually trigger save
   */
  const triggerSave = useCallback(() => {
    window.dispatchEvent(new CustomEvent('quickSave', {
      detail: { source: 'useUnsavedChanges' }
    }));
  }, []);

  /**
   * Enable or disable auto-save
   */
  const toggleAutoSave = useCallback((enabled) => {
    setAutoSaveEnabled(enabled);
  }, []);

  /**
   * Get time since last change
   */
  const getTimeSinceLastChange = useCallback(() => {
    if (!lastChangeTimeRef.current) return null;
    return Date.now() - lastChangeTimeRef.current;
  }, []);

  /**
   * Get formatted time since last save
   */
  const getFormattedLastSaved = useCallback(() => {
    if (!lastSaved) return 'Never';
    
    const now = new Date();
    const saved = new Date(lastSaved);
    const diffMs = now - saved;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }, [lastSaved]);

  /**
   * Check if navigation should be blocked
   */
  const shouldBlockNavigation = useCallback(() => {
    return hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  /**
   * Get save status information
   */
  const getSaveStatusInfo = useCallback(() => {
    return {
      status: saveStatus,
      hasUnsavedChanges,
      lastSaved,
      formattedLastSaved: getFormattedLastSaved(),
      timeSinceLastChange: getTimeSinceLastChange(),
      autoSaveEnabled,
      shouldBlockNavigation: shouldBlockNavigation()
    };
  }, [saveStatus, hasUnsavedChanges, lastSaved, getFormattedLastSaved, getTimeSinceLastChange, autoSaveEnabled, shouldBlockNavigation]);

  /**
   * Get warning message for unsaved changes
   */
  const getUnsavedChangesWarning = useCallback(() => {
    if (!hasUnsavedChanges) return null;
    
    const timeSinceChange = getTimeSinceLastChange();
    if (timeSinceChange && timeSinceChange > 300000) { // 5 minutes
      return 'You have unsaved changes from over 5 minutes ago. Consider saving your work.';
    }
    
    return 'You have unsaved changes that will be lost if you navigate away.';
  }, [hasUnsavedChanges, getTimeSinceLastChange]);

  return {
    // State
    hasUnsavedChanges,
    saveStatus,
    lastSaved,
    autoSaveEnabled,
    
    // Actions
    markAsSaved,
    markAsChanged,
    clearUnsavedChanges,
    triggerSave,
    toggleAutoSave,
    
    // Getters
    getSaveStatusInfo,
    getUnsavedChangesWarning,
    getFormattedLastSaved,
    getTimeSinceLastChange,
    shouldBlockNavigation,
    
    // Utilities
    performAutoSave
  };
};

export default useUnsavedChanges;