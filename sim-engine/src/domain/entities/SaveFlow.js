/**
 * SaveFlow Entity
 * Represents a save operation with ownership tracking and metadata
 * Supports both user-created and demo content with different permissions
 */

export default class SaveFlow {
  constructor(config = {}) {
    this.id = config.id || this._generateId();
    this.contentId = config.contentId || null;
    this.contentType = config.contentType || 'world';
    this.ownership = config.ownership || 'user'; // 'user' or 'demo'
    this.permissions = this._initializePermissions(config.permissions);
    this.restrictions = Array.isArray(config.restrictions) ? config.restrictions : [];

    // Timestamps
    this.createdAt = config.createdAt || new Date().toISOString();
    this.modifiedAt = config.modifiedAt || new Date().toISOString();
    this.lastAccessedAt = config.lastAccessedAt || new Date().toISOString();

    // Metadata
    this.version = config.version || '1.0.0';
    this.checksum = config.checksum || null;
    this.size = config.size || 0;
    this.tags = Array.isArray(config.tags) ? config.tags : [];

    // Operation tracking
    this.operationHistory = Array.isArray(config.operationHistory) ?
      config.operationHistory : [];
    this.conflictHistory = Array.isArray(config.conflictHistory) ?
      config.conflictHistory : [];

    // Validation
    this.isValid = config.isValid !== false;
    this.validationErrors = Array.isArray(config.validationErrors) ?
      config.validationErrors : [];
  }

  /**
   * Generate unique ID for save flow
   * @private
   */
  _generateId() {
    return `saveflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize permissions based on ownership
   * @private
   */
  _initializePermissions(customPermissions) {
    if (customPermissions) {
      return customPermissions;
    }

    // Default permissions based on ownership
    switch (this.ownership) {
      case 'user':
        return ['read', 'write', 'delete', 'modify', 'share'];
      case 'demo':
        return ['read', 'copy'];
      default:
        return ['read'];
    }
  }

  /**
   * Check if operation is allowed
   * @param {string} operation - Operation to check ('read', 'write', 'delete', etc.)
   * @returns {boolean} - Whether operation is allowed
   */
  canPerform(operation) {
    return this.permissions.includes(operation);
  }

  /**
   * Check if operation is restricted
   * @param {string} operation - Operation to check
   * @returns {boolean} - Whether operation is restricted
   */
  isRestricted(operation) {
    return this.restrictions.includes(operation) ||
           this.restrictions.includes('all');
  }

  /**
   * Update modification timestamp
   */
  updateModified() {
    this.modifiedAt = new Date().toISOString();
    this.lastAccessedAt = new Date().toISOString();
  }

  /**
   * Update access timestamp
   */
  updateAccessed() {
    this.lastAccessedAt = new Date().toISOString();
  }

  /**
   * Add operation to history
   * @param {string} operation - Operation type
   * @param {Object} metadata - Additional metadata
   */
  addOperation(operation, metadata = {}) {
    this.operationHistory.push({
      operation,
      timestamp: new Date().toISOString(),
      ...metadata
    });

    // Keep only last 100 operations
    if (this.operationHistory.length > 100) {
      this.operationHistory = this.operationHistory.slice(-100);
    }
  }

  /**
   * Add conflict to history
   * @param {string} conflictType - Type of conflict
   * @param {Object} details - Conflict details
   */
  addConflict(conflictType, details = {}) {
    this.conflictHistory.push({
      type: conflictType,
      timestamp: new Date().toISOString(),
      ...details
    });

    // Keep only last 50 conflicts
    if (this.conflictHistory.length > 50) {
      this.conflictHistory = this.conflictHistory.slice(-50);
    }
  }

  /**
   * Validate save flow integrity
   * @returns {Object} - Validation result
   */
  validate() {
    const errors = [];

    if (!this.contentId) {
      errors.push('Content ID is required');
    }

    if (!['user', 'demo'].includes(this.ownership)) {
      errors.push('Ownership must be either "user" or "demo"');
    }

    if (!this.createdAt) {
      errors.push('Creation timestamp is required');
    }

    if (this.size < 0) {
      errors.push('Size cannot be negative');
    }

    this.isValid = errors.length === 0;
    this.validationErrors = errors;

    return {
      isValid: this.isValid,
      errors
    };
  }

  /**
   * Get summary of save flow
   * @returns {Object} - Summary data
   */
  getSummary() {
    return {
      id: this.id,
      contentId: this.contentId,
      contentType: this.contentType,
      ownership: this.ownership,
      permissions: this.permissions,
      restrictions: this.restrictions,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      lastAccessedAt: this.lastAccessedAt,
      version: this.version,
      size: this.size,
      tags: this.tags,
      operationCount: this.operationHistory.length,
      conflictCount: this.conflictHistory.length,
      isValid: this.isValid
    };
  }

  /**
   * Create a copy with new ownership (for Save As New)
   * @param {string} newOwnership - New ownership type
   * @returns {SaveFlow} - New SaveFlow instance
   */
  createCopy(newOwnership = 'user') {
    const copyData = this.toJSON();
    delete copyData.id;
    copyData.ownership = newOwnership;
    // Create a temporary instance to get proper permissions
    const tempInstance = new SaveFlow({ ownership: newOwnership });
    copyData.permissions = tempInstance.permissions;
    copyData.createdAt = new Date().toISOString();
    copyData.modifiedAt = new Date().toISOString();
    copyData.operationHistory = [{
      operation: 'copy',
      timestamp: new Date().toISOString(),
      fromOwnership: this.ownership,
      toOwnership: newOwnership
    }];

    return new SaveFlow(copyData);
  }

  /**
   * Convert to JSON for persistence
   * @returns {Object} - JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      contentId: this.contentId,
      contentType: this.contentType,
      ownership: this.ownership,
      permissions: this.permissions,
      restrictions: this.restrictions,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      lastAccessedAt: this.lastAccessedAt,
      version: this.version,
      checksum: this.checksum,
      size: this.size,
      tags: this.tags,
      operationHistory: this.operationHistory,
      conflictHistory: this.conflictHistory,
      isValid: this.isValid,
      validationErrors: this.validationErrors
    };
  }

  /**
   * Create from JSON data
   * @param {Object} data - JSON data
   * @returns {SaveFlow} - SaveFlow instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for SaveFlow');
    }

    return new SaveFlow(data);
  }

  /**
   * Create SaveFlow for user content
   * @param {string} contentId - Content ID
   * @param {string} contentType - Content type
   * @param {Object} options - Additional options
   * @returns {SaveFlow} - SaveFlow instance
   */
  static createUserSaveFlow(contentId, contentType = 'world', options = {}) {
    return new SaveFlow({
      contentId,
      contentType,
      ownership: 'user',
      ...options
    });
  }

  /**
   * Create SaveFlow for demo content
   * @param {string} contentId - Content ID
   * @param {string} contentType - Content type
   * @param {Object} options - Additional options
   * @returns {SaveFlow} - SaveFlow instance
   */
  static createDemoSaveFlow(contentId, contentType = 'world', options = {}) {
    return new SaveFlow({
      contentId,
      contentType,
      ownership: 'demo',
      restrictions: ['no-modify', 'no-delete'],
      ...options
    });
  }
}