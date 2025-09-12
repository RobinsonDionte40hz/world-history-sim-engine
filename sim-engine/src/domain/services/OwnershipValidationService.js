/**
 * OwnershipValidationService - Domain service for validating content ownership and permissions
 * Ensures that save operations respect ownership rules and permissions
 */

export default class OwnershipValidationService {
  constructor() {
    this.ownershipRules = {
      user: {
        canModify: true,
        canDelete: true,
        canCopy: true,
        canShare: true,
        allowedOperations: ['read', 'write', 'delete', 'modify', 'copy', 'share']
      },
      demo: {
        canModify: false,
        canDelete: false,
        canCopy: true,
        canShare: false,
        allowedOperations: ['read', 'copy'],
        restrictions: ['no-modify', 'no-delete', 'no-share']
      }
    };

    this.operationPermissions = {
      read: ['user', 'demo'],
      write: ['user'],
      delete: ['user'],
      modify: ['user'],
      copy: ['user', 'demo'],
      share: ['user'],
      save: ['user'],
      load: ['user', 'demo']
    };
  }

  /**
   * Validate ownership for a specific operation
   * @param {Object} content - Content to validate
   * @param {string} operation - Operation to perform
   * @param {Object} context - Additional context
   * @returns {Object} - Validation result
   */
  validateOperation(content, operation, context = {}) {
    const errors = [];
    const warnings = [];

    // Validate content exists
    if (!content || !content.id) {
      errors.push('Content is required for ownership validation');
      return this._createResult(false, errors, warnings);
    }

    // Validate operation exists
    if (!operation || typeof operation !== 'string') {
      errors.push('Valid operation is required');
      return this._createResult(false, errors, warnings);
    }

    // Get ownership type
    const ownership = content.ownership || 'user';

    // Validate ownership type
    if (!this.ownershipRules[ownership]) {
      errors.push(`Invalid ownership type: ${ownership}`);
      return this._createResult(false, errors, warnings);
    }

    // Check if operation is allowed for this ownership type
    const allowedOperations = this.ownershipRules[ownership].allowedOperations;
    if (!allowedOperations.includes(operation)) {
      errors.push(`Operation '${operation}' is not allowed for ${ownership} content`);
      return this._createResult(false, errors, warnings);
    }

    // For built-in ownership types, check operation-specific permissions
    // For custom ownership types, rely on the ownership rules
    if (ownership === 'user' || ownership === 'demo') {
      const allowedOwnerships = this.operationPermissions[operation];
      if (!allowedOwnerships || !allowedOwnerships.includes(ownership)) {
        errors.push(`Ownership type '${ownership}' cannot perform operation '${operation}'`);
        return this._createResult(false, errors, warnings);
      }
    }

    // Check for specific restrictions
    const restrictions = this.ownershipRules[ownership].restrictions || [];
    for (const restriction of restrictions) {
      if (this._violatesRestriction(content, operation, restriction, context)) {
        errors.push(`Operation violates ${restriction} restriction`);
      }
    }

    // Add warnings for potentially risky operations
    if (this._shouldWarn(content, operation, context)) {
      warnings.push(this._getWarningMessage(content, operation, context));
    }

    const isValid = errors.length === 0;
    return this._createResult(isValid, errors, warnings, {
      ownership,
      operation,
      allowed: isValid
    });
  }

  /**
   * Validate content ownership change
   * @param {Object} content - Content to validate
   * @param {string} newOwnership - New ownership type
   * @param {Object} context - Additional context
   * @returns {Object} - Validation result
   */
  validateOwnershipChange(content, newOwnership, context = {}) {
    const errors = [];
    const warnings = [];

    // Validate content
    if (!content || !content.id) {
      errors.push('Content is required for ownership change validation');
      return this._createResult(false, errors, warnings);
    }

    const currentOwnership = content.ownership || 'user';

    // Validate new ownership type
    if (!this.ownershipRules[newOwnership]) {
      errors.push(`Invalid new ownership type: ${newOwnership}`);
      return this._createResult(false, errors, warnings);
    }

    // Check for data loss warnings (before validity check)
    if (this._willLosePermissions(currentOwnership, newOwnership)) {
      warnings.push(`Changing ownership to ${newOwnership} will restrict available operations`);
    }

    // Check if ownership change is allowed
    if (!this._canChangeOwnership(currentOwnership, newOwnership, context)) {
      errors.push(`Cannot change ownership from ${currentOwnership} to ${newOwnership}`);
      return this._createResult(false, errors, warnings);
    }

    const isValid = errors.length === 0;
    return this._createResult(isValid, errors, warnings, {
      currentOwnership,
      newOwnership,
      changeAllowed: isValid
    });
  }

  /**
   * Get available operations for content
   * @param {Object} content - Content to check
   * @returns {Array} - Array of available operations
   */
  getAvailableOperations(content) {
    if (!content || !content.ownership) {
      return [];
    }

    const ownership = content.ownership;
    const rules = this.ownershipRules[ownership];

    return rules ? rules.allowedOperations : [];
  }

  /**
   * Check if content can be modified
   * @param {Object} content - Content to check
   * @returns {boolean} - Whether content can be modified
   */
  canModify(content) {
    if (!content || !content.ownership) {
      return false;
    }

    const rules = this.ownershipRules[content.ownership];
    return rules ? rules.canModify : false;
  }

  /**
   * Check if content can be deleted
   * @param {Object} content - Content to check
   * @returns {boolean} - Whether content can be deleted
   */
  canDelete(content) {
    if (!content || !content.ownership) {
      return false;
    }

    const rules = this.ownershipRules[content.ownership];
    return rules ? rules.canDelete : false;
  }

  /**
   * Check if content can be copied
   * @param {Object} content - Content to check
   * @returns {boolean} - Whether content can be copied
   */
  canCopy(content) {
    if (!content || !content.ownership) {
      return false;
    }

    const rules = this.ownershipRules[content.ownership];
    return rules ? rules.canCopy : false;
  }

  /**
   * Get ownership rules for a specific type
   * @param {string} ownershipType - Ownership type
   * @returns {Object} - Ownership rules
   */
  getOwnershipRules(ownershipType) {
    return this.ownershipRules[ownershipType] || null;
  }

  /**
   * Add custom ownership rule
   * @param {string} ownershipType - Ownership type
   * @param {Object} rules - Ownership rules
   */
  addOwnershipRule(ownershipType, rules) {
    this.ownershipRules[ownershipType] = {
      canModify: false,
      canDelete: false,
      canCopy: true,
      canShare: false,
      allowedOperations: ['read'],
      restrictions: [],
      ...rules
    };
  }

  /**
   * Check if operation violates a restriction
   * @private
   */
  _violatesRestriction(content, operation, restriction, context) {
    switch (restriction) {
      case 'no-modify':
        return ['write', 'modify', 'delete'].includes(operation);
      case 'no-delete':
        return operation === 'delete';
      case 'no-share':
        return operation === 'share';
      case 'no-save':
        return operation === 'save';
      default:
        return false;
    }
  }

  /**
   * Check if operation should generate a warning
   * @private
   */
  _shouldWarn(content, operation, context) {
    // Warn when demo content is being copied (common operation)
    if (content.ownership === 'demo' && operation === 'copy') {
      return true;
    }

    // Warn when deleting user content
    if (content.ownership === 'user' && operation === 'delete') {
      return true;
    }

    return false;
  }

  /**
   * Get warning message for operation
   * @private
   */
  _getWarningMessage(content, operation, context) {
    if (content.ownership === 'demo' && operation === 'copy') {
      return 'Copying demo content will create user-owned content that can be modified';
    }

    if (content.ownership === 'user' && operation === 'delete') {
      return 'Deleting user content cannot be undone';
    }

    return 'This operation may have unintended consequences';
  }

  /**
   * Check if ownership change is allowed
   * @private
   */
  _canChangeOwnership(currentOwnership, newOwnership, context) {
    // Same ownership change is always allowed (no actual change needed)
    if (currentOwnership === newOwnership) {
      return true;
    }

    // Demo to user is allowed (copy operation)
    if (currentOwnership === 'demo' && newOwnership === 'user') {
      return true;
    }

    // User to demo is generally not allowed
    if (currentOwnership === 'user' && newOwnership === 'demo') {
      return false;
    }

    return false;
  }

  /**
   * Check if changing ownership will result in lost permissions
   * @private
   */
  _willLosePermissions(currentOwnership, newOwnership) {
    if (currentOwnership === 'user' && newOwnership === 'demo') {
      return true;
    }

    return false;
  }

  /**
   * Create validation result object
   * @private
   */
  _createResult(isValid, errors = [], warnings = [], metadata = {}) {
    return {
      isValid,
      errors,
      warnings,
      metadata
    };
  }

  /**
   * Validate multiple operations
   * @param {Array} operations - Array of {content, operation, context} objects
   * @returns {Object} - Batch validation result
   */
  validateOperations(operations) {
    const results = [];
    let allValid = true;

    for (const { content, operation, context } of operations) {
      const result = this.validateOperation(content, operation, context);
      results.push(result);

      if (!result.isValid) {
        allValid = false;
      }
    }

    return {
      isValid: allValid,
      results,
      summary: {
        total: operations.length,
        valid: results.filter(r => r.isValid).length,
        invalid: results.filter(r => r.isValid === false).length
      }
    };
  }
}