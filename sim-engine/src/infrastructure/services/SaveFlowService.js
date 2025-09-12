/**
 * SaveFlowService - Infrastructure service for unified save flow operations
 * Handles persistence, ownership validation, and conflict resolution for both user and demo content
 */
export default class SaveFlowService {
  constructor(persistenceAdapter = null) {
    this.persistenceAdapter = persistenceAdapter;
    this.saveOperations = new Map();
    this.ownershipCache = new Map();
  }

  /**
   * Initialize the service with persistence adapter
   * @param {Object} persistenceAdapter - Adapter for persistence operations
   */
  initialize(persistenceAdapter) {
    this.persistenceAdapter = persistenceAdapter;
    return this;
  }

  /**
   * Save content with ownership tracking
   * @param {Object} content - Content to save
   * @param {Object} options - Save options
   * @returns {Promise<Object>} - Save result
   */
  async save(content, options = {}) {
    const {
      ownership = 'user',
      force = false,
      metadata = {}
    } = options;

    try {
      // Validate ownership
      const ownershipResult = await this.validateOwnership(content, ownership);
      if (!ownershipResult.isValid && !force) {
        return {
          success: false,
          error: 'Ownership validation failed',
          details: ownershipResult.errors
        };
      }

      // Check for conflicts
      const conflictResult = await this.checkConflicts(content);
      if (conflictResult.hasConflicts && !force) {
        return {
          success: false,
          error: 'Save conflict detected',
          conflicts: conflictResult.conflicts,
          resolution: conflictResult.suggestedResolution
        };
      }

      // Generate save operation ID
      const operationId = this.generateOperationId();

      // Prepare save data with metadata
      const saveData = {
        id: operationId,
        content,
        ownership,
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          version: this.getVersion(),
          operationType: 'save'
        }
      };

      // Execute save operation
      const saveResult = await this.persistenceAdapter.save(saveData);

      // Cache ownership information
      this.ownershipCache.set(content.id, ownership);

      // Track save operation
      this.saveOperations.set(operationId, {
        ...saveData,
        result: saveResult
      });

      return {
        success: true,
        operationId,
        data: saveData,
        result: saveResult
      };

    } catch (error) {
      return {
        success: false,
        error: `Save operation failed: ${error.message}`
      };
    }
  }

  /**
   * Load content with ownership validation
   * @param {string} contentId - ID of content to load
   * @param {Object} options - Load options
   * @returns {Promise<Object>} - Load result
   */
  async load(contentId, options = {}) {
    const { validateOwnership = true } = options;

    try {
      const loadResult = await this.persistenceAdapter.load(contentId);

      if (!loadResult) {
        return {
          success: false,
          error: 'Content not found'
        };
      }

      // Validate ownership if requested
      if (validateOwnership) {
        const ownershipResult = await this.validateOwnership(loadResult.content, loadResult.ownership);
        if (!ownershipResult.isValid) {
          return {
            success: false,
            error: 'Ownership validation failed',
            details: ownershipResult.errors
          };
        }
      }

      return {
        success: true,
        content: loadResult.content,
        ownership: loadResult.ownership,
        metadata: loadResult.metadata
      };

    } catch (error) {
      return {
        success: false,
        error: `Load operation failed: ${error.message}`
      };
    }
  }

  /**
   * Validate ownership of content
   * @param {Object} content - Content to validate
   * @param {string} ownership - Expected ownership type
   * @returns {Promise<Object>} - Validation result
   */
  async validateOwnership(content, ownership) {
    const errors = [];

    // Check if content has required ownership properties
    if (!content || !content.id) {
      errors.push('Content must have an ID for ownership validation');
    }

    // Validate ownership type
    if (!['user', 'demo'].includes(ownership)) {
      errors.push('Ownership must be either "user" or "demo"');
    }

    // Check cached ownership if available
    const cachedOwnership = this.ownershipCache.get(content.id);
    if (cachedOwnership && cachedOwnership !== ownership) {
      errors.push(`Ownership mismatch: expected ${ownership}, cached ${cachedOwnership}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      ownership
    };
  }

  /**
   * Check for save conflicts
   * @param {Object} content - Content to check
   * @returns {Promise<Object>} - Conflict check result
   */
  async checkConflicts(content) {
    // Implementation would check for conflicts based on business rules
    // For now, return no conflicts
    return {
      hasConflicts: false,
      conflicts: [],
      suggestedResolution: null
    };
  }

  /**
   * Generate unique operation ID
   * @returns {string} - Unique operation ID
   */
  generateOperationId() {
    return `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current version for metadata
   * @returns {string} - Version string
   */
  getVersion() {
    return '1.0.0';
  }

  /**
   * Get save operation history
   * @param {string} contentId - Content ID to get history for
   * @returns {Array} - Array of save operations
   */
  getSaveHistory(contentId) {
    const operations = [];
    for (const [, operation] of this.saveOperations) {
      if (operation.content.id === contentId) {
        operations.push(operation);
      }
    }
    return operations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Clear cached data
   */
  clearCache() {
    this.ownershipCache.clear();
    this.saveOperations.clear();
  }

  /**
   * Get service status
   * @returns {Object} - Service status
   */
  getStatus() {
    return {
      initialized: !!this.persistenceAdapter,
      cachedOwnershipCount: this.ownershipCache.size,
      activeOperationsCount: this.saveOperations.size
    };
  }
}