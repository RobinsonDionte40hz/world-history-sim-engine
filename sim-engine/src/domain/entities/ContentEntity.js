/**
 * ContentEntity - Abstract base class for all content entities
 * Provides unified save/load interface for both user and demo content
 */

export default class ContentEntity {
  constructor(config = {}) {
    if (new.target === ContentEntity) {
      throw new Error('ContentEntity is an abstract class and cannot be instantiated directly');
    }

    this.id = config.id || this._generateId();
    this.type = config.type || 'content';
    this.name = config.name || 'Unnamed Content';
    this.description = config.description || '';

    // Ownership and permissions
    this.ownership = config.ownership || 'user';
    this.saveFlow = config.saveFlow || null;

    // Metadata
    this.createdAt = config.createdAt || new Date().toISOString();
    this.modifiedAt = config.modifiedAt || new Date().toISOString();
    this.version = config.version || '1.0.0';
    this.tags = Array.isArray(config.tags) ? config.tags : [];

    // Validation
    this.isValid = config.isValid !== false;
    this.validationErrors = Array.isArray(config.validationErrors) ?
      config.validationErrors : [];
  }

  /**
   * Generate unique ID for content entity
   * @private
   */
  _generateId() {
    return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Abstract method: Validate content integrity
   * Must be implemented by subclasses
   * @returns {Object} - Validation result { isValid: boolean, errors: string[] }
   */
  validate() {
    throw new Error('validate() must be implemented by subclass');
  }

  /**
   * Abstract method: Get content size in bytes
   * Must be implemented by subclasses
   * @returns {number} - Size in bytes
   */
  getSize() {
    throw new Error('getSize() must be implemented by subclass');
  }

  /**
   * Abstract method: Create a copy of the content
   * Must be implemented by subclasses
   * @returns {ContentEntity} - Copy of the content
   */
  copy() {
    throw new Error('copy() must be implemented by subclass');
  }

  /**
   * Save content using unified save flow
   * @param {Object} saveService - Save service instance
   * @param {Object} options - Save options
   * @returns {Promise<Object>} - Save result
   */
  async save(saveService, options = {}) {
    // Validate content before saving
    const validation = this.validate();
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Content validation failed',
        details: validation.errors
      };
    }

    // Update modification timestamp
    this.modifiedAt = new Date().toISOString();

    // Prepare content data for saving
    const contentData = {
      id: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      ownership: this.ownership,
      data: this.getSaveData(),
      metadata: this.getMetadata(),
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      version: this.version,
      tags: this.tags
    };

    // Use save service to persist
    return await saveService.save(contentData, {
      ownership: this.ownership,
      ...options
    });
  }

  /**
   * Load content from save data
   * @param {Object} saveData - Saved content data
   * @returns {ContentEntity} - Loaded content instance
   */
  static load(saveData) {
    if (!saveData || !saveData.type) {
      throw new Error('Invalid save data: missing type');
    }

    // This will be overridden by subclasses to create appropriate instances
    throw new Error('load() must be implemented by subclass factory method');
  }

  /**
   * Get data to be saved (to be implemented by subclasses)
   * @returns {Object} - Save data
   */
  getSaveData() {
    return {
      name: this.name,
      description: this.description,
      // Subclasses should override to include their specific data
    };
  }

  /**
   * Get metadata for saving
   * @returns {Object} - Metadata
   */
  getMetadata() {
    return {
      type: this.type,
      ownership: this.ownership,
      version: this.version,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      size: this.getSize(),
      tags: this.tags,
      isValid: this.isValid,
      validationErrors: this.validationErrors
    };
  }

  /**
   * Check if content can be modified
   * @returns {boolean} - Whether content can be modified
   */
  canModify() {
    return this.ownership === 'user';
  }

  /**
   * Check if content can be deleted
   * @returns {boolean} - Whether content can be deleted
   */
  canDelete() {
    return this.ownership === 'user';
  }

  /**
   * Check if content can be copied
   * @returns {boolean} - Whether content can be copied
   */
  canCopy() {
    return true; // All content can be copied
  }

  /**
   * Get summary of content
   * @returns {Object} - Content summary
   */
  getSummary() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      ownership: this.ownership,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      version: this.version,
      size: this.getSize(),
      tags: this.tags,
      isValid: this.isValid,
      canModify: this.canModify(),
      canDelete: this.canDelete(),
      canCopy: this.canCopy()
    };
  }

  /**
   * Update content name
   * @param {string} newName - New name
   * @returns {boolean} - Whether update was successful
   */
  updateName(newName) {
    if (!this.canModify()) {
      return false;
    }

    if (!newName || typeof newName !== 'string' || newName.trim().length === 0) {
      return false;
    }

    this.name = newName.trim();
    this.modifiedAt = new Date().toISOString();
    return true;
  }

  /**
   * Update content description
   * @param {string} newDescription - New description
   * @returns {boolean} - Whether update was successful
   */
  updateDescription(newDescription) {
    if (!this.canModify()) {
      return false;
    }

    this.description = newDescription || '';
    this.modifiedAt = new Date().toISOString();
    return true;
  }

  /**
   * Add tag to content
   * @param {string} tag - Tag to add
   * @returns {boolean} - Whether tag was added
   */
  addTag(tag) {
    if (!this.canModify()) {
      return false;
    }

    if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
      return false;
    }

    const trimmedTag = tag.trim();
    if (!this.tags.includes(trimmedTag)) {
      this.tags.push(trimmedTag);
      this.modifiedAt = new Date().toISOString();
      return true;
    }

    return false;
  }

  /**
   * Remove tag from content
   * @param {string} tag - Tag to remove
   * @returns {boolean} - Whether tag was removed
   */
  removeTag(tag) {
    if (!this.canModify()) {
      return false;
    }

    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
      this.modifiedAt = new Date().toISOString();
      return true;
    }

    return false;
  }

  /**
   * Convert to JSON for persistence
   * @returns {Object} - JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      ownership: this.ownership,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      version: this.version,
      tags: this.tags,
      isValid: this.isValid,
      validationErrors: this.validationErrors,
      data: this.getSaveData()
    };
  }

  /**
   * Create from JSON data
   * @param {Object} data - JSON data
   * @returns {ContentEntity} - Content entity instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for ContentEntity');
    }

    // This should be overridden by subclasses
    return this.load(data);
  }
}