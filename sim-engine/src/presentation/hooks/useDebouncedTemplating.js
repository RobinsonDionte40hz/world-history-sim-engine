import { useRef, useCallback, useEffect } from 'react';

/**
 * useDebouncedTemplating - Specialized debouncing for text templating operations
 * 
 * Features:
 * - Debounced preview updates for real-time editing
 * - Smart debouncing that considers operation type and priority
 * - Cleanup logic for unused template instances
 * - Batch processing for multiple simultaneous updates
 * - Memory-efficient timeout management
 */
const useDebouncedTemplating = (options = {}) => {
  const {
    previewDebounceMs = 300,
    suggestionDebounceMs = 150,
    validationDebounceMs = 100,
    batchSize = 10,
    maxPendingOperations = 50
  } = options;

  // Timeout management
  const timeoutsRef = useRef(new Map());
  const pendingOperationsRef = useRef(new Map());
  const batchQueueRef = useRef([]);
  const batchTimeoutRef = useRef(null);

  /**
   * Clear a specific timeout by key
   */
  const clearTimeoutByKey = useCallback((key) => {
    const timeouts = timeoutsRef.current;
    if (timeouts.has(key)) {
      clearTimeout(timeouts.get(key));
      timeouts.delete(key);
      return true;
    }
    return false;
  }, []);

  /**
   * Clear all timeouts
   */
  const clearAllTimeouts = useCallback(() => {
    const timeouts = timeoutsRef.current;
    timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    timeouts.clear();
    
    const pending = pendingOperationsRef.current;
    pending.clear();
    
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
    
    batchQueueRef.current = [];
  }, []);

  /**
   * Create a debounced function with smart delay selection
   */
  const createDebouncedFunction = useCallback((key, fn, operationType = 'default') => {
    // Select appropriate delay based on operation type
    let delay;
    switch (operationType) {
      case 'preview':
        delay = previewDebounceMs;
        break;
      case 'suggestion':
        delay = suggestionDebounceMs;
        break;
      case 'validation':
        delay = validationDebounceMs;
        break;
      default:
        delay = previewDebounceMs;
    }

    return (...args) => {
      // Clear existing timeout for this key
      clearTimeoutByKey(key);
      
      // Check if we have too many pending operations
      const pending = pendingOperationsRef.current;
      if (pending.size >= maxPendingOperations) {
        // Execute immediately to prevent memory buildup
        fn(...args);
        return;
      }

      // Store the pending operation
      pending.set(key, { fn, args, type: operationType, timestamp: Date.now() });

      // Set new timeout
      const timeoutId = setTimeout(() => {
        try {
          fn(...args);
        } catch (error) {
          console.warn(`Debounced operation failed for key ${key}:`, error);
        } finally {
          // Cleanup
          timeoutsRef.current.delete(key);
          pending.delete(key);
        }
      }, delay);

      timeoutsRef.current.set(key, timeoutId);
    };
  }, [previewDebounceMs, suggestionDebounceMs, validationDebounceMs, maxPendingOperations, clearTimeoutByKey]);

  /**
   * Debounced preview update with smart batching
   */
  const debouncedPreviewUpdate = useCallback((templateText, context, updateFn) => {
    const key = `preview_${templateText.substring(0, 50)}`; // Use text prefix as key
    const debouncedFn = createDebouncedFunction(key, updateFn, 'preview');
    return debouncedFn(templateText, context);
  }, [createDebouncedFunction]);

  /**
   * Debounced suggestion update
   */
  const debouncedSuggestionUpdate = useCallback((context, updateFn) => {
    const contextKey = JSON.stringify(context, Object.keys(context || {}).sort());
    const key = `suggestion_${contextKey.substring(0, 50)}`;
    const debouncedFn = createDebouncedFunction(key, updateFn, 'suggestion');
    return debouncedFn(context);
  }, [createDebouncedFunction]);

  /**
   * Debounced validation
   */
  const debouncedValidation = useCallback((templateText, validateFn) => {
    const key = `validation_${templateText.length}_${templateText.substring(0, 20)}`;
    const debouncedFn = createDebouncedFunction(key, validateFn, 'validation');
    return debouncedFn(templateText);
  }, [createDebouncedFunction]);

  /**
   * Batch multiple operations together
   */
  const addToBatch = useCallback((operation) => {
    batchQueueRef.current.push(operation);
    
    // If batch is full, process immediately
    if (batchQueueRef.current.length >= batchSize) {
      processBatch();
      return;
    }

    // Otherwise, set a timeout to process the batch
    if (!batchTimeoutRef.current) {
      batchTimeoutRef.current = setTimeout(processBatch, Math.min(previewDebounceMs, 100));
    }
  }, [batchSize, previewDebounceMs]);

  /**
   * Process the current batch of operations
   */
  const processBatch = useCallback(() => {
    const batch = batchQueueRef.current;
    batchQueueRef.current = [];
    
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }

    if (batch.length === 0) return;

    // Group operations by type for better performance
    const groupedOps = batch.reduce((groups, op) => {
      const type = op.type || 'default';
      if (!groups[type]) groups[type] = [];
      groups[type].push(op);
      return groups;
    }, {});

    // Execute operations by priority (validation first, then suggestions, then preview)
    const executionOrder = ['validation', 'suggestion', 'preview', 'default'];
    
    executionOrder.forEach(type => {
      if (groupedOps[type]) {
        groupedOps[type].forEach(op => {
          try {
            op.fn(...(op.args || []));
          } catch (error) {
            console.warn(`Batch operation failed:`, error);
          }
        });
      }
    });
  }, []);

  /**
   * Smart debouncing that adapts delay based on system load
   */
  const adaptiveDebounce = useCallback((key, fn, baseDelay, operationType = 'default') => {
    const pending = pendingOperationsRef.current;
    const currentLoad = pending.size;
    
    // Increase delay if system is under load
    let adaptedDelay = baseDelay;
    if (currentLoad > 20) {
      adaptedDelay = baseDelay * 1.5;
    } else if (currentLoad > 10) {
      adaptedDelay = baseDelay * 1.2;
    }

    return createDebouncedFunction(key, fn, operationType);
  }, [createDebouncedFunction]);

  /**
   * Cancel all pending operations of a specific type
   */
  const cancelOperationType = useCallback((operationType) => {
    const pending = pendingOperationsRef.current;
    const timeouts = timeoutsRef.current;
    
    const keysToRemove = [];
    
    pending.forEach((operation, key) => {
      if (operation.type === operationType) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key));
        timeouts.delete(key);
      }
      pending.delete(key);
    });

    return keysToRemove.length;
  }, []);

  /**
   * Get statistics about pending operations
   */
  const getOperationStats = useCallback(() => {
    const pending = pendingOperationsRef.current;
    const stats = {
      total: pending.size,
      byType: {},
      oldestTimestamp: null,
      newestTimestamp: null
    };

    pending.forEach(operation => {
      const type = operation.type || 'default';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      if (!stats.oldestTimestamp || operation.timestamp < stats.oldestTimestamp) {
        stats.oldestTimestamp = operation.timestamp;
      }
      
      if (!stats.newestTimestamp || operation.timestamp > stats.newestTimestamp) {
        stats.newestTimestamp = operation.timestamp;
      }
    });

    return stats;
  }, []);

  /**
   * Force execution of all pending operations
   */
  const flushAll = useCallback(() => {
    const pending = pendingOperationsRef.current;
    const timeouts = timeoutsRef.current;
    
    // Execute all pending operations immediately
    pending.forEach((operation, key) => {
      try {
        operation.fn(...operation.args);
      } catch (error) {
        console.warn(`Flush operation failed for key ${key}:`, error);
      }
    });

    // Clear all timeouts and pending operations
    clearAllTimeouts();
    
    // Process any remaining batch
    if (batchQueueRef.current.length > 0) {
      processBatch();
    }
  }, [clearAllTimeouts, processBatch]);

  /**
   * Cleanup old pending operations (older than 30 seconds)
   */
  const cleanupOldOperations = useCallback(() => {
    const now = Date.now();
    const maxAge = 30000; // 30 seconds
    const pending = pendingOperationsRef.current;
    const timeouts = timeoutsRef.current;
    
    const keysToRemove = [];
    
    pending.forEach((operation, key) => {
      if (now - operation.timestamp > maxAge) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key));
        timeouts.delete(key);
      }
      pending.delete(key);
    });

    return keysToRemove.length;
  }, []);

  // Periodic cleanup of old operations
  useEffect(() => {
    const cleanupInterval = setInterval(cleanupOldOperations, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, [cleanupOldOperations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return {
    // Core debouncing functions
    debouncedPreviewUpdate,
    debouncedSuggestionUpdate,
    debouncedValidation,
    
    // Advanced debouncing
    createDebouncedFunction,
    adaptiveDebounce,
    
    // Batch processing
    addToBatch,
    processBatch,
    
    // Management
    cancelOperationType,
    flushAll,
    clearAllTimeouts,
    cleanupOldOperations,
    
    // Statistics
    getOperationStats,
    
    // Utility
    clearTimeoutByKey
  };
};

export default useDebouncedTemplating;