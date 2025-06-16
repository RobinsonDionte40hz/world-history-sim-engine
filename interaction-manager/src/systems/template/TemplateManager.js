import {
  BaseTemplate,
  CharacterTemplate,
  NodeTemplate,
  InteractionTemplate,
  EventTemplate,
  GroupTemplate,
  ItemTemplate
} from './TemplateTypes';

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
  registerTemplate(type, template) {
    if (!this.validateTemplate(type, template)) {
      throw new Error(`Invalid template for type: ${type}`);
    }
    this.templates[type].set(template.id, template);
  }

  // Template validation
  validateTemplate(type, template) {
    const templateType = this.getTemplateType(type);
    if (!templateType) return false;

    // Check required fields
    for (const [key, value] of Object.entries(templateType)) {
      if (value === String && typeof template[key] !== 'string') return false;
      if (value === Number && typeof template[key] !== 'number') return false;
      if (Array.isArray(value) && !Array.isArray(template[key])) return false;
      if (value === Object && typeof template[key] !== 'object') return false;
    }

    return true;
  }

  // Get template type definition
  getTemplateType(type) {
    const types = {
      characters: CharacterTemplate,
      nodes: NodeTemplate,
      interactions: InteractionTemplate,
      events: EventTemplate,
      groups: GroupTemplate,
      items: ItemTemplate
    };
    return types[type];
  }

  // Template retrieval
  getTemplate(type, id) {
    return this.templates[type].get(id);
  }

  // Template listing
  listTemplates(type) {
    return Array.from(this.templates[type].values());
  }

  // Get all templates across all types
  getAllTemplates() {
    return {
      characters: this.listTemplates('characters'),
      nodes: this.listTemplates('nodes'),
      interactions: this.listTemplates('interactions'),
      events: this.listTemplates('events'),
      groups: this.listTemplates('groups'),
      items: this.listTemplates('items')
    };
  }

  // Template modification
  updateTemplate(type, id, updates) {
    const template = this.getTemplate(type, id);
    if (!template) return false;

    const updatedTemplate = { ...template, ...updates };
    if (!this.validateTemplate(type, updatedTemplate)) return false;

    this.templates[type].set(id, updatedTemplate);
    return true;
  }

  // Template deletion
  deleteTemplate(type, id) {
    return this.templates[type].delete(id);
  }

  // Template search
  searchTemplates(type, criteria) {
    return this.listTemplates(type).filter(template => {
      return Object.entries(criteria).every(([key, value]) => {
        if (Array.isArray(template[key])) {
          return template[key].includes(value);
        }
        return template[key] === value;
      });
    });
  }

  // Template inheritance
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

    this.registerTemplate(type, variantTemplate);
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

    this.registerTemplate(type, combinedTemplate);
    return combinedTemplate;
  }

  // Template export
  exportTemplates(type) {
    return Array.from(this.templates[type].values()).map(template => ({
      ...template,
      version: '1.0',
      exportDate: new Date().toISOString()
    }));
  }

  // Template import
  importTemplates(type, templates) {
    let successCount = 0;
    for (const template of templates) {
      if (this.validateTemplate(type, template)) {
        this.registerTemplate(type, template);
        successCount++;
      }
    }
    return successCount;
  }
}

export default TemplateManager; 