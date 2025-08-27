/**
 * TemplateIntegrationService - Integrates template system with existing editors and components
 * Provides seamless data flow between template customization and character/node/interaction editors
 */
import TextTemplateEngine from '../../domain/services/TextTemplateEngine';

class TemplateIntegrationService {
  constructor() {
    this.templateEngine = new TextTemplateEngine();
    this.contextProviders = new Map();
    this.templateSubscribers = new Set();
  }

  /**
   * Register a context provider for template resolution
   * @param {string} type - Context type (character, node, world, etc.)
   * @param {function} provider - Function that returns context data
   */
  registerContextProvider(type, provider) {
    this.contextProviders.set(type, provider);
  }

  /**
   * Subscribe to template updates
   * @param {function} callback - Callback function for template updates
   */
  subscribeToTemplateUpdates(callback) {
    this.templateSubscribers.add(callback);
  }

  /**
   * Unsubscribe from template updates
   * @param {function} callback - Callback function to remove
   */
  unsubscribeFromTemplateUpdates(callback) {
    this.templateSubscribers.delete(callback);
  }

  /**
   * Notify all subscribers of template updates
   * @param {object} updateData - Data about the template update
   */
  notifyTemplateUpdate(updateData) {
    this.templateSubscribers.forEach(callback => {
      try {
        callback(updateData);
      } catch (error) {
        console.error('Error in template update callback:', error);
      }
    });
  }

  /**
   * Get comprehensive context for template resolution
   * @param {object} options - Options for context generation
   * @returns {object} - Complete context object
   */
  getTemplateContext(options = {}) {
    const context = {};

    // Gather context from all registered providers
    this.contextProviders.forEach((provider, type) => {
      try {
        const typeContext = provider(options);
        if (typeContext) {
          context[type] = typeContext;
        }
      } catch (error) {
        console.error(`Error getting context from ${type} provider:`, error);
      }
    });

    // Add default context if none provided
    if (Object.keys(context).length === 0) {
      context.character = this.getDefaultCharacterContext();
      context.node = this.getDefaultNodeContext();
      context.world = this.getDefaultWorldContext();
    }

    return context;
  }

  /**
   * Apply template customizations to an entity
   * @param {object} template - Template with customizations
   * @param {object} entity - Entity to apply template to
   * @param {object} context - Context for template resolution
   * @returns {object} - Entity with applied template
   */
  applyTemplateToEntity(template, entity, context = null) {
    if (!template || !entity) return entity;

    const resolveContext = context || this.getTemplateContext({ entity });
    const appliedEntity = { ...entity };

    // Apply structural customizations
    Object.keys(template).forEach(key => {
      if (key !== 'textTemplates' && key !== 'metadata' && template[key] !== undefined) {
        appliedEntity[key] = template[key];
      }
    });

    // Apply text template customizations
    if (template.textTemplates) {
      Object.entries(template.textTemplates).forEach(([key, textTemplate]) => {
        if (textTemplate) {
          const resolution = this.templateEngine.resolve(textTemplate, resolveContext);
          if (resolution.errors.length === 0) {
            appliedEntity[key] = resolution.resolved;
          } else {
            console.warn(`Template resolution errors for ${key}:`, resolution.errors);
            appliedEntity[key] = textTemplate; // Fallback to original template
          }
        }
      });
    }

    // Add metadata about template application
    appliedEntity.metadata = {
      ...appliedEntity.metadata,
      appliedTemplate: template.id,
      appliedAt: new Date().toISOString(),
      templateResolutionErrors: this.getTemplateResolutionErrors(template, resolveContext)
    };

    return appliedEntity;
  }

  /**
   * Get template resolution errors for all text templates
   * @param {object} template - Template to check
   * @param {object} context - Context for resolution
   * @returns {object} - Map of field names to error arrays
   */
  getTemplateResolutionErrors(template, context) {
    const errors = {};

    if (template.textTemplates) {
      Object.entries(template.textTemplates).forEach(([key, textTemplate]) => {
        if (textTemplate) {
          const resolution = this.templateEngine.resolve(textTemplate, context);
          if (resolution.errors.length > 0) {
            errors[key] = resolution.errors;
          }
        }
      });
    }

    return errors;
  }

  /**
   * Validate template compatibility with entity type
   * @param {object} template - Template to validate
   * @param {string} entityType - Type of entity (character, node, interaction)
   * @param {object} context - Context for validation
   * @returns {object} - Validation result
   */
  validateTemplateCompatibility(template, entityType, context = null) {
    const errors = [];
    const warnings = [];
    const resolveContext = context || this.getTemplateContext();

    // Check if template type matches entity type
    if (template.type && template.type !== entityType) {
      warnings.push(`Template type '${template.type}' doesn't match entity type '${entityType}'`);
    }

    // Validate text templates
    if (template.textTemplates) {
      Object.entries(template.textTemplates).forEach(([key, textTemplate]) => {
        if (textTemplate) {
          const validation = this.templateEngine.validateTemplate(textTemplate);
          if (!validation.isValid) {
            errors.push(`Text template '${key}' has validation errors: ${validation.errors.join(', ')}`);
          }

          const resolution = this.templateEngine.resolve(textTemplate, resolveContext);
          if (resolution.errors.length > 0) {
            warnings.push(`Text template '${key}' has resolution warnings: ${resolution.errors.join(', ')}`);
          }
        }
      });
    }

    // Check required fields for entity type
    const requiredFields = this.getRequiredFieldsForEntityType(entityType);
    const missingFields = requiredFields.filter(field =>
      template[field] === undefined || template[field] === null
    );

    if (missingFields.length > 0) {
      warnings.push(`Missing recommended fields: ${missingFields.join(', ')}`);
    }

    return {
      isCompatible: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get required fields for an entity type
   * @param {string} entityType - Type of entity
   * @returns {string[]} - Array of required field names
   */
  getRequiredFieldsForEntityType(entityType) {
    const requiredFields = {
      character: ['name', 'attributes'],
      node: ['name', 'type'],
      interaction: ['name', 'type'],
      world: ['name']
    };

    return requiredFields[entityType] || [];
  }

  /**
   * Enhance editor data with template context
   * @param {string} editorType - Type of editor (character, node, interaction)
   * @param {object} editorData - Current editor data
   * @returns {object} - Enhanced context for template system
   */
  enhanceEditorContext(editorType, editorData) {
    const baseContext = this.getTemplateContext();

    // Add current editor data to context
    baseContext[editorType] = {
      ...baseContext[editorType],
      ...editorData
    };

    // Add editor-specific enhancements
    switch (editorType) {
      case 'character':
        baseContext.character = this.enhanceCharacterContext(baseContext.character);
        break;
      case 'node':
        baseContext.node = this.enhanceNodeContext(baseContext.node);
        break;
      case 'interaction':
        baseContext.interaction = this.enhanceInteractionContext(baseContext.interaction);
        break;
      default:
        // No specific enhancement for unknown editor types
        console.warn(`Unknown editor type: ${editorType}`);
        break;
    }

    return baseContext;
  }

  /**
   * Enhance character context with computed properties
   * @param {object} characterData - Character data
   * @returns {object} - Enhanced character context
   */
  enhanceCharacterContext(characterData) {
    if (!characterData) return this.getDefaultCharacterContext();

    const enhanced = { ...characterData };

    // Add computed attribute modifiers
    if (enhanced.attributes) {
      enhanced.modifiers = {};
      Object.entries(enhanced.attributes).forEach(([attr, value]) => {
        enhanced.modifiers[attr] = Math.floor((value - 10) / 2);
      });
    }

    // Add personality descriptors
    if (enhanced.personality) {
      enhanced.personalityDescriptors = this.getPersonalityDescriptors(enhanced.personality);
    }

    // Add archetype information
    if (enhanced.archetype) {
      enhanced.archetypeInfo = this.getArchetypeInfo(enhanced.archetype);
    }

    return enhanced;
  }

  /**
   * Enhance node context with computed properties
   * @param {object} nodeData - Node data
   * @returns {object} - Enhanced node context
   */
  enhanceNodeContext(nodeData) {
    if (!nodeData) return this.getDefaultNodeContext();

    const enhanced = { ...nodeData };

    // Add environment descriptors
    if (enhanced.environmentalProperties) {
      enhanced.environmentDescriptors = this.getEnvironmentDescriptors(enhanced.environmentalProperties);
    }

    // Add cultural descriptors
    if (enhanced.culturalContext) {
      enhanced.culturalDescriptors = this.getCulturalDescriptors(enhanced.culturalContext);
    }

    return enhanced;
  }

  /**
   * Enhance interaction context with computed properties
   * @param {object} interactionData - Interaction data
   * @returns {object} - Enhanced interaction context
   */
  enhanceInteractionContext(interactionData) {
    if (!interactionData) return {};

    const enhanced = { ...interactionData };

    // Add difficulty descriptors
    if (enhanced.requirements) {
      enhanced.difficultyLevel = this.calculateInteractionDifficulty(enhanced.requirements);
    }

    return enhanced;
  }

  /**
   * Get personality descriptors from personality values
   * @param {object} personality - Personality object
   * @returns {object} - Descriptive personality traits
   */
  getPersonalityDescriptors(personality) {
    const descriptors = {};

    if (personality.aggression !== undefined) {
      if (personality.aggression > 0.7) descriptors.aggression = 'very aggressive';
      else if (personality.aggression > 0.4) descriptors.aggression = 'somewhat aggressive';
      else descriptors.aggression = 'peaceful';
    }

    if (personality.curiosity !== undefined) {
      if (personality.curiosity > 0.7) descriptors.curiosity = 'very curious';
      else if (personality.curiosity > 0.4) descriptors.curiosity = 'somewhat curious';
      else descriptors.curiosity = 'incurious';
    }

    if (personality.empathy !== undefined) {
      if (personality.empathy > 0.7) descriptors.empathy = 'very empathetic';
      else if (personality.empathy > 0.4) descriptors.empathy = 'somewhat empathetic';
      else descriptors.empathy = 'cold';
    }

    return descriptors;
  }

  /**
   * Get archetype information
   * @param {string} archetype - Archetype name
   * @returns {object} - Archetype information
   */
  getArchetypeInfo(archetype) {
    const archetypes = {
      warrior: { primaryAttribute: 'strength', description: 'A skilled combatant' },
      mage: { primaryAttribute: 'intelligence', description: 'A wielder of magic' },
      rogue: { primaryAttribute: 'dexterity', description: 'A stealthy infiltrator' },
      cleric: { primaryAttribute: 'wisdom', description: 'A divine spellcaster' },
      bard: { primaryAttribute: 'charisma', description: 'A performer and storyteller' }
    };

    return archetypes[archetype.toLowerCase()] || { description: 'Unknown archetype' };
  }

  /**
   * Get environment descriptors
   * @param {object} environmentalProperties - Environmental properties
   * @returns {string[]} - Array of descriptive terms
   */
  getEnvironmentDescriptors(environmentalProperties) {
    const descriptors = [];

    Object.entries(environmentalProperties).forEach(([key, value]) => {
      if (value === true) {
        descriptors.push(key);
      }
    });

    return descriptors;
  }

  /**
   * Get cultural descriptors
   * @param {object} culturalContext - Cultural context
   * @returns {object} - Cultural descriptors
   */
  getCulturalDescriptors(culturalContext) {
    return {
      ...culturalContext,
      formality: culturalContext.customs?.includes('formal') ? 'formal' : 'informal'
    };
  }

  /**
   * Calculate interaction difficulty
   * @param {object} requirements - Interaction requirements
   * @returns {string} - Difficulty level
   */
  calculateInteractionDifficulty(requirements) {
    if (!requirements.attributes) return 'easy';

    const totalRequirement = Object.values(requirements.attributes).reduce((sum, val) => sum + val, 0);
    const averageRequirement = totalRequirement / Object.keys(requirements.attributes).length;

    if (averageRequirement > 15) return 'very hard';
    if (averageRequirement > 12) return 'hard';
    if (averageRequirement > 10) return 'moderate';
    return 'easy';
  }

  /**
   * Get default character context
   * @returns {object} - Default character context
   */
  getDefaultCharacterContext() {
    return {
      name: 'Sample Character',
      attributes: {
        strength: 12,
        dexterity: 12,
        constitution: 12,
        intelligence: 12,
        wisdom: 12,
        charisma: 12
      },
      personality: {
        aggression: 0.5,
        curiosity: 0.5,
        empathy: 0.5
      },
      archetype: 'adventurer'
    };
  }

  /**
   * Get default node context
   * @returns {object} - Default node context
   */
  getDefaultNodeContext() {
    return {
      name: 'Sample Location',
      type: 'settlement',
      environmentalProperties: {
        populated: true,
        safe: true
      },
      culturalContext: {
        language: 'common',
        customs: 'friendly'
      }
    };
  }

  /**
   * Get default world context
   * @returns {object} - Default world context
   */
  getDefaultWorldContext() {
    return {
      name: 'Sample World',
      theme: 'fantasy',
      era: 'medieval'
    };
  }

  /**
   * Batch apply templates to multiple entities
   * @param {object[]} templates - Array of templates
   * @param {object[]} entities - Array of entities
   * @param {object} context - Context for template resolution
   * @returns {object[]} - Array of entities with applied templates
   */
  batchApplyTemplates(templates, entities, context = null) {
    const resolveContext = context || this.getTemplateContext();

    return entities.map((entity, index) => {
      const template = templates[index] || templates[0]; // Use first template as fallback
      return this.applyTemplateToEntity(template, entity, resolveContext);
    });
  }

  /**
   * Export template integration data
   * @param {object} options - Export options
   * @returns {object} - Exportable data
   */
  exportIntegrationData(options = {}) {
    return {
      contextProviders: Array.from(this.contextProviders.keys()),
      defaultContexts: {
        character: this.getDefaultCharacterContext(),
        node: this.getDefaultNodeContext(),
        world: this.getDefaultWorldContext()
      },
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Import template integration data
   * @param {object} data - Import data
   * @returns {boolean} - Success status
   */
  importIntegrationData(data) {
    try {
      // Validate import data
      if (!data || !data.version) {
        throw new Error('Invalid import data');
      }

      // Import would restore context providers and settings
      // For now, just validate the structure
      return true;
    } catch (error) {
      console.error('Failed to import integration data:', error);
      return false;
    }
  }
}

export default TemplateIntegrationService;