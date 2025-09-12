/**
 * ConflictResolutionService - Domain service for resolving content operation conflicts
 * Handles conflict resolution workflow and coordinates with user interfaces
 */

import BaseDomainService from './BaseDomainService.js';

export default class ConflictResolutionService extends BaseDomainService {
  constructor(conflictDetectionService, ownershipValidationService) {
    super();
    this.conflictDetectionService = conflictDetectionService;
    this.ownershipValidationService = ownershipValidationService;
    this.activeResolutions = new Map();
    this.resolutionCallbacks = new Map();

    this.resolutionTypes = {
      COPY_FIRST: 'copy_first',
      CONFIRM_PERMISSION_LOSS: 'confirm_permission_loss',
      OWNERSHIP_CHANGE_BLOCKED: 'ownership_change_blocked',
      BLOCK_OPERATION: 'block_operation',
      AUTO_RESOLVE: 'auto_resolve'
    };

    this.resolutionStates = {
      PENDING: 'pending',
      RESOLVED: 'resolved',
      CANCELLED: 'cancelled',
      FAILED: 'failed'
    };
  }

  /**
   * Resolve a detected conflict
   * @param {Object} conflict - Conflict detection result
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} - Resolution result
   */
  async resolveConflict(conflict, context = {}) {
    if (!conflict.hasConflict) {
      return {
        success: true,
        state: this.resolutionStates.RESOLVED,
        result: null,
        message: 'No conflict to resolve'
      };
    }

    const resolutionId = conflict.id || this.constructor.generateId();
    this.activeResolutions.set(resolutionId, {
      conflict,
      context,
      state: this.resolutionStates.PENDING,
      startedAt: new Date()
    });

    try {
      const result = await this._executeResolution(conflict, context);
      this._updateResolutionState(resolutionId, result.state, result);

      return {
        success: result.state === this.resolutionStates.RESOLVED,
        state: result.state,
        result: result.data,
        message: result.message,
        resolutionId
      };
    } catch (error) {
      this._updateResolutionState(resolutionId, this.resolutionStates.FAILED, { error });
      throw error;
    }
  }

  /**
   * Execute the appropriate resolution strategy
   * @private
   */
  async _executeResolution(conflict, context) {
    switch (conflict.resolution.type) {
      case this.resolutionTypes.COPY_FIRST:
        return await this._resolveCopyFirst(conflict, context);

      case this.resolutionTypes.CONFIRM_PERMISSION_LOSS:
        return await this._resolveConfirmPermissionLoss(conflict, context);

      case this.resolutionTypes.OWNERSHIP_CHANGE_BLOCKED:
        return await this._resolveOwnershipChangeBlocked(conflict, context);

      case this.resolutionTypes.BLOCK_OPERATION:
        return await this._resolveBlockOperation(conflict, context);

      case this.resolutionTypes.AUTO_RESOLVE:
        return await this._resolveAuto(conflict, context);

      default:
        throw new Error(`Unknown resolution type: ${conflict.resolution.type}`);
    }
  }

  /**
   * Resolve conflict by copying demo content first
   * @private
   */
  async _resolveCopyFirst(conflict, context) {
    // Wait for user decision
    const userDecision = await this._waitForUserDecision(conflict.id, conflict.resolution.options);

    if (userDecision === 'copy_and_modify') {
      // Create a copy with user ownership
      const copiedContent = await this._createUserCopy(conflict, context);

      return {
        state: this.resolutionStates.RESOLVED,
        data: {
          action: 'copy_created',
          originalContent: conflict,
          copiedContent,
          nextOperation: context.originalOperation
        },
        message: 'Demo content copied successfully. You can now modify the copy.'
      };
    } else if (userDecision === 'cancel') {
      // User cancelled - don't try to create copy
      return {
        state: this.resolutionStates.CANCELLED,
        data: { action: 'cancelled' },
        message: 'Operation cancelled by user.'
      };
    } else {
      // Unknown decision - treat as cancellation
      return {
        state: this.resolutionStates.CANCELLED,
        data: { action: 'cancelled' },
        message: 'Operation cancelled due to unknown decision.'
      };
    }
  }

  /**
   * Resolve conflict by confirming permission loss
   * @private
   */
  async _resolveConfirmPermissionLoss(conflict, context) {
    const userDecision = await this._waitForUserDecision(conflict.id, conflict.resolution.options);

    if (userDecision === 'proceed') {
      return {
        state: this.resolutionStates.RESOLVED,
        data: {
          action: 'permission_loss_accepted',
          proceedWithOperation: true
        },
        message: 'Permission loss acknowledged. Proceeding with operation.'
      };
    } else {
      return {
        state: this.resolutionStates.CANCELLED,
        data: { action: 'cancelled' },
        message: 'Operation cancelled due to permission concerns.'
      };
    }
  }

  /**
   * Handle blocked ownership change
   * @private
   */
  async _resolveOwnershipChangeBlocked(conflict, context) {
    // For blocked operations, we can only cancel
    return {
      state: this.resolutionStates.CANCELLED,
      data: {
        action: 'operation_blocked',
        reason: conflict.resolution.reason
      },
      message: conflict.resolution.message
    };
  }

  /**
   * Handle operation blocking
   * @private
   */
  async _resolveBlockOperation(conflict, context) {
    return {
      state: this.resolutionStates.CANCELLED,
      data: {
        action: 'operation_blocked',
        reason: conflict.resolution.reason
      },
      message: conflict.resolution.message
    };
  }

  /**
   * Auto-resolve low-severity conflicts
   * @private
   */
  async _resolveAuto(conflict, context) {
    return {
      state: this.resolutionStates.RESOLVED,
      data: {
        action: 'auto_resolved',
        resolution: conflict.resolution
      },
      message: 'Conflict resolved automatically.'
    };
  }

  /**
   * Wait for user decision on conflict resolution
   * @private
   */
  async _waitForUserDecision(conflictId, options) {
    return new Promise((resolve, reject) => {
      // Set up callback for user decision
      this.resolutionCallbacks.set(conflictId, { resolve, reject, options });

      // In a real implementation, this would trigger a UI dialog
      // For now, we'll simulate user interaction
      this._simulateUserDecision(conflictId, options);
    });
  }

  /**
   * Simulate user decision (for testing/development)
   * @private
   */
  _simulateUserDecision(conflictId, options) {
    // Check if a decision has already been submitted (for testing)
    const callback = this.resolutionCallbacks.get(conflictId);
    if (!callback || callback.decisionSubmitted) {
      return; // Decision already submitted, don't simulate
    }

    // For testing purposes, if 'cancel' is an option and no decision was submitted,
    // we should not auto-select it. Let the test control the decision.
    // Only simulate if no manual decision has been made
    setTimeout(() => {
      // Double-check that decision hasn't been submitted in the meantime
      const currentCallback = this.resolutionCallbacks.get(conflictId);
      if (currentCallback && !currentCallback.decisionSubmitted) {
        // Only simulate if still no decision submitted
        const validOptions = Array.isArray(options) ? options : [];
        const nonCancelOptions = validOptions.filter(opt => opt.id !== 'cancel');
        const decision = nonCancelOptions.length > 0 ? nonCancelOptions[0].id : 'cancel';

        currentCallback.resolve(decision);
        this.resolutionCallbacks.delete(conflictId);
      }
    }, 50); // Reduced timeout to allow manual decisions to be submitted first
  }

  /**
   * Create a user-owned copy of demo content
   * @private
   */
  async _createUserCopy(conflict, context) {
    const originalContent = context.content || {};

    // Validate that we have content to copy
    if (!originalContent.id) {
      throw new Error('Content is required for ownership change validation');
    }

    // Create copy with user ownership
    const copiedContent = {
      ...originalContent,
      id: this.constructor.generateId(),
      ownership: 'user',
      copiedFrom: originalContent.id,
      copiedAt: new Date().toISOString(),
      originalOwnership: originalContent.ownership
    };

    // Validate the copy operation
    const validation = this.ownershipValidationService.validateOwnershipChange(
      originalContent,
      'user',
      { operation: 'copy' }
    );

    if (!validation.isValid) {
      throw new Error(`Failed to create user copy: ${validation.errors.join(', ')}`);
    }

    return copiedContent;
  }

  /**
   * Register a callback for user decision
   * @param {string} conflictId - Conflict ID
   * @param {Function} callback - Callback function
   */
  registerResolutionCallback(conflictId, callback) {
    const existing = this.resolutionCallbacks.get(conflictId);
    if (existing) {
      existing.callback = callback;
    } else {
      // Create new callback entry with null resolve/reject to indicate no active promise
      this.resolutionCallbacks.set(conflictId, { callback, resolve: null, reject: null });
    }
  }

  /**
   * Submit user decision for a conflict
   * @param {string} conflictId - Conflict ID
   * @param {string} decision - User decision
   */
  submitUserDecision(conflictId, decision) {
    const callback = this.resolutionCallbacks.get(conflictId);
    if (callback) {
      const validOptions = callback.options.map(opt => opt.id);
      if (validOptions.includes(decision)) {
        callback.decisionSubmitted = true; // Mark as submitted to prevent simulation override
        callback.resolve(decision);
        this.resolutionCallbacks.delete(conflictId);
      } else {
        callback.reject(new Error(`Invalid decision: ${decision}`));
      }
    }
  }

  /**
   * Get active resolution status
   * @param {string} resolutionId - Resolution ID
   * @returns {Object} - Resolution status
   */
  getResolutionStatus(resolutionId) {
    const resolution = this.activeResolutions.get(resolutionId);
    if (!resolution) {
      return null;
    }

    return {
      id: resolutionId,
      state: resolution.state,
      conflict: resolution.conflict,
      startedAt: resolution.startedAt,
      duration: Date.now() - resolution.startedAt.getTime()
    };
  }

  /**
   * Cancel an active resolution
   * @param {string} resolutionId - Resolution ID
   */
  cancelResolution(resolutionId) {
    const resolution = this.activeResolutions.get(resolutionId);
    if (resolution && resolution.state === this.resolutionStates.PENDING) {
      this._updateResolutionState(resolutionId, this.resolutionStates.CANCELLED, {
        cancelledBy: 'user',
        cancelledAt: new Date()
      });
    }
  }

  /**
   * Get all active resolutions
   * @returns {Array} - Array of active resolutions
   */
  getActiveResolutions() {
    return Array.from(this.activeResolutions.entries()).map(([id, resolution]) => ({
      id,
      ...this.getResolutionStatus(id)
    }));
  }

  /**
   * Clean up completed resolutions
   */
  cleanupCompletedResolutions() {
    const completedStates = [
      this.resolutionStates.RESOLVED,
      this.resolutionStates.CANCELLED,
      this.resolutionStates.FAILED
    ];

    for (const [id, resolution] of this.activeResolutions) {
      if (completedStates.includes(resolution.state)) {
        // Keep completed resolutions for a short time (5 minutes)
        const age = Date.now() - resolution.startedAt.getTime();
        if (age > 5 * 60 * 1000) {
          this.activeResolutions.delete(id);
        }
      }
    }
  }

  /**
   * Update resolution state
   * @private
   */
  _updateResolutionState(resolutionId, newState, data = {}) {
    const resolution = this.activeResolutions.get(resolutionId);
    if (resolution) {
      resolution.state = newState;
      resolution.completedAt = new Date();
      resolution.result = data;
    }
  }

  /**
   * Get resolution statistics
   * @returns {Object} - Resolution statistics
   */
  getResolutionStats() {
    const stats = {
      total: this.activeResolutions.size,
      pending: 0,
      resolved: 0,
      cancelled: 0,
      failed: 0
    };

    for (const resolution of this.activeResolutions.values()) {
      stats[resolution.state]++;
    }

    return stats;
  }
}