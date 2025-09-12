/**
 * DemoWorld - Demo content wrapper that inherits from ContentEntity
 * Provides demo-specific behavior while maintaining unified save/load interface
 * Wraps world data with ownership restrictions and demo-specific features
 */

import ContentEntity from './ContentEntity.js';

export default class DemoWorld extends ContentEntity {
  constructor(config = {}) {
    super({
      ...config,
      type: 'demo-world',
      ownership: 'demo' // Always demo ownership
    });

    // Demo-specific properties
    this.demoId = config.demoId || this._generateDemoId();
    this.category = config.category || 'tutorial';
    this.difficulty = config.difficulty || 'beginner';
    this.estimatedDuration = config.estimatedDuration || 15; // minutes
    this.learningObjectives = Array.isArray(config.learningObjectives) ?
      config.learningObjectives : [];

    // World data (can be WorldState or plain object)
    this.worldData = config.worldData || this._createDefaultWorldData();

    // Demo restrictions and features
    this.allowedModifications = config.allowedModifications || ['read', 'copy'];
    this.demoFeatures = config.demoFeatures || ['guided-tour', 'hints'];
    this.completionCriteria = config.completionCriteria || [];

    // Progress tracking
    this.isCompleted = config.isCompleted || false;
    this.progress = config.progress || 0;
    this.stepsCompleted = Array.isArray(config.stepsCompleted) ?
      config.stepsCompleted : [];
  }

  /**
   * Generate unique demo ID
   * @private
   */
  _generateDemoId() {
    return `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create default world data for demo
   * @private
   */
  _createDefaultWorldData() {
    return {
      name: 'Demo World',
      description: 'A sample world for demonstration purposes',
      nodes: [
        {
          id: 'demo-node-1',
          name: 'Starting Village',
          type: 'settlement',
          description: 'A peaceful village where your journey begins'
        }
      ],
      characters: [
        {
          id: 'demo-char-1',
          name: 'Demo Hero',
          type: 'protagonist',
          description: 'A brave adventurer learning the world'
        }
      ],
      interactions: [],
      events: []
    };
  }

  /**
   * Validate demo world content
   * @returns {Object} - Validation result
   */
  validate() {
    const errors = [];

    // Basic validation (don't call super.validate() as it's abstract)
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    // Demo-specific validation
    if (!this.demoId) {
      errors.push('Demo ID is required');
    }

    if (!['tutorial', 'showcase', 'challenge'].includes(this.category)) {
      errors.push('Category must be tutorial, showcase, or challenge');
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(this.difficulty)) {
      errors.push('Difficulty must be beginner, intermediate, or advanced');
    }

    if (this.estimatedDuration <= 0) {
      errors.push('Estimated duration must be positive');
    }

    if (!this.worldData || typeof this.worldData !== 'object') {
      errors.push('World data is required');
    }

    this.isValid = errors.length === 0;
    this.validationErrors = errors;

    return {
      isValid: this.isValid,
      errors
    };
  }

  /**
   * Get content size including world data
   * @returns {number} - Size in bytes
   */
  getSize() {
    // Calculate size of demo-specific data
    const baseData = {
      name: this.name,
      description: this.description
    };
    const baseSize = JSON.stringify(baseData).length;
    const worldDataSize = JSON.stringify(this.worldData).length;
    const demoDataSize = JSON.stringify({
      demoId: this.demoId,
      category: this.category,
      difficulty: this.difficulty,
      learningObjectives: this.learningObjectives,
      progress: this.progress,
      stepsCompleted: this.stepsCompleted
    }).length;

    return baseSize + worldDataSize + demoDataSize;
  }

  /**
   * Create a copy of the demo world (Save As New)
   * @returns {ContentEntity} - Copy of the demo world as user content
   */
  copy() {
    // For demo content, copying creates user-owned content
    // We'll create a simplified ContentEntity-like object
    const copyData = {
      id: this._generateId(),
      type: 'world',
      name: `${this.name} (Copy)`,
      description: `${this.description} - Copied from demo`,
      ownership: 'user',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      version: this.version,
      tags: [...this.tags, 'copied-from-demo'],
      data: {
        ...this.worldData,
        originalDemoId: this.demoId
      }
    };

    // Return a plain object that can be used with ContentEntity.load()
    return copyData;
  }

  /**
   * Check if modification is allowed for demo content
   * @param {string} modificationType - Type of modification
   * @returns {boolean} - Whether modification is allowed
   */
  canModify(modificationType = 'general') {
    // Demo content has restricted modifications
    if (modificationType === 'general') {
      return this.allowedModifications.includes('modify');
    }
    return this.allowedModifications.includes(modificationType);
  }

  /**
   * Check if deletion is allowed (demo content cannot be deleted)
   * @returns {boolean} - Always false for demo content
   */
  canDelete() {
    return false; // Demo content cannot be deleted
  }

  /**
   * Get demo-specific save data
   * @returns {Object} - Save data
   */
  getSaveData() {
    return {
      ...super.getSaveData(),
      demoId: this.demoId,
      category: this.category,
      difficulty: this.difficulty,
      estimatedDuration: this.estimatedDuration,
      learningObjectives: this.learningObjectives,
      worldData: this.worldData,
      allowedModifications: this.allowedModifications,
      demoFeatures: this.demoFeatures,
      completionCriteria: this.completionCriteria,
      isCompleted: this.isCompleted,
      progress: this.progress,
      stepsCompleted: this.stepsCompleted
    };
  }

  /**
   * Get demo world summary
   * @returns {Object} - Summary data
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
      canCopy: this.canCopy(),
      demoId: this.demoId,
      category: this.category,
      difficulty: this.difficulty,
      estimatedDuration: this.estimatedDuration,
      progress: this.progress,
      isCompleted: this.isCompleted,
      learningObjectives: this.learningObjectives,
      demoFeatures: this.demoFeatures
    };
  }

  /**
   * Update demo progress
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} step - Completed step (optional)
   * @returns {boolean} - Whether update was successful
   */
  updateProgress(progress, step = null) {
    if (progress < 0 || progress > 100) {
      return false;
    }

    this.progress = progress;
    this.modifiedAt = new Date().toISOString();

    if (step && !this.stepsCompleted.includes(step)) {
      this.stepsCompleted.push(step);
    }

    // Check completion criteria
    this._checkCompletion();

    return true;
  }

  /**
   * Mark demo as completed
   * @returns {boolean} - Whether completion was successful
   */
  completeDemo() {
    if (this.isCompleted) {
      return false; // Already completed
    }

    this.isCompleted = true;
    this.progress = 100;
    this.modifiedAt = new Date().toISOString();

    return true;
  }

  /**
   * Check if completion criteria are met
   * @private
   */
  _checkCompletion() {
    if (this.isCompleted) {
      return;
    }

    // Simple completion check: 100% progress
    if (this.progress >= 100) {
      this.isCompleted = true;
    }
  }

  /**
   * Get learning progress
   * @returns {Object} - Progress information
   */
  getLearningProgress() {
    return {
      progress: this.progress,
      isCompleted: this.isCompleted,
      stepsCompleted: this.stepsCompleted,
      totalSteps: this.completionCriteria.length,
      estimatedDuration: this.estimatedDuration,
      learningObjectives: this.learningObjectives
    };
  }

  /**
   * Convert to JSON for persistence
   * @returns {Object} - JSON representation
   */
  toJSON() {
    return {
      ...super.toJSON(),
      demoId: this.demoId,
      category: this.category,
      difficulty: this.difficulty,
      estimatedDuration: this.estimatedDuration,
      learningObjectives: this.learningObjectives,
      worldData: this.worldData,
      allowedModifications: this.allowedModifications,
      demoFeatures: this.demoFeatures,
      completionCriteria: this.completionCriteria,
      isCompleted: this.isCompleted,
      progress: this.progress,
      stepsCompleted: this.stepsCompleted
    };
  }

  /**
   * Create from JSON data
   * @param {Object} data - JSON data
   * @returns {DemoWorld} - DemoWorld instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for DemoWorld');
    }

    return new DemoWorld(data);
  }

  /**
   * Load demo world from save data
   * @param {Object} saveData - Saved content data
   * @returns {DemoWorld} - DemoWorld instance
   */
  static load(saveData) {
    return new DemoWorld(saveData);
  }

  /**
   * Create tutorial demo world
   * @param {Object} config - Configuration options
   * @returns {DemoWorld} - Tutorial demo world
   */
  static createTutorial(config = {}) {
    return new DemoWorld({
      name: 'World Building Tutorial',
      description: 'Learn the basics of world building',
      category: 'tutorial',
      difficulty: 'beginner',
      estimatedDuration: 10,
      learningObjectives: [
        'Understand world structure',
        'Create basic nodes',
        'Add characters',
        'Set up interactions'
      ],
      completionCriteria: ['create-node', 'add-character', 'setup-interaction'],
      demoFeatures: ['guided-tour', 'hints', 'step-by-step'],
      ...config
    });
  }

  /**
   * Create showcase demo world
   * @param {Object} config - Configuration options
   * @returns {DemoWorld} - Showcase demo world
   */
  static createShowcase(config = {}) {
    return new DemoWorld({
      name: 'Advanced World Showcase',
      description: 'Explore advanced world building features',
      category: 'showcase',
      difficulty: 'intermediate',
      estimatedDuration: 20,
      learningObjectives: [
        'Advanced node relationships',
        'Complex character interactions',
        'Event-driven storytelling'
      ],
      completionCriteria: ['explore-features', 'create-scenario'],
      demoFeatures: ['interactive-tour', 'examples'],
      ...config
    });
  }
}