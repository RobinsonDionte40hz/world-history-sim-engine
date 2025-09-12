/**
 * ConflictDetectionService - Domain service for detecting conflicts in content operations
 * Identifies when demo content modifications are attempted and prepares conflict resolution
 */

import BaseDomainService from './BaseDomainService.js';

export default class ConflictDetectionService extends BaseDomainService {
  constructor(ownershipValidationService) {
    super();
    this.ownershipValidationService = ownershipValidationService;
    this.conflictTypes = {
      DEMO_MODIFICATION: 'demo_modification',
      DEMO_DELETION: 'demo_deletion',
      OWNERSHIP_CHANGE: 'ownership_change',
      PERMISSION_VIOLATION: 'permission_violation'
    };

    this.conflictSeverities = {
      LOW: 'low',           // Minor conflicts, can be auto-resolved
      MEDIUM: 'medium',     // Requires user confirmation
      HIGH: 'high',         // Requires explicit user action
      CRITICAL: 'critical'  // Operation should be blocked
    };
  }

  /**
   * Detect conflicts for a content operation
   * @param {Object} content - Content being operated on
   * @param {string} operation - Operation being performed
   * @param {Object} context - Additional context
   * @returns {Object} - Conflict detection result
   */
  detectConflict(content, operation, context = {}) {
    // Validate inputs
    const validation = this._validateInputs(content, operation);
    if (!validation.isValid) {
      return {
        hasConflict: false,
        conflictType: null,
        severity: null,
        resolution: null,
        errors: validation.errors,
        warnings: validation.warnings
      };
    }

    // Check for demo content modification conflicts first (more specific)
    if (content.ownership === 'demo') {
      const demoConflict = this._detectDemoConflict(content, operation, context);
      if (demoConflict.hasConflict) {
        // Merge input validation warnings with conflict warnings
        return {
          ...demoConflict,
          warnings: [...validation.warnings, ...demoConflict.warnings]
        };
      }
    }

    // Check ownership validation for general permission issues
    const ownershipResult = this.ownershipValidationService.validateOperation(
      content,
      operation,
      context
    );

    if (!ownershipResult.isValid) {
      // This is a permission violation conflict
      return this._createConflictResult(
        this.conflictTypes.PERMISSION_VIOLATION,
        this.conflictSeverities.CRITICAL,
        {
          reason: 'permission_denied',
          details: ownershipResult.errors,
          suggestedResolution: 'cancel_operation'
        },
        ownershipResult.errors,
        [...validation.warnings, ...ownershipResult.warnings]
      );
    }

    // Check for ownership change conflicts
    if (operation === 'copy' && context.newOwnership) {
      const ownershipConflict = this._detectOwnershipChangeConflict(
        content,
        context.newOwnership,
        context
      );
      if (ownershipConflict.hasConflict) {
        // Merge input validation warnings with conflict warnings
        return {
          ...ownershipConflict,
          warnings: [...validation.warnings, ...ownershipConflict.warnings]
        };
      }
    }

    // No conflicts detected
    return {
      hasConflict: false,
      conflictType: null,
      severity: null,
      resolution: null,
      errors: [],
      warnings: [...validation.warnings, ...ownershipResult.warnings]
    };
  }

  /**
   * Detect conflicts specific to demo content operations
   * @private
   */
  _detectDemoConflict(content, operation, context) {
    const modifyingOperations = ['write', 'modify', 'delete', 'save'];

    if (modifyingOperations.includes(operation)) {
      const severity = this._determineDemoConflictSeverity(operation, context);

      let resolution;
      if (severity === this.conflictSeverities.CRITICAL) {
        resolution = {
          type: 'block_operation',
          reason: 'demo_content_protected',
          message: 'Demo content cannot be modified directly'
        };
      } else {
        resolution = {
          type: 'copy_first',
          reason: 'demo_modification_attempted',
          message: 'Would you like to create a copy of this demo content to modify?',
          options: [
            {
              id: 'copy_and_modify',
              label: 'Create Copy and Modify',
              description: 'Create a user-owned copy that you can modify'
            },
            {
              id: 'cancel',
              label: 'Cancel',
              description: 'Do not modify the demo content'
            }
          ]
        };
      }

      return this._createConflictResult(
        this.conflictTypes.DEMO_MODIFICATION,
        severity,
        resolution,
        [],
        [`Attempting to ${operation} demo content`]
      );
    }

    return { hasConflict: false };
  }

  /**
   * Detect conflicts related to ownership changes
   * @private
   */
  _detectOwnershipChangeConflict(content, newOwnership, context) {
    const ownershipResult = this.ownershipValidationService.validateOwnershipChange(
      content,
      newOwnership,
      context
    );

    if (!ownershipResult.isValid) {
      return this._createConflictResult(
        this.conflictTypes.OWNERSHIP_CHANGE,
        this.conflictSeverities.HIGH,
        {
          type: 'ownership_change_blocked',
          reason: 'invalid_ownership_change',
          message: `Cannot change ownership from ${content.ownership} to ${newOwnership}`,
          options: [
            {
              id: 'keep_current',
              label: 'Keep Current Ownership',
              description: 'Maintain the current ownership type'
            }
          ]
        },
        ownershipResult.errors,
        ownershipResult.warnings
      );
    }

    // Warn about permission loss
    if (ownershipResult.warnings.length > 0) {
      return this._createConflictResult(
        this.conflictTypes.OWNERSHIP_CHANGE,
        this.conflictSeverities.MEDIUM,
        {
          type: 'confirm_permission_loss',
          reason: 'ownership_change_warning',
          message: 'Changing ownership may restrict your permissions',
          options: [
            {
              id: 'proceed',
              label: 'Proceed Anyway',
              description: 'Continue with the ownership change'
            },
            {
              id: 'cancel',
              label: 'Cancel',
              description: 'Keep current ownership'
            }
          ]
        },
        [],
        ownershipResult.warnings
      );
    }

    return { hasConflict: false };
  }

  /**
   * Determine the severity of a demo content conflict
   * @private
   */
  _determineDemoConflictSeverity(operation, context) {
    switch (operation) {
      case 'delete':
        return this.conflictSeverities.CRITICAL;
      case 'write':
      case 'modify':
      case 'save':
        return this.conflictSeverities.HIGH;
      default:
        return this.conflictSeverities.MEDIUM;
    }
  }

  /**
   * Validate input parameters
   * @private
   */
  _validateInputs(content, operation) {
    const errors = [];
    const warnings = [];

    if (!content) {
      errors.push('Content is required for conflict detection');
    } else {
      if (!content.id) {
        errors.push('Content must have an id');
      }
      if (!content.ownership) {
        warnings.push('Content ownership not specified, assuming user ownership');
      }
    }

    if (!operation || typeof operation !== 'string') {
      errors.push('Valid operation is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Create a standardized conflict result
   * @private
   */
  _createConflictResult(conflictType, severity, resolution, errors = [], warnings = []) {
    return {
      hasConflict: true,
      conflictType,
      severity,
      resolution,
      errors,
      warnings,
      timestamp: new Date().toISOString(),
      id: this.constructor.generateId()
    };
  }

  /**
   * Get conflict type information
   * @param {string} conflictType - Type of conflict
   * @returns {Object} - Conflict type details
   */
  getConflictTypeInfo(conflictType) {
    const typeInfo = {
      [this.conflictTypes.DEMO_MODIFICATION]: {
        title: 'Demo Content Modification',
        description: 'Attempting to modify protected demo content',
        category: 'content_protection'
      },
      [this.conflictTypes.DEMO_DELETION]: {
        title: 'Demo Content Deletion',
        description: 'Attempting to delete protected demo content',
        category: 'content_protection'
      },
      [this.conflictTypes.OWNERSHIP_CHANGE]: {
        title: 'Ownership Change',
        description: 'Changing content ownership may affect permissions',
        category: 'ownership'
      },
      [this.conflictTypes.PERMISSION_VIOLATION]: {
        title: 'Permission Violation',
        description: 'Operation not allowed due to insufficient permissions',
        category: 'permissions'
      }
    };

    return typeInfo[conflictType] || null;
  }

  /**
   * Get severity information
   * @param {string} severity - Severity level
   * @returns {Object} - Severity details
   */
  getSeverityInfo(severity) {
    const severityInfo = {
      [this.conflictSeverities.LOW]: {
        level: 1,
        color: 'green',
        requiresUserAction: false,
        canAutoResolve: true
      },
      [this.conflictSeverities.MEDIUM]: {
        level: 2,
        color: 'yellow',
        requiresUserAction: true,
        canAutoResolve: false
      },
      [this.conflictSeverities.HIGH]: {
        level: 3,
        color: 'orange',
        requiresUserAction: true,
        canAutoResolve: false
      },
      [this.conflictSeverities.CRITICAL]: {
        level: 4,
        color: 'red',
        requiresUserAction: true,
        canAutoResolve: false,
        blocksOperation: true
      }
    };

    return severityInfo[severity] || null;
  }

  /**
   * Analyze multiple operations for conflicts
   * @param {Array} operations - Array of {content, operation, context} objects
   * @returns {Object} - Batch conflict analysis result
   */
  analyzeOperations(operations) {
    const results = [];
    let hasConflicts = false;
    let criticalConflicts = 0;

    for (const { content, operation, context } of operations) {
      const result = this.detectConflict(content, operation, context);
      results.push(result);

      if (result.hasConflict) {
        hasConflicts = true;
        if (result.severity === this.conflictSeverities.CRITICAL) {
          criticalConflicts++;
        }
      }
    }

    return {
      hasConflicts,
      criticalConflicts,
      totalOperations: operations.length,
      results,
      summary: {
        total: operations.length,
        conflicts: results.filter(r => r.hasConflict).length,
        critical: criticalConflicts,
        warnings: results.reduce((sum, r) => sum + r.warnings.length, 0)
      }
    };
  }
}