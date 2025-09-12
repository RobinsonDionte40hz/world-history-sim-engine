/**
 * UnifiedPersistenceService - Infrastructure service for unified persistence operations
 * Integrates Redux-Persist with ownership validation and save flow management
 */

import { persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import SaveFlowService from './SaveFlowService.js';
import OwnershipValidationService from '../../domain/services/OwnershipValidationService.js';
import ConflictDetectionService from '../../domain/services/ConflictDetectionService.js';
import ConflictResolutionService from '../../domain/services/ConflictResolutionService.js';
import SaveFlowConsistencyValidator from '../../domain/services/SaveFlowConsistencyValidator.js';

export default class UnifiedPersistenceService {
  constructor(reduxStore, config = {}) {
    this.store = reduxStore.store || reduxStore; // Handle both store object and {store, persistor} object
    this.saveFlowService = new SaveFlowService();
    this.ownershipService = new OwnershipValidationService();
    this.conflictDetectionService = new ConflictDetectionService(this.ownershipService);
    this.conflictResolutionService = new ConflictResolutionService(
      this.conflictDetectionService,
      this.ownershipService
    );
    this.consistencyValidator = new SaveFlowConsistencyValidator({
      performanceVarianceThreshold: 0.15 // 15% for test environment
    });

    this.config = {
      key: 'world-history-sim-engine',
      storage,
      whitelist: ['worlds', 'characters', 'interactions', 'simulation'],
      ...config
    };

    // Use existing persistor if provided, otherwise create one
    this.persistor = reduxStore.persistor || null;
    this.isInitialized = !!this.persistor;
  }

  /**
   * Initialize the persistence layer
   * @returns {Promise} - Promise that resolves when persistence is ready
   */
  async initialize() {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    try {
      // If we don't have a persistor, create one
      if (!this.persistor) {
        this.persistor = persistStore(this.store);

        // Wait for rehydration
        await new Promise((resolve, reject) => {
          const unsubscribe = this.persistor.subscribe(() => {
            const { bootstrapped } = this.persistor.getState();
            if (bootstrapped) {
              unsubscribe();
              resolve();
            }
          });

          // Timeout after configured time (default 10 seconds)
          const timeoutMs = this.config.timeout || 10000;
          setTimeout(() => {
            unsubscribe();
            reject(new Error('Persistence initialization timeout'));
          }, timeoutMs);
        });
      }

      this.isInitialized = true;
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to initialize persistence:', error);
      throw error;
    }
  }

  /**
   * Save content with ownership validation and conflict resolution
   * @param {Object} content - Content to save
   * @param {Object} context - Save context
   * @returns {Promise} - Promise with save result
   */
  async saveContent(content, context = {}) {
    const startTime = performance.now();
    let metrics = { duration: 0, memoryUsage: 0, databaseQueries: 0 };

    try {
      // Check for conflicts before proceeding
      const conflict = this.conflictDetectionService.detectConflict(content, 'write', context);
      if (conflict.hasConflict) {
        // Handle conflict resolution
        const resolution = await this._handleConflictResolution(conflict, { content, operation: 'write', ...context });
        if (!resolution.canProceed) {
          return {
            success: false,
            conflict: conflict,
            resolution: resolution,
            message: resolution.message || 'Operation cancelled due to conflict'
          };
        }

        // If resolution created a copy, use that instead
        if (resolution.copiedContent) {
          content = resolution.copiedContent;
        }
      }

      // Validate ownership before saving
      const validation = this.ownershipService.validateOperation(content, 'write', context);
      if (!validation.isValid) {
        throw new Error(`Save validation failed: ${validation.errors.join(', ')}`);
      }

      // Perform save operation using SaveFlowService
      const saveResult = await this.saveFlowService.save(content, {
        ownership: content.ownership || 'user',
        metadata: {
          operation: 'save',
          context,
          validation,
          conflictResolution: conflict.hasConflict ? 'resolved' : 'none'
        }
      });

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Save operation failed');
      }

      // Wait for persistence to complete
      await this._waitForPersistence();

      const endTime = performance.now();
      metrics = {
        duration: endTime - startTime,
        memoryUsage: this._getMemoryUsage(),
        databaseQueries: saveResult.queryCount || 0
      };

      const result = {
        success: true,
        contentId: content.id,
        timestamp: new Date().toISOString(),
        operationId: saveResult.operationId,
        saveFlowId: saveResult.operationId,
        conflictResolved: conflict.hasConflict
      };

      // Validate consistency
      const consistencyResult = this.consistencyValidator.validateSaveConsistency(
        content,
        context,
        result,
        metrics
      );

      // Log consistency issues
      if (!consistencyResult.isConsistent) {
        console.warn('Save operation consistency issue:', consistencyResult.inconsistencies);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      metrics.duration = endTime - startTime;

      console.error('Save content failed:', error);
      throw error;
    }
  }

  /**
   * Load content with ownership validation
   * @param {string} contentId - Content ID to load
   * @param {Object} context - Load context
   * @returns {Promise} - Promise with loaded content
   */
  async loadContent(contentId, context = {}) {
    const startTime = performance.now();
    let metrics = { duration: 0, memoryUsage: 0, databaseQueries: 0 };

    try {
      // Get content from store first to validate ownership
      const content = this._getContentFromStore(contentId);
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      // Validate ownership before loading
      const validation = this.ownershipService.validateOperation(content, 'read', context);
      if (!validation.isValid) {
        throw new Error(`Load validation failed: ${validation.errors.join(', ')}`);
      }

      // Perform load operation using SaveFlowService
      const loadResult = await this.saveFlowService.load(contentId, {
        validateOwnership: false // We already validated ownership
      });

      if (!loadResult.success) {
        throw new Error(loadResult.error || 'Load operation failed');
      }

      const endTime = performance.now();
      metrics = {
        duration: endTime - startTime,
        memoryUsage: this._getMemoryUsage(),
        databaseQueries: loadResult.queryCount || 0
      };

      const result = {
        success: true,
        content: loadResult.content,
        ownership: loadResult.ownership,
        timestamp: new Date().toISOString(),
        loadFlowId: `load_${Date.now()}`
      };

      // Validate consistency
      const consistencyResult = this.consistencyValidator.validateLoadConsistency(
        contentId,
        context,
        result,
        metrics
      );

      // Log consistency issues
      if (!consistencyResult.isConsistent) {
        console.warn('Load operation consistency issue:', consistencyResult.inconsistencies);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      metrics.duration = endTime - startTime;

      console.error('Load content failed:', error);
      throw error;
    }
  }

  /**
   * Delete content with ownership validation and conflict resolution
   * @param {string} contentId - Content ID to delete
   * @param {Object} context - Delete context
   * @returns {Promise} - Promise with delete result
   */
  async deleteContent(contentId, context = {}) {
    const startTime = performance.now();
    let metrics = { duration: 0, memoryUsage: 0, databaseQueries: 0 };

    try {
      // Get content from store first to validate ownership
      const content = this._getContentFromStore(contentId);
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      // Check for conflicts before proceeding
      const conflict = this.conflictDetectionService.detectConflict(content, 'delete', context);
      if (conflict.hasConflict) {
        const resolution = await this._handleConflictResolution(conflict, { content, operation: 'delete', ...context });
        if (!resolution.canProceed) {
          return {
            success: false,
            conflict: conflict,
            resolution: resolution,
            message: resolution.message || 'Delete operation cancelled due to conflict'
          };
        }
      }

      // Validate ownership before deleting
      const validation = this.ownershipService.validateOperation(content, 'delete', context);
      if (!validation.isValid) {
        throw new Error(`Delete validation failed: ${validation.errors.join(', ')}`);
      }

      // Perform delete operation
      this.store.dispatch({
        type: 'DELETE_CONTENT',
        payload: {
          contentId,
          timestamp: new Date().toISOString()
        }
      });

      // Wait for persistence to complete
      await this._waitForPersistence();

      const endTime = performance.now();
      metrics = {
        duration: endTime - startTime,
        memoryUsage: this._getMemoryUsage(),
        databaseQueries: 1 // Assume 1 query for delete
      };

      const result = {
        success: true,
        contentId,
        timestamp: new Date().toISOString(),
        deleteFlowId: `delete_${Date.now()}`,
        conflictResolved: conflict.hasConflict
      };

      // Validate consistency
      const consistencyResult = this.consistencyValidator.validateDeleteConsistency(
        contentId,
        { ...context, contentOwnership: content.ownership },
        result,
        metrics
      );

      // Log consistency issues
      if (!consistencyResult.isConsistent) {
        console.warn('Delete operation consistency issue:', consistencyResult.inconsistencies);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      metrics.duration = endTime - startTime;

      console.error('Delete content failed:', error);
      throw error;
    }
  }

  /**
   * Copy content with ownership change and conflict resolution
   * @param {string} contentId - Content ID to copy
   * @param {string} newOwnership - New ownership type
   * @param {Object} context - Copy context
   * @returns {Promise} - Promise with copied content
   */
  async copyContent(contentId, newOwnership = 'user', context = {}) {
    const startTime = performance.now();
    let metrics = { duration: 0, memoryUsage: 0, databaseQueries: 0 };

    try {
      // Get content from store first
      const content = this._getContentFromStore(contentId);
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      // Check for conflicts before proceeding
      const conflict = this.conflictDetectionService.detectConflict(content, 'copy', {
        newOwnership,
        ...context
      });
      if (conflict.hasConflict) {
        const resolution = await this._handleConflictResolution(conflict, {
          content,
          operation: 'copy',
          newOwnership,
          ...context
        });
        if (!resolution.canProceed) {
          return {
            success: false,
            conflict: conflict,
            resolution: resolution,
            message: resolution.message || 'Copy operation cancelled due to conflict'
          };
        }
      }

      // Validate ownership change - reject same ownership for copy operations
      if (content.ownership === newOwnership) {
        return {
          success: false,
          conflict: {
            conflictType: 'ownership_change',
            severity: 'high',
            resolution: {
              type: 'block',
              reason: 'same_ownership_copy',
              message: `Cannot copy content to the same ownership type (${newOwnership})`,
              options: [
                {
                  id: 'cancel',
                  label: 'Cancel',
                  description: 'Do not perform the copy operation'
                }
              ]
            },
            errors: [`Copy operation requires changing ownership from ${content.ownership} to a different type`],
            warnings: [],
            timestamp: new Date().toISOString(),
            id: this.constructor.generateId ? this.constructor.generateId() : `conflict_${Date.now()}`
          },
          message: `Copy operation cancelled due to same ownership`
        };
      }

      // Validate ownership change
      const ownershipValidation = this.ownershipService.validateOwnershipChange(content, newOwnership, context);
      if (!ownershipValidation.isValid) {
        // Return structured conflict response instead of throwing
        return {
          success: false,
          conflict: {
            conflictType: 'ownership_change',
            severity: 'high',
            resolution: {
              type: 'block',
              reason: 'invalid_ownership_change',
              message: `Cannot change ownership from ${content.ownership} to ${newOwnership}`,
              options: [
                {
                  id: 'cancel',
                  label: 'Cancel',
                  description: 'Do not perform the copy operation'
                }
              ]
            },
            errors: ownershipValidation.errors,
            warnings: ownershipValidation.warnings,
            timestamp: new Date().toISOString(),
            id: this.constructor.generateId ? this.constructor.generateId() : `conflict_${Date.now()}`
          },
          message: `Copy operation cancelled due to ownership change conflict`
        };
      }

      // Validate copy operation
      const copyValidation = this.ownershipService.validateOperation(content, 'copy', context);
      if (!copyValidation.isValid) {
        throw new Error(`Copy validation failed: ${copyValidation.errors.join(', ')}`);
      }

      // Create copy with new ownership
      const copiedContent = {
        ...content,
        id: `${content.id}_copy_${Date.now()}`,
        ownership: newOwnership,
        copiedFrom: content.id,
        copyTimestamp: new Date().toISOString()
      };

      // Dispatch copy action to Redux store
      this.store.dispatch({
        type: 'COPY_CONTENT',
        payload: {
          originalContent: content,
          copiedContent,
          timestamp: new Date().toISOString()
        }
      });

      // Wait for persistence to complete
      await this._waitForPersistence();

      const endTime = performance.now();
      metrics = {
        duration: endTime - startTime,
        memoryUsage: this._getMemoryUsage(),
        databaseQueries: 2 // Assume 2 queries for copy (read + write)
      };

      const result = {
        success: true,
        originalContentId: content.id,
        copiedContentId: copiedContent.id,
        newOwnership,
        timestamp: new Date().toISOString(),
        copyFlowId: `copy_${Date.now()}`,
        conflictResolved: conflict.hasConflict
      };

      // Validate consistency
      const consistencyResult = this.consistencyValidator.validateCopyConsistency(
        contentId,
        newOwnership,
        { ...context, originalOwnership: content.ownership },
        result,
        metrics
      );

      // Log consistency issues
      if (!consistencyResult.isConsistent) {
        console.warn('Copy operation consistency issue:', consistencyResult.inconsistencies);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      metrics.duration = endTime - startTime;

      console.error('Copy content failed:', error);
      throw error;
    }
  }

  /**
   * Get persistence status
   * @returns {Object} - Persistence status
   */
  getStatus() {
    if (!this.persistor) {
      return { initialized: false };
    }

    const persistorState = this.persistor.getState();
    return {
      initialized: this.isInitialized,
      bootstrapped: persistorState.bootstrapped,
      paused: persistorState.paused,
      registry: persistorState.registry
    };
  }

  /**
   * Purge all persisted data
   * @returns {Promise} - Promise that resolves when purge is complete
   */
  async purge() {
    if (!this.persistor) {
      throw new Error('Persistor not initialized');
    }

    try {
      await this.persistor.purge();
      return { success: true };
    } catch (error) {
      console.error('Purge failed:', error);
      throw error;
    }
  }

  /**
   * Pause persistence
   */
  pause() {
    if (this.persistor && this.persistor.pause) {
      this.persistor.pause();
    }
  }

  /**
   * Resume persistence
   */
  resume() {
    if (this.persistor && this.persistor.resume) {
      this.persistor.resume();
    }
  }

  /**
   * Get content from Redux store
   * @private
   */
  _getContentFromStore(contentId) {
    const state = this.store.getState();

    // Search through different state slices
    const slices = ['worlds', 'characters', 'interactions', 'simulation'];
    for (const slice of slices) {
      if (state[slice] && state[slice][contentId]) {
        return {
          id: contentId,
          ...state[slice][contentId]
        };
      }
    }

    return null;
  }

  /**
   * Handle conflict resolution
   * @private
   */
  async _handleConflictResolution(conflict, context) {
    try {
      // For now, we'll auto-resolve conflicts based on severity
      // In a real implementation, this would trigger a UI dialog
      if (conflict.severity === 'critical') {
        return {
          canProceed: false,
          message: 'Operation blocked due to critical conflict',
          copiedContent: null
        };
      }

      if (conflict.conflictType === 'demo_modification' && conflict.resolution.type === 'copy_first') {
        // Auto-create a copy for demo content modifications
        const copiedContent = await this._createUserCopy(context.content);
        return {
          canProceed: true,
          message: 'Demo content copied to user ownership',
          copiedContent
        };
      }

      // For other conflicts, allow proceeding with warnings
      return {
        canProceed: true,
        message: 'Proceeding with operation',
        copiedContent: null
      };
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      return {
        canProceed: false,
        message: `Conflict resolution failed: ${error.message}`,
        copiedContent: null
      };
    }
  }

  /**
   * Create a user-owned copy of content
   * @private
   */
  async _createUserCopy(content) {
    const copiedContent = {
      ...content,
      id: `${content.id}_copy_${Date.now()}`,
      ownership: 'user',
      copiedFrom: content.id,
      copyTimestamp: new Date().toISOString()
    };

    return copiedContent;
  }

  /**
   * Get consistency report for recent operations
   * @returns {Array} - Array of consistency validation results
   */
  getConsistencyReport() {
    return this.consistencyValidator.getConsistencyReport();
  }

  /**
   * Get performance metrics summary
   * @returns {Object} - Performance metrics summary
   */
  getPerformanceMetricsSummary() {
    return this.consistencyValidator.getPerformanceMetricsSummary();
  }

  /**
   * Validate operation consistency in real-time
   * @param {string} operation - Operation type
   * @param {Object} content - Content object
   * @param {Object} context - Operation context
   * @returns {boolean} - Whether operation is consistent
   */
  validateOperationConsistency(operation, content, context = {}) {
    // This is a lightweight validation that doesn't require full operation execution
    const mockResult = this._createMockResult(operation, content);
    const mockMetrics = { duration: 100, memoryUsage: 1024, databaseQueries: 1 };

    let consistencyResult;
    switch (operation) {
      case 'save':
        consistencyResult = this.consistencyValidator.validateSaveConsistency(
          content,
          context,
          mockResult,
          mockMetrics
        );
        break;
      case 'load':
        consistencyResult = this.consistencyValidator.validateLoadConsistency(
          content.id,
          context,
          mockResult,
          mockMetrics
        );
        break;
      case 'delete':
        consistencyResult = this.consistencyValidator.validateDeleteConsistency(
          content.id,
          { ...context, contentOwnership: content.ownership },
          mockResult,
          mockMetrics
        );
        break;
      case 'copy':
        consistencyResult = this.consistencyValidator.validateCopyConsistency(
          content.id,
          'user',
          { ...context, originalOwnership: content.ownership },
          mockResult,
          mockMetrics
        );
        break;
      default:
        return false;
    }

    return consistencyResult.isConsistent;
  }

  /**
   * Create mock result for consistency validation
   * @private
   */
  _createMockResult(operation, content) {
    const baseResult = {
      success: true,
      timestamp: new Date().toISOString()
    };

    switch (operation) {
      case 'save':
        return { ...baseResult, contentId: content.id };
      case 'load':
        return { ...baseResult, content, ownership: content.ownership };
      case 'delete':
        return { ...baseResult, contentId: content.id };
      case 'copy':
        return {
          ...baseResult,
          originalContentId: content.id,
          copiedContentId: `${content.id}_copy_${Date.now()}`,
          newOwnership: 'user'
        };
      default:
        return baseResult;
    }
  }

  /**
   * Get current memory usage
   * @private
   */
  _getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  /**
   * Wait for persistence to complete
   * @private
   */
  async _waitForPersistence() {
    // Wait for Redux-Persist to flush changes
    if (this.persistor) {
      await new Promise(resolve => {
        const unsubscribe = this.persistor.subscribe(() => {
          // Check if persistence is complete
          const state = this.persistor.getState();
          if (!state.paused) {
            unsubscribe();
            resolve();
          }
        });

        // Fallback timeout
        setTimeout(() => {
          unsubscribe();
          resolve();
        }, 1000);
      });
    }
  }
}