import { v4 as uuidv4 } from 'uuid';
import TemplateValidator from './TemplateValidator';

class TemplateGenerator {
  static generateBaseTemplate(name, description, tags = []) {
    return {
      id: uuidv4(),
      name,
      description,
      version: '1.0.0',
      tags,
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        author: 'System'
      }
    };
  }

  static generateCharacterTemplate(name, description, tags = []) {
    const baseTemplate = this.generateBaseTemplate(name, description, tags);
    return {
      ...baseTemplate,
      personalityTraits: [],
      cognitiveTraits: [],
      emotionalTendencies: [],
      skills: [],
      attributes: {
        strength: 0,
        intelligence: 0,
        charisma: 0,
        wisdom: 0,
        dexterity: 0,
        constitution: 0
      },
      background: ''
    };
  }

  static generateNodeTemplate(name, description, type, tags = []) {
    const baseTemplate = this.generateBaseTemplate(name, description, tags);
    return {
      ...baseTemplate,
      type,
      connections: [],
      properties: {},
      requirements: {
        level: 1,
        attributes: {},
        items: []
      }
    };
  }

  static generateInteractionTemplate(name, description, tags = []) {
    const baseTemplate = this.generateBaseTemplate(name, description, tags);
    return {
      ...baseTemplate,
      prerequisites: {
        groups: [],
        showWhenUnavailable: true,
        unavailableMessage: 'This interaction is not available.'
      },
      effects: {
        influenceChanges: [],
        prestigeChanges: [],
        alignmentChanges: []
      },
      options: []
    };
  }

  static generateEventTemplate(name, description, tags = []) {
    const baseTemplate = this.generateBaseTemplate(name, description, tags);
    return {
      ...baseTemplate,
      trigger: {
        type: 'manual',
        conditions: []
      },
      conditions: [],
      actions: [],
      consequences: []
    };
  }

  static generateGroupTemplate(name, description, tags = []) {
    const baseTemplate = this.generateBaseTemplate(name, description, tags);
    return {
      ...baseTemplate,
      members: [],
      roles: {},
      hierarchy: {},
      rules: []
    };
  }

  static generateItemTemplate(name, description, type, tags = []) {
    const baseTemplate = this.generateBaseTemplate(name, description, tags);
    return {
      ...baseTemplate,
      type,
      properties: {},
      requirements: {
        level: 1,
        attributes: {},
        items: []
      },
      effects: {}
    };
  }

  static generateTemplate(type, name, description, additionalParams = {}) {
    let template;
    switch (type) {
      case 'characters':
        template = this.generateCharacterTemplate(name, description, additionalParams.tags);
        break;
      case 'nodes':
        template = this.generateNodeTemplate(name, description, additionalParams.type, additionalParams.tags);
        break;
      case 'interactions':
        template = this.generateInteractionTemplate(name, description, additionalParams.tags);
        break;
      case 'events':
        template = this.generateEventTemplate(name, description, additionalParams.tags);
        break;
      case 'groups':
        template = this.generateGroupTemplate(name, description, additionalParams.tags);
        break;
      case 'items':
        template = this.generateItemTemplate(name, description, additionalParams.type, additionalParams.tags);
        break;
      default:
        throw new Error(`Invalid template type: ${type}`);
    }

    if (!TemplateValidator.validateTemplate(type, template)) {
      throw new Error(`Generated template is invalid for type: ${type}`);
    }

    return template;
  }
}

export default TemplateGenerator; 