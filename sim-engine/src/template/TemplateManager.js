import TemplateValidator from './TemplateValidator';
import TemplateGenerator from './TemplateGenerator';
import EnvironmentalPresetService from '../domain/services/EnvironmentalPresetService.js';
import Node from '../domain/entities/Node.js';

class TemplateManager {
  constructor() {
    this.templates = {
      characters: new Map(),
      nodes: new Map(),
      interactions: new Map(),
      events: new Map(),
      groups: new Map(),
      items: new Map(),
      encounters: new Map(),  // Added for encounter templates
      worlds: new Map(),      // Added for world templates
      composite: new Map()    // Added for composite templates (role sets, etc.)
    };
  }

  // Template registration
  addTemplate(type, template) {
    if (!this.templates[type]) {
      throw new Error(`Invalid template type: ${type}`);
    }

    if (!TemplateValidator.validateTemplate(type, template)) {
      throw new Error(`Invalid template for type: ${type}`);
    }

    this.templates[type].set(template.id, template);
    return template;
  }

  // Template retrieval
  getTemplate(type, id) {
    if (!this.templates[type]) {
      throw new Error(`Invalid template type: ${type}`);
    }

    return this.templates[type].get(id);
  }

  // Template listing
  getAllTemplates(type) {
    if (!this.templates[type]) {
      throw new Error(`Invalid template type: ${type}`);
    }

    return Array.from(this.templates[type].values());
  }

  // Template modification
  updateTemplate(type, id, updates) {
    if (!this.templates[type]) {
      throw new Error(`Invalid template type: ${type}`);
    }

    const template = this.templates[type].get(id);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      metadata: {
        ...template.metadata,
        lastModified: new Date().toISOString()
      }
    };

    if (!TemplateValidator.validateTemplate(type, updatedTemplate)) {
      throw new Error(`Invalid template updates for type: ${type}`);
    }

    this.templates[type].set(id, updatedTemplate);
    return updatedTemplate;
  }

  // Template deletion
  deleteTemplate(type, id) {
    if (!this.templates[type]) {
      throw new Error(`Invalid template type: ${type}`);
    }

    return this.templates[type].delete(id);
  }

  // Template search
  searchTemplates(type, query) {
    if (!this.templates[type]) {
      throw new Error(`Invalid template type: ${type}`);
    }

    const templates = this.getAllTemplates(type);
    const searchTerms = query.toLowerCase().split(' ');

    return templates.filter(template => {
      const searchableText = [
        template.name,
        template.description,
        ...template.tags
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  // Template inheritance
  createTemplate(type, name, description, additionalParams = {}) {
    const template = TemplateGenerator.generateTemplate(type, name, description, additionalParams);
    return this.addTemplate(type, template);
  }

  // Template combination
  combineTemplates(type, templateIds, combinationRules) {
    const templates = templateIds.map(id => this.getTemplate(type, id));
    if (templates.some(t => !t)) return null;

    const combinedTemplate = {
      ...templates[0],
      id: `combined_${Date.now()}`,
      combinedFrom: templateIds
    };

    // Apply combination rules
    for (const rule of combinationRules) {
      const { field, operation, source } = rule;
      switch (operation) {
        case 'merge':
          combinedTemplate[field] = [
            ...new Set(templates.flatMap(t => t[field]))
          ];
          break;
        case 'average':
          combinedTemplate[field] = templates.reduce(
            (sum, t) => sum + t[field], 0
          ) / templates.length;
          break;
        case 'select':
          combinedTemplate[field] = templates[source][field];
          break;
        default:
          // Unknown operation, skip
          break;
      }
    }

    if (!TemplateValidator.validateTemplate(type, combinedTemplate)) return null;

    this.addTemplate(type, combinedTemplate);
    return combinedTemplate;
  }

  // Template export
  exportTemplates(type) {
    if (!this.templates[type]) {
      throw new Error(`Invalid template type: ${type}`);
    }

    return this.getAllTemplates(type);
  }

  // Template import
  importTemplates(type, templates) {
    if (!this.templates[type]) {
      throw new Error(`Invalid template type: ${type}`);
    }

    const importedTemplates = [];
    const errors = [];

    templates.forEach(template => {
      try {
        if (TemplateValidator.validateTemplate(type, template)) {
          this.templates[type].set(template.id, template);
          importedTemplates.push(template);
        } else {
          errors.push(`Invalid template: ${template.id}`);
        }
      } catch (error) {
        errors.push(`Error importing template ${template.id}: ${error.message}`);
      }
    });

    return {
      imported: importedTemplates,
      errors
    };
  }

  // Template variant creation
  createTemplateVariant(type, baseId, variantData) {
    const baseTemplate = this.getTemplate(type, baseId);
    if (!baseTemplate) return null;

    const variantTemplate = {
      ...baseTemplate,
      ...variantData,
      id: `${baseId}_variant_${Date.now()}`,
      parentId: baseId
    };

    if (!TemplateValidator.validateTemplate(type, variantTemplate)) return null;

    this.addTemplate(type, variantTemplate);
    return variantTemplate;
  }

  // Template combination
  getTemplatesByTag(type, tag) {
    if (!this.templates[type]) {
      throw new Error(`Invalid template type: ${type}`);
    }

    const templates = this.getAllTemplates(type);
    return templates.filter(template => template.tags.includes(tag));
  }

  /**
   * Instantiates a node template with environmental data support
   * @param {string} templateId - Template ID
   * @param {Object} customizations - Customizations to apply
   * @returns {Object} Instantiated node configuration
   */
  instantiateNodeTemplate(templateId, customizations = {}) {
    const template = this.getTemplate('nodes', templateId);
    if (!template) {
      throw new Error(`Node template not found: ${templateId}`);
    }

    // Apply environmental preset if specified
    let environmentalData = {};
    if (customizations.environmentalPreset) {
      try {
        const preset = EnvironmentalPresetService.getPreset(customizations.environmentalPreset);
        if (preset) {
          environmentalData = EnvironmentalPresetService.applyPreset(preset, {});
        }
      } catch (error) {
        console.warn(`Failed to apply environmental preset: ${error.message}`);
      }
    }

    // Merge template data with customizations and environmental data
    const nodeConfig = {
      ...template,
      ...environmentalData,
      ...customizations,
      id: customizations.id || `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: templateId,
      isTemplateInstance: true,
      metadata: {
        ...template.metadata,
        instantiatedAt: new Date().toISOString(),
        customizations: Object.keys(customizations)
      }
    };

    // Validate the instantiated node
    try {
      const node = new Node(nodeConfig);
      return node.toJSON();
    } catch (error) {
      throw new Error(`Failed to instantiate node template: ${error.message}`);
    }
  }

  /**
   * Creates a node template with environmental data
   * @param {Object} nodeData - Node data to create template from
   * @param {string} name - Template name
   * @param {string} description - Template description
   * @param {Array} tags - Template tags
   * @returns {Object} Created template
   */
  createNodeTemplateWithEnvironmentalData(nodeData, name, description, tags = []) {
    // Ensure the node has environmental data
    let enhancedNodeData = nodeData;
    if (!(nodeData instanceof Node)) {
      try {
        const node = new Node(nodeData);
        enhancedNodeData = node.toJSON();
      } catch (error) {
        throw new Error(`Failed to create enhanced node: ${error.message}`);
      }
    }

    const template = {
      id: `node_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      type: 'node',
      tags: ['node', 'environmental', ...tags],
      version: '1.0.0',
      ...enhancedNodeData,
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        author: 'User',
        type: 'environmental-node',
        hasEnvironmentalData: true,
        environmentalFeatures: this._extractEnvironmentalFeatures(enhancedNodeData)
      }
    };

    return this.addTemplate('nodes', template);
  }

  /**
   * Validates environmental data in templates
   * @param {string} type - Template type
   * @param {string} templateId - Template ID
   * @returns {Object} Validation result
   */
  validateEnvironmentalTemplate(type, templateId) {
    const template = this.getTemplate(type, templateId);
    if (!template) {
      return {
        isValid: false,
        errors: ['Template not found'],
        warnings: []
      };
    }

    if (type === 'nodes') {
      try {
        // Try to create a Node entity to validate environmental data
        const node = new Node(template);
        return {
          isValid: true,
          errors: [],
          warnings: [],
          environmentalFeatures: this._extractEnvironmentalFeatures(template)
        };
      } catch (error) {
        return {
          isValid: false,
          errors: [`Environmental validation failed: ${error.message}`],
          warnings: []
        };
      }
    }

    return {
      isValid: true,
      errors: [],
      warnings: ['Environmental validation not applicable for this template type']
    };
  }

  /**
   * Gets all templates with environmental data
   * @param {string} type - Template type
   * @returns {Array} Templates with environmental data
   */
  getEnvironmentalTemplates(type) {
    const templates = this.getAllTemplates(type);
    return templates.filter(template => 
      template.metadata?.hasEnvironmentalData || 
      template.environment || 
      template.tags?.includes('environmental')
    );
  }

  /**
   * Extracts environmental features from node data
   * @private
   */
  _extractEnvironmentalFeatures(nodeData) {
    const features = [];
    
    if (nodeData.environment) {
      if (nodeData.environment.terrain) features.push(`terrain:${nodeData.environment.terrain}`);
      if (nodeData.environment.climate) features.push(`climate:${nodeData.environment.climate}`);
      if (nodeData.environment.lighting) features.push(`lighting:${nodeData.environment.lighting}`);
      if (nodeData.environment.hazards && nodeData.environment.hazards.length > 0) {
        features.push(`hazards:${nodeData.environment.hazards.length}`);
      }
    }
    
    if (nodeData.connections && nodeData.connections.length > 0) {
      features.push(`connections:${nodeData.connections.length}`);
    }
    
    if (nodeData.size) features.push(`size:${nodeData.size}`);
    
    return features;
  }
}

export default TemplateManager; 