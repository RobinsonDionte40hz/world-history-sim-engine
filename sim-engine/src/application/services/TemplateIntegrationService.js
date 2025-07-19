/**
 * TemplateIntegrationService - Service for six-step world building with template integration
 * 
 * Creates content from templates with customizations for all component types.
 * Implements template customization application logic for world, node, interaction, character templates.
 * Adds methods to save world content as new templates (individual components and complete worlds).
 * Connects to existing TemplateManager and adds support for composite templates and role sets.
 * Adds template dependency validation and resolution for mappless world components.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */

class TemplateIntegrationService {
  constructor(templateManager) {
    this.templateManager = templateManager;
    this.customizationHistory = new Map(); // Track applied customizations
    this.templateDependencies = new Map(); // Track template dependencies
  }

  /**
   * Creates world content from template with customizations
   * @param {string} templateId - Template identifier
   * @param {Object} customizations - Customization overrides
   * @param {string} contentType - Type of content (world, node, interaction, character, composite)
   * @returns {Object} Created content with applied customizations
   */
  async createFromTemplate(templateId, customizations = {}, contentType) {
    try {
      // Get template from manager
      const template = await this.templateManager.getTemplate(templateId, contentType);
      if (!template) {
        throw new Error(`Template '${templateId}' not found for type '${contentType}'`);
      }

      // Validate template dependencies
      await this.validateTemplateDependencies(template, contentType);

      // Apply customizations based on content type
      let customizedContent;
      switch (contentType) {
        case 'world':
          customizedContent = this.createWorldFromTemplate(template, customizations);
          break;
        case 'node':
          customizedContent = this.createNodeFromTemplate(template, customizations);
          break;
        case 'interaction':
          customizedContent = this.createInteractionFromTemplate(template, customizations);
          break;
        case 'character':
          customizedContent = this.createCharacterFromTemplate(template, customizations);
          break;
        case 'composite':
          customizedContent = await this.createCompositeFromTemplate(template, customizations);
          break;
        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }

      // Track customization history
      this.trackCustomization(templateId, contentType, customizations, customizedContent.id);

      return customizedContent;
    } catch (error) {
      throw new Error(`Failed to create content from template: ${error.message}`);
    }
  }

  /**
   * Creates world content from world template
   * @param {Object} template - World template
   * @param {Object} customizations - World customizations
   * @returns {Object} Customized world configuration
   */
  createWorldFromTemplate(template, customizations) {
    const worldConfig = {
      id: this.generateId(),
      templateId: template.id,
      isTemplateInstance: true,
      
      // Apply basic properties with customizations
      name: customizations.name || template.name || 'Untitled World',
      description: customizations.description || template.description || '',
      
      // Apply rules with deep merge
      rules: this.mergeObjects(template.rules || {}, customizations.rules || {}),
      
      // Apply initial conditions with deep merge
      initialConditions: this.mergeObjects(template.initialConditions || {}, customizations.initialConditions || {}),
      
      // Initialize empty collections (will be populated through six-step process)
      nodes: [],
      interactions: [],
      characters: [],
      nodePopulations: {},
      
      // Metadata
      createdAt: new Date(),
      modifiedAt: new Date(),
      version: '1.0.0'
    };

    // Apply any additional customizations
    if (customizations.metadata) {
      worldConfig.metadata = { ...template.metadata, ...customizations.metadata };
    }

    return worldConfig;
  }

  /**
   * Creates node content from node template (mappless - no coordinates)
   * @param {Object} template - Node template
   * @param {Object} customizations - Node customizations
   * @returns {Object} Customized node configuration
   */
  createNodeFromTemplate(template, customizations) {
    const nodeConfig = {
      id: customizations.id || this.generateId(),
      templateId: template.id,
      isTemplateInstance: true,
      
      // Apply basic properties
      name: customizations.name || template.name || 'Untitled Node',
      type: customizations.type || template.type || 'settlement',
      description: customizations.description || template.description || '',
      
      // Apply environmental properties (mappless - no coordinates)
      environment: this.mergeObjects(template.environment || {}, customizations.environment || {}),
      
      // Apply resources
      resources: customizations.resources || template.resources || [],
      
      // Apply capacity
      capacity: customizations.capacity !== undefined ? customizations.capacity : template.capacity,
      
      // Apply special properties
      specialProperties: this.mergeObjects(template.specialProperties || {}, customizations.specialProperties || {}),
      
      // Metadata
      createdAt: new Date()
    };

    return nodeConfig;
  }

  /**
   * Creates interaction content from interaction template (character capabilities)
   * @param {Object} template - Interaction template
   * @param {Object} customizations - Interaction customizations
   * @returns {Object} Customized interaction configuration
   */
  createInteractionFromTemplate(template, customizations) {
    const interactionConfig = {
      id: customizations.id || this.generateId(),
      templateId: template.id,
      isTemplateInstance: true,
      
      // Apply basic properties
      name: customizations.name || template.name || 'Untitled Interaction',
      type: customizations.type || template.type || 'social',
      category: customizations.category || template.category || 'social',
      description: customizations.description || template.description || '',
      
      // Apply capability requirements
      requirements: this.mergeObjects(template.requirements || {}, customizations.requirements || {}),
      
      // Apply effects
      effects: this.mergeObjects(template.effects || {}, customizations.effects || {}),
      
      // Apply conditions
      conditions: this.mergeObjects(template.conditions || {}, customizations.conditions || {}),
      
      // Apply modifiers
      modifiers: this.mergeObjects(template.modifiers || {}, customizations.modifiers || {}),
      
      // Metadata
      createdAt: new Date()
    };

    return interactionConfig;
  }

  /**
   * Creates character content from character template with capability assignment
   * @param {Object} template - Character template
   * @param {Object} customizations - Character customizations
   * @returns {Object} Customized character configuration
   */
  createCharacterFromTemplate(template, customizations) {
    const characterConfig = {
      id: customizations.id || this.generateId(),
      templateId: template.id,
      isTemplateInstance: true,
      
      // Apply basic properties
      name: customizations.name || template.name || 'Untitled Character',
      description: customizations.description || template.description || '',
      
      // Apply attributes with deep merge
      attributes: this.mergeObjects(template.attributes || {}, customizations.attributes || {}),
      
      // Apply personality profile
      personality: this.mergeObjects(template.personality || {}, customizations.personality || {}),
      
      // Apply capabilities (assigned interactions)
      capabilities: customizations.capabilities || template.capabilities || [],
      
      // Apply background and history
      background: customizations.background || template.background || '',
      history: customizations.history || template.history || [],
      
      // Apply relationships
      relationships: customizations.relationships || template.relationships || [],
      
      // Apply goals and motivations
      goals: customizations.goals || template.goals || [],
      motivations: this.mergeObjects(template.motivations || {}, customizations.motivations || {}),
      
      // Metadata
      createdAt: new Date()
    };

    return characterConfig;
  }

  /**
   * Creates composite content from composite template (multiple component types)
   * @param {Object} template - Composite template
   * @param {Object} customizations - Composite customizations
   * @returns {Object} Customized composite configuration
   */
  async createCompositeFromTemplate(template, customizations) {
    const compositeConfig = {
      id: this.generateId(),
      templateId: template.id,
      isTemplateInstance: true,
      type: 'composite',
      name: customizations.name || template.name || 'Untitled Composite',
      components: {},
      
      // Metadata
      createdAt: new Date()
    };

    // Process each component type in the composite
    if (template.components) {
      for (const [componentType, componentTemplates] of Object.entries(template.components)) {
        compositeConfig.components[componentType] = [];
        
        for (const componentTemplate of componentTemplates) {
          const componentCustomizations = customizations.components?.[componentType]?.[componentTemplate.id] || {};
          const customizedComponent = await this.createFromTemplate(
            componentTemplate.id, 
            componentCustomizations, 
            componentType
          );
          compositeConfig.components[componentType].push(customizedComponent);
        }
      }
    }

    return compositeConfig;
  }

  /**
   * Saves world content as new template
   * @param {Object} content - Content to save as template
   * @param {string} contentType - Type of content
   * @param {Object} templateMetadata - Template metadata
   * @returns {string} New template ID
   */
  async saveAsTemplate(content, contentType, templateMetadata) {
    try {
      // Remove instance-specific data
      const templateData = this.sanitizeForTemplate(content, contentType);
      
      // Add template metadata
      templateData.templateMetadata = {
        ...templateMetadata,
        sourceContentId: content.id,
        contentType,
        createdAt: new Date(),
        version: '1.0.0'
      };

      // Save through template manager
      const templateId = await this.templateManager.saveTemplate(templateData, contentType);
      
      return templateId;
    } catch (error) {
      throw new Error(`Failed to save content as template: ${error.message}`);
    }
  }

  /**
   * Saves complete world as composite template
   * @param {Object} worldConfig - Complete world configuration
   * @param {Object} templateMetadata - Template metadata
   * @returns {string} New composite template ID
   */
  async saveWorldAsCompositeTemplate(worldConfig, templateMetadata) {
    try {
      const compositeTemplate = {
        id: this.generateId(),
        name: templateMetadata.name || `${worldConfig.name} Template`,
        description: templateMetadata.description || `Complete world template based on ${worldConfig.name}`,
        type: 'composite',
        
        // Include all world components
        components: {
          world: [this.sanitizeForTemplate(worldConfig, 'world')],
          nodes: worldConfig.nodes.map(node => this.sanitizeForTemplate(node, 'node')),
          interactions: worldConfig.interactions.map(interaction => this.sanitizeForTemplate(interaction, 'interaction')),
          characters: worldConfig.characters.map(character => this.sanitizeForTemplate(character, 'character'))
        },
        
        // Include node populations structure
        nodePopulationStructure: worldConfig.nodePopulations,
        
        templateMetadata: {
          ...templateMetadata,
          sourceWorldId: worldConfig.id,
          createdAt: new Date(),
          version: '1.0.0'
        }
      };

      const templateId = await this.templateManager.saveTemplate(compositeTemplate, 'composite');
      return templateId;
    } catch (error) {
      throw new Error(`Failed to save world as composite template: ${error.message}`);
    }
  }

  /**
   * Validates template dependencies and resolves them
   * @param {Object} template - Template to validate
   * @param {string} contentType - Type of content
   * @returns {Promise<boolean>} Validation result
   */
  async validateTemplateDependencies(template, contentType) {
    if (!template.dependencies || template.dependencies.length === 0) {
      return true; // No dependencies to validate
    }

    for (const dependency of template.dependencies) {
      const dependencyTemplate = await this.templateManager.getTemplate(dependency.id, dependency.type);
      if (!dependencyTemplate) {
        throw new Error(`Missing dependency: ${dependency.id} (${dependency.type})`);
      }
      
      // Recursively validate dependency's dependencies
      await this.validateTemplateDependencies(dependencyTemplate, dependency.type);
    }

    return true;
  }

  /**
   * Tracks template customization history
   * @param {string} templateId - Template ID
   * @param {string} contentType - Content type
   * @param {Object} customizations - Applied customizations
   * @param {string} resultId - Result content ID
   */
  trackCustomization(templateId, contentType, customizations, resultId) {
    const historyKey = `${templateId}:${contentType}`;
    if (!this.customizationHistory.has(historyKey)) {
      this.customizationHistory.set(historyKey, []);
    }
    
    this.customizationHistory.get(historyKey).push({
      customizations,
      resultId,
      timestamp: new Date()
    });
  }

  /**
   * Gets customization history for a template
   * @param {string} templateId - Template ID
   * @param {string} contentType - Content type
   * @returns {Array} Customization history
   */
  getCustomizationHistory(templateId, contentType) {
    const historyKey = `${templateId}:${contentType}`;
    return this.customizationHistory.get(historyKey) || [];
  }

  /**
   * Deep merges two objects, with the second object taking precedence
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  mergeObjects(target, source) {
    const result = { ...target };
    
    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.mergeObjects(result[key] || {}, value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Sanitizes content for use as template (removes instance-specific data)
   * @param {Object} content - Content to sanitize
   * @param {string} contentType - Type of content
   * @returns {Object} Sanitized content
   */
  sanitizeForTemplate(content, contentType) {
    const sanitized = { ...content };
    
    // Remove instance-specific fields
    delete sanitized.id;
    delete sanitized.createdAt;
    delete sanitized.modifiedAt;
    delete sanitized.isTemplateInstance;
    delete sanitized.templateId;
    
    // Remove populated data for world templates
    if (contentType === 'world') {
      sanitized.nodes = [];
      sanitized.interactions = [];
      sanitized.characters = [];
      sanitized.nodePopulations = {};
    }
    
    return sanitized;
  }

  /**
   * Generates a unique identifier
   * @returns {string} Unique identifier
   */
  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  /**
   * Gets available templates by content type
   * @param {string} contentType - Type of content
   * @returns {Promise<Array>} Available templates
   */
  async getAvailableTemplates(contentType) {
    try {
      return await this.templateManager.getTemplatesByType(contentType);
    } catch (error) {
      throw new Error(`Failed to get available templates: ${error.message}`);
    }
  }

  /**
   * Validates template customizations
   * @param {Object} template - Template to validate against
   * @param {Object} customizations - Customizations to validate
   * @param {string} contentType - Type of content
   * @returns {Object} Validation result
   */
  validateCustomizations(template, customizations, contentType) {
    const errors = [];
    const warnings = [];

    // Validate required fields are not removed
    const requiredFields = this.getRequiredFields(contentType);
    for (const field of requiredFields) {
      if (customizations.hasOwnProperty(field) && !customizations[field]) {
        errors.push(`Required field '${field}' cannot be empty`);
      }
    }

    // Validate data types match template expectations
    for (const [key, value] of Object.entries(customizations)) {
      if (template.hasOwnProperty(key) && template[key] !== null) {
        const templateType = typeof template[key];
        const customizationType = typeof value;
        
        if (templateType !== customizationType && value !== null) {
          warnings.push(`Type mismatch for '${key}': expected ${templateType}, got ${customizationType}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Gets required fields for content type
   * @param {string} contentType - Type of content
   * @returns {Array} Required fields
   */
  getRequiredFields(contentType) {
    const requiredFields = {
      world: ['name'],
      node: ['name', 'type'],
      interaction: ['name', 'type'],
      character: ['name'],
      composite: ['name']
    };

    return requiredFields[contentType] || [];
  }
}

export default TemplateIntegrationService;
