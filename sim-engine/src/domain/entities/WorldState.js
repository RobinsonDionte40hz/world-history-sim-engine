/**
 * WorldState - Core world state management entity
 * Manages world configuration, validation, and conversion to simulation format
 * Integrates with WorldValidator and TemplateManager for comprehensive world management
 */

import WorldValidator from '../services/WorldValidator.js';

class WorldState {
  constructor(config = {}) {
    this.id = config.id || this._generateId();
    this.name = config.name || 'Untitled World';
    this.description = config.description || '';
    
    // Core world configuration
    this.dimensions = config.dimensions || null;
    this.rules = config.rules || null;
    this.initialConditions = config.initialConditions || null;
    
    // World content
    this.nodes = config.nodes || [];
    this.characters = config.characters || [];
    this.interactions = config.interactions || [];
    this.events = config.events || [];
    this.groups = config.groups || [];
    this.items = config.items || [];
    
    // State tracking
    this.isValid = false;
    this.validationResult = null;
    this.completeness = 0;
    
    // Metadata
    this.createdAt = config.createdAt || new Date();
    this.modifiedAt = config.modifiedAt || new Date();
    this.version = config.version || '1.0.0';
    this.metadata = config.metadata || {};
    
    // Template integration
    this.templateId = config.templateId || null;
    this.isTemplateInstance = config.isTemplateInstance || false;
    
    // Perform initial validation
    this.validate();
  }

  /**
   * Validates the current world state using WorldValidator
   * Updates isValid, validationResult, and completeness properties
   * @returns {Object} Validation result
   */
  validate() {
    try {
      this.validationResult = WorldValidator.validate(this._getValidationConfig());
      this.isValid = this.validationResult.isValid;
      this.completeness = this.validationResult.completeness;
      this.modifiedAt = new Date();
      
      return this.validationResult;
    } catch (error) {
      console.error('WorldState.validate: Error during validation:', error);
      this.validationResult = {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        warnings: [],
        completeness: 0,
        details: {}
      };
      this.isValid = false;
      this.completeness = 0;
      return this.validationResult;
    }
  }

  /**
   * Converts the world state to simulation configuration format
   * Only works if the world state is valid
   * @returns {Object} Simulation configuration
   * @throws {Error} If world state is invalid
   */
  toSimulationConfig() {
    if (!this.isValid) {
      throw new Error('Cannot convert invalid world to simulation config. Validation errors: ' + 
        (this.validationResult?.errors?.join(', ') || 'Unknown validation errors'));
    }
    
    try {
      return {
        // Basic simulation parameters
        size: this.dimensions,
        nodeCount: this.nodes.length,
        characterCount: this.characters.length,
        
        // Resource configuration
        resourceTypes: this.initialConditions?.resourceTypes || [],
        startingResources: this.initialConditions?.startingResources || {},
        
        // Custom content from world builder
        customNodes: this.nodes.map(node => this._serializeForSimulation(node)),
        customCharacters: this.characters.map(character => this._serializeForSimulation(character)),
        customInteractions: this.interactions.map(interaction => this._serializeForSimulation(interaction)),
        customEvents: this.events.map(event => this._serializeForSimulation(event)),
        customGroups: this.groups.map(group => this._serializeForSimulation(group)),
        customItems: this.items.map(item => this._serializeForSimulation(item)),
        
        // Rules and conditions
        rules: this.rules || {},
        initialConditions: this.initialConditions || {},
        
        // Simulation timing
        timeScale: this.initialConditions?.timeScale || 1,
        tickDelay: this.rules?.tickDelay || 1000,
        
        // Metadata for simulation
        worldId: this.id,
        worldName: this.name,
        worldVersion: this.version
      };
    } catch (error) {
      throw new Error(`Failed to convert world to simulation config: ${error.message}`);
    }
  }

  /**
   * Updates world dimensions
   * @param {Object} dimensions - New dimensions configuration
   * @returns {WorldState} This instance for chaining
   */
  updateDimensions(dimensions) {
    if (!dimensions || typeof dimensions !== 'object') {
      throw new Error('Dimensions must be an object');
    }
    
    this.dimensions = { ...dimensions };
    this.modifiedAt = new Date();
    this.validate();
    return this;
  }

  /**
   * Updates world rules
   * @param {Object} rules - New rules configuration
   * @returns {WorldState} This instance for chaining
   */
  updateRules(rules) {
    if (!rules || typeof rules !== 'object') {
      throw new Error('Rules must be an object');
    }
    
    this.rules = { ...rules };
    this.modifiedAt = new Date();
    this.validate();
    return this;
  }

  /**
   * Updates initial conditions
   * @param {Object} initialConditions - New initial conditions
   * @returns {WorldState} This instance for chaining
   */
  updateInitialConditions(initialConditions) {
    if (!initialConditions || typeof initialConditions !== 'object') {
      throw new Error('Initial conditions must be an object');
    }
    
    this.initialConditions = { ...initialConditions };
    this.modifiedAt = new Date();
    this.validate();
    return this;
  }

  /**
   * Adds content to the world
   * @param {string} type - Content type (nodes, characters, interactions, events, groups, items)
   * @param {Object} content - Content to add
   * @returns {WorldState} This instance for chaining
   */
  addContent(type, content) {
    const validTypes = ['nodes', 'characters', 'interactions', 'events', 'groups', 'items'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid content type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
    
    if (!content || typeof content !== 'object') {
      throw new Error('Content must be an object');
    }
    
    // Ensure content has an ID
    if (!content.id) {
      content.id = this._generateId(type.slice(0, -1)); // Remove 's' from plural
    }
    
    this[type].push(content);
    this.modifiedAt = new Date();
    this.validate();
    return this;
  }

  /**
   * Removes content from the world
   * @param {string} type - Content type
   * @param {string} id - Content ID to remove
   * @returns {boolean} True if content was removed
   */
  removeContent(type, id) {
    const validTypes = ['nodes', 'characters', 'interactions', 'events', 'groups', 'items'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid content type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
    
    const index = this[type].findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }
    
    this[type].splice(index, 1);
    this.modifiedAt = new Date();
    this.validate();
    return true;
  }

  /**
   * Updates existing content in the world
   * @param {string} type - Content type
   * @param {string} id - Content ID to update
   * @param {Object} updates - Updates to apply
   * @returns {boolean} True if content was updated
   */
  updateContent(type, id, updates) {
    const validTypes = ['nodes', 'characters', 'interactions', 'events', 'groups', 'items'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid content type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
    
    const index = this[type].findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }
    
    this[type][index] = { ...this[type][index], ...updates };
    this.modifiedAt = new Date();
    this.validate();
    return true;
  }

  /**
   * Gets content by type and optionally by ID
   * @param {string} type - Content type
   * @param {string} [id] - Optional content ID
   * @returns {Array|Object|null} Content array, specific content, or null
   */
  getContent(type, id = null) {
    const validTypes = ['nodes', 'characters', 'interactions', 'events', 'groups', 'items'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid content type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
    
    if (id) {
      return this[type].find(item => item.id === id) || null;
    }
    
    return [...this[type]]; // Return copy to prevent external modification
  }

  /**
   * Gets a summary of the world state
   * @returns {Object} World state summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isValid: this.isValid,
      completeness: Math.round(this.completeness * 100),
      contentCounts: {
        nodes: this.nodes.length,
        characters: this.characters.length,
        interactions: this.interactions.length,
        events: this.events.length,
        groups: this.groups.length,
        items: this.items.length
      },
      hasDimensions: !!this.dimensions,
      hasRules: !!this.rules,
      hasInitialConditions: !!this.initialConditions,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      version: this.version
    };
  }

  /**
   * Serializes the world state to JSON
   * @returns {Object} Serializable world state
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      dimensions: this.dimensions,
      rules: this.rules,
      initialConditions: this.initialConditions,
      nodes: this.nodes.map(node => this._serializeContent(node)),
      characters: this.characters.map(character => this._serializeContent(character)),
      interactions: this.interactions.map(interaction => this._serializeContent(interaction)),
      events: this.events.map(event => this._serializeContent(event)),
      groups: this.groups.map(group => this._serializeContent(group)),
      items: this.items.map(item => this._serializeContent(item)),
      isValid: this.isValid,
      validationResult: this.validationResult,
      completeness: this.completeness,
      createdAt: this.createdAt.toISOString(),
      modifiedAt: this.modifiedAt.toISOString(),
      version: this.version,
      metadata: this.metadata,
      templateId: this.templateId,
      isTemplateInstance: this.isTemplateInstance
    };
  }

  /**
   * Creates a WorldState instance from JSON data
   * @param {Object} data - JSON data
   * @returns {WorldState} New WorldState instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for WorldState');
    }
    
    const config = {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      modifiedAt: data.modifiedAt ? new Date(data.modifiedAt) : new Date()
    };
    
    return new WorldState(config);
  }

  /**
   * Creates a deep copy of the world state
   * @returns {WorldState} New WorldState instance
   */
  clone() {
    const jsonData = this.toJSON();
    jsonData.id = this._generateId(); // Generate new ID for clone
    jsonData.name = `${this.name} (Copy)`;
    jsonData.createdAt = new Date().toISOString();
    jsonData.modifiedAt = new Date().toISOString();
    
    return WorldState.fromJSON(jsonData);
  }

  // Template Persistence Features

  /**
   * Converts the world state to a template format
   * @param {string} templateName - Name for the template
   * @param {string} templateDescription - Description for the template
   * @param {Array} [tags] - Optional tags for the template
   * @returns {Object} World template object
   */
  toTemplate(templateName, templateDescription, tags = []) {
    if (!templateName || typeof templateName !== 'string') {
      throw new Error('Template name is required and must be a string');
    }
    
    if (!templateDescription || typeof templateDescription !== 'string') {
      throw new Error('Template description is required and must be a string');
    }

    const template = {
      id: `world_template_${templateName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      name: templateName,
      description: templateDescription,
      type: 'world',
      version: '1.0.0',
      tags: ['world', 'custom', ...tags],
      
      // World configuration data
      worldConfig: {
        dimensions: this.dimensions,
        rules: this.rules,
        initialConditions: this.initialConditions,
        nodes: this.nodes.map(node => this._serializeContent(node)),
        characters: this.characters.map(character => this._serializeContent(character)),
        interactions: this.interactions.map(interaction => this._serializeContent(interaction)),
        events: this.events.map(event => this._serializeContent(event)),
        groups: this.groups.map(group => this._serializeContent(group)),
        items: this.items.map(item => this._serializeContent(item))
      },
      
      // Template metadata
      metadata: {
        originalWorldId: this.id,
        originalWorldName: this.name,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        author: 'User',
        completeness: this.completeness,
        isValid: this.isValid,
        contentCounts: {
          nodes: this.nodes.length,
          characters: this.characters.length,
          interactions: this.interactions.length,
          events: this.events.length,
          groups: this.groups.length,
          items: this.items.length
        }
      },
      
      // Template customization options
      customizationOptions: {
        allowDimensionChanges: true,
        allowRuleModifications: true,
        allowContentAddition: true,
        allowContentRemoval: true,
        preserveRelationships: true
      }
    };

    return template;
  }

  /**
   * Creates a WorldState from a world template
   * @param {Object} template - World template object
   * @param {Object} [customizations] - Optional customizations to apply
   * @returns {WorldState} New WorldState instance
   */
  static fromTemplate(template, customizations = {}) {
    if (!template || typeof template !== 'object') {
      throw new Error('Template must be an object');
    }
    
    if (!template.worldConfig) {
      throw new Error('Template must contain worldConfig');
    }

    // Start with the template's world configuration
    let config = {
      id: customizations.id || this.prototype._generateId(),
      name: customizations.name || template.name || 'Untitled World',
      description: customizations.description || template.description || '',
      templateId: template.id,
      isTemplateInstance: true,
      ...template.worldConfig
    };

    // Apply customizations
    if (customizations.dimensions && template.customizationOptions?.allowDimensionChanges !== false) {
      config.dimensions = { ...config.dimensions, ...customizations.dimensions };
    }

    if (customizations.rules && template.customizationOptions?.allowRuleModifications !== false) {
      config.rules = { ...config.rules, ...customizations.rules };
    }

    if (customizations.initialConditions) {
      config.initialConditions = { ...config.initialConditions, ...customizations.initialConditions };
    }

    // Apply content customizations
    const contentTypes = ['nodes', 'characters', 'interactions', 'events', 'groups', 'items'];
    contentTypes.forEach(type => {
      if (customizations[type]) {
        if (customizations[type].replace && template.customizationOptions?.allowContentRemoval !== false) {
          // Replace all content of this type
          config[type] = customizations[type].replace;
        } else {
          // Add to existing content
          if (customizations[type].add && template.customizationOptions?.allowContentAddition !== false) {
            config[type] = [...(config[type] || []), ...customizations[type].add];
          }
          
          // Remove specific content
          if (customizations[type].remove && template.customizationOptions?.allowContentRemoval !== false) {
            const removeIds = new Set(customizations[type].remove);
            config[type] = (config[type] || []).filter(item => !removeIds.has(item.id));
          }
          
          // Update specific content
          if (customizations[type].update) {
            config[type] = (config[type] || []).map(item => {
              const update = customizations[type].update.find(u => u.id === item.id);
              return update ? { ...item, ...update.changes } : item;
            });
          }
        }
      }
    });

    return new WorldState(config);
  }

  /**
   * Saves the world state as a template using a TemplateManager
   * @param {Object} templateManager - TemplateManager instance
   * @param {string} templateName - Name for the template
   * @param {string} templateDescription - Description for the template
   * @param {Array} [tags] - Optional tags for the template
   * @returns {Object} Created template
   */
  saveAsTemplate(templateManager, templateName, templateDescription, tags = []) {
    if (!templateManager) {
      throw new Error('TemplateManager is required');
    }

    const template = this.toTemplate(templateName, templateDescription, tags);
    
    try {
      templateManager.addTemplate('worlds', template);
      return template;
    } catch (error) {
      throw new Error(`Failed to save world as template: ${error.message}`);
    }
  }

  /**
   * Loads a world from a template using a TemplateManager
   * @param {Object} templateManager - TemplateManager instance
   * @param {string} templateId - Template ID to load
   * @param {Object} [customizations] - Optional customizations to apply
   * @returns {WorldState} New WorldState instance
   */
  static loadFromTemplate(templateManager, templateId, customizations = {}) {
    if (!templateManager) {
      throw new Error('TemplateManager is required');
    }

    const template = templateManager.getTemplate('worlds', templateId);
    if (!template) {
      throw new Error(`World template not found: ${templateId}`);
    }

    return WorldState.fromTemplate(template, customizations);
  }

  /**
   * Creates individual content templates from world content
   * @param {Object} templateManager - TemplateManager instance
   * @param {string} contentType - Type of content to create templates from
   * @param {string} templateNamePrefix - Prefix for template names
   * @param {string} templateDescription - Description for templates
   * @returns {Array} Array of created templates
   */
  createContentTemplates(templateManager, contentType, templateNamePrefix, templateDescription) {
    const validTypes = ['nodes', 'characters', 'interactions', 'events', 'groups', 'items'];
    if (!validTypes.includes(contentType)) {
      throw new Error(`Invalid content type: ${contentType}. Must be one of: ${validTypes.join(', ')}`);
    }

    if (!templateManager) {
      throw new Error('TemplateManager is required');
    }

    const content = this[contentType];
    if (!content || content.length === 0) {
      throw new Error(`No ${contentType} content to create templates from`);
    }

    const templates = content.map((item, index) => {
      const templateId = `${templateNamePrefix}_${contentType}_${index}_${Date.now()}`;
      const serializedContent = this._serializeContent(item);
      
      const template = {
        // Content data first
        ...serializedContent,
        
        // Template properties (only override if not already present in content)
        id: templateId,
        description: `${templateDescription} - ${contentType} template`,
        type: contentType.slice(0, -1), // Remove 's' from plural
        version: '1.0.0',
        tags: [contentType.slice(0, -1), 'custom', 'world-generated'],
        
        // Template metadata
        metadata: {
          sourceWorldId: this.id,
          sourceWorldName: this.name,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          author: 'User'
        }
      };
      
      // Only set template name if content doesn't have a name
      if (!serializedContent.name) {
        template.name = `${templateNamePrefix} ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} ${index + 1}`;
      }

      try {
        templateManager.addTemplate(contentType, template);
        return template;
      } catch (error) {
        console.error(`Failed to create template for ${contentType} item:`, error);
        return null;
      }
    }).filter(template => template !== null);

    return templates;
  }

  /**
   * Serializes the world state for persistent storage
   * @param {boolean} [includeMetadata=true] - Whether to include metadata
   * @returns {Object} Serialized world state
   */
  serialize(includeMetadata = true) {
    const serialized = {
      id: this.id,
      name: this.name,
      description: this.description,
      dimensions: this.dimensions,
      rules: this.rules,
      initialConditions: this.initialConditions,
      nodes: this.nodes.map(node => this._serializeContent(node)),
      characters: this.characters.map(character => this._serializeContent(character)),
      interactions: this.interactions.map(interaction => this._serializeContent(interaction)),
      events: this.events.map(event => this._serializeContent(event)),
      groups: this.groups.map(group => this._serializeContent(group)),
      items: this.items.map(item => this._serializeContent(item)),
      version: this.version,
      templateId: this.templateId,
      isTemplateInstance: this.isTemplateInstance
    };

    if (includeMetadata) {
      serialized.metadata = {
        ...this.metadata,
        isValid: this.isValid,
        completeness: this.completeness,
        validationResult: this.validationResult,
        createdAt: this.createdAt.toISOString(),
        modifiedAt: this.modifiedAt.toISOString()
      };
    }

    return serialized;
  }

  /**
   * Deserializes world state from persistent storage
   * @param {Object} data - Serialized world state data
   * @returns {WorldState} New WorldState instance
   */
  static deserialize(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid serialized data for WorldState');
    }

    const config = {
      ...data,
      createdAt: data.metadata?.createdAt ? new Date(data.metadata.createdAt) : new Date(),
      modifiedAt: data.metadata?.modifiedAt ? new Date(data.metadata.modifiedAt) : new Date(),
      metadata: data.metadata || {}
    };

    // Remove the nested metadata to avoid duplication
    delete config.metadata.createdAt;
    delete config.metadata.modifiedAt;
    delete config.metadata.isValid;
    delete config.metadata.completeness;
    delete config.metadata.validationResult;

    return new WorldState(config);
  }

  /**
   * Exports the world state to a portable format
   * @param {Object} [options] - Export options
   * @returns {Object} Exportable world state
   */
  export(options = {}) {
    const exportData = {
      format: 'WorldState',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      worldState: this.serialize(options.includeMetadata !== false)
    };

    if (options.includeValidation) {
      exportData.validation = this.validationResult;
    }

    if (options.includeTemplateInfo && this.templateId) {
      exportData.templateInfo = {
        templateId: this.templateId,
        isTemplateInstance: this.isTemplateInstance
      };
    }

    return exportData;
  }

  /**
   * Imports a world state from exported data
   * @param {Object} exportData - Exported world state data
   * @returns {WorldState} New WorldState instance
   */
  static import(exportData) {
    if (!exportData || typeof exportData !== 'object') {
      throw new Error('Invalid export data');
    }

    if (exportData.format !== 'WorldState') {
      throw new Error('Invalid export format. Expected WorldState format.');
    }

    if (!exportData.worldState) {
      throw new Error('Export data missing worldState');
    }

    return WorldState.deserialize(exportData.worldState);
  }

  // Private helper methods

  /**
   * Generates a unique ID
   * @param {string} [prefix='world'] - ID prefix
   * @returns {string} Generated ID
   */
  _generateId(prefix = 'world') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Gets configuration object for validation
   * @returns {Object} Configuration for WorldValidator
   */
  _getValidationConfig() {
    return {
      dimensions: this.dimensions,
      rules: this.rules,
      initialConditions: this.initialConditions,
      nodes: this.nodes,
      characters: this.characters,
      interactions: this.interactions,
      events: this.events,
      groups: this.groups,
      items: this.items
    };
  }

  /**
   * Serializes content for simulation use
   * @param {Object} content - Content to serialize
   * @returns {Object} Serialized content
   */
  _serializeForSimulation(content) {
    if (!content) return null;
    
    // If content has a toJSON method, use it
    if (typeof content.toJSON === 'function') {
      return content.toJSON();
    }
    
    // Otherwise, create a clean copy
    return this._serializeContent(content);
  }

  /**
   * Serializes content for JSON storage
   * @param {Object} content - Content to serialize
   * @returns {Object} Serialized content
   */
  _serializeContent(content) {
    if (!content) return null;
    
    // Handle objects with toJSON method
    if (typeof content.toJSON === 'function') {
      return content.toJSON();
    }
    
    // Handle plain objects
    if (typeof content === 'object') {
      const serialized = {};
      for (const [key, value] of Object.entries(content)) {
        if (value instanceof Date) {
          serialized[key] = value.toISOString();
        } else if (typeof value === 'object' && value !== null) {
          serialized[key] = this._serializeContent(value);
        } else {
          serialized[key] = value;
        }
      }
      return serialized;
    }
    
    return content;
  }
}

export default WorldState;