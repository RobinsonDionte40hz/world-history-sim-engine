/**
 * useAutoSave Hook - Provides automatic saving with debouncing
 * 
 * Automatically saves data after a specified delay when data changes.
 * Includes debouncing to prevent excessive save operations.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for auto-saving data with debouncing
 * @param {*} data - Data to auto-save
 * @param {Function} saveFunction - Function to call for saving
 * @param {number} delay - Delay in milliseconds before auto-saving (default: 30000ms = 30s)
 * @param {boolean} enabled - Whether auto-save is enabled (default: true)
 * @returns {Object} Auto-save state and controls
 */
const useAutoSave = (data, saveFunction, delay = 30000, enabled = true) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const saveTimeoutRef = useRef(null);
  const lastDataRef = useRef(null);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (!data || !saveFunction || isSaving) {
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveFunction(data);
      setLastSaved(new Date());
      lastDataRef.current = JSON.stringify(data);
      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveError(error.message || 'Save failed');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data, saveFunction, isSaving]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled || !data || !saveFunction) {
      return;
    }

    // Check if data has actually changed
    const currentDataString = JSON.stringify(data);
    if (lastDataRef.current === currentDataString) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      await saveNow();
    }, delay);

    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, saveFunction, delay, enabled, saveNow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Force save before page unload
  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      if (enabled && data && saveFunction && !isSaving) {
        const currentDataString = JSON.stringify(data);
        if (lastDataRef.current !== currentDataString) {
          // Show warning to user
          event.preventDefault();
          event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
          
          // Try to save quickly (though this may not complete due to page unload)
          try {
            await saveFunction(data);
          } catch (error) {
            console.error('Failed to save before page unload:', error);
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data, saveFunction, enabled, isSaving]);

  // Calculate time since last save
  const timeSinceLastSave = lastSaved ? Date.now() - lastSaved.getTime() : null;

  // Check if data has unsaved changes
  const hasUnsavedChanges = data && lastDataRef.current !== JSON.stringify(data);

  return {
    // State
    isSaving,
    lastSaved,
    saveError,
    hasUnsavedChanges,
    timeSinceLastSave,

    // Actions
    saveNow,
    
    // Status
    isEnabled: enabled,
    nextSaveIn: saveTimeoutRef.current ? delay : null
  };
};

export default useAutoSave;