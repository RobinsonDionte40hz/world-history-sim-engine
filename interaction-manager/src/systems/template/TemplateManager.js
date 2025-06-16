import {
  BaseTemplate,
  CharacterTemplate,
  NodeTemplate,
  InteractionTemplate,
  EventTemplate,
  GroupTemplate,
  ItemTemplate
} from './TemplateTypes';
import TemplateValidator from './TemplateValidator';
import TemplateGenerator from './TemplateGenerator';

class TemplateManager {
  constructor() {
    this.templates = {
      characters: new Map(),
      nodes: new Map(),
      interactions: new Map(),
      events: new Map(),
      groups: new Map(),
      items: new Map()
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
        // Add more combination operations as needed
      }
    }

    if (!this.validateTemplate(type, combinedTemplate)) return null;

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

  // Template combination
  createTemplateVariant(type, baseId, variantData) {
    const baseTemplate = this.getTemplate(type, baseId);
    if (!baseTemplate) return null;

    const variantTemplate = {
      ...baseTemplate,
      ...variantData,
      id: `${baseId}_variant_${Date.now()}`,
      parentId: baseId
    };

    if (!this.validateTemplate(type, variantTemplate)) return null;

    this.addTemplate(type, variantTemplate);
    return variantTemplate;
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
        // Add more combination operations as needed
      }
    }

    if (!this.validateTemplate(type, combinedTemplate)) return null;

    this.addTemplate(type, combinedTemplate);
    return combinedTemplate;
  }

  // Template combination
  getTemplatesByTag(type, tag) {
    if (!this.templates[type]) {
      throw new Error(`Invalid template type: ${type}`);
    }

    const templates = this.getAllTemplates(type);
    return templates.filter(template => template.tags.includes(tag));
  }
}

export default TemplateManager; 