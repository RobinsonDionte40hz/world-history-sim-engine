import {
  BaseTemplate,
  CharacterTemplate,
  NodeTemplate,
  InteractionTemplate,
  EventTemplate,
  GroupTemplate,
  ItemTemplate
} from './TemplateTypes';

class TemplateValidator {
  static validateBaseTemplate(template) {
    if (!template.id || typeof template.id !== 'string') return false;
    if (!template.name || typeof template.name !== 'string') return false;
    if (!template.description || typeof template.description !== 'string') return false;
    if (!template.version || typeof template.version !== 'string') return false;
    if (!Array.isArray(template.tags)) return false;
    if (typeof template.metadata !== 'object') return false;
    return true;
  }

  static validateCharacterTemplate(template) {
    if (!this.validateBaseTemplate(template)) return false;
    if (!Array.isArray(template.personalityTraits)) return false;
    if (!Array.isArray(template.cognitiveTraits)) return false;
    if (!Array.isArray(template.emotionalTendencies)) return false;
    if (!Array.isArray(template.skills)) return false;
    if (typeof template.attributes !== 'object') return false;
    if (typeof template.background !== 'string') return false;
    return true;
  }

  static validateNodeTemplate(template) {
    if (!this.validateBaseTemplate(template)) return false;
    if (!template.type || typeof template.type !== 'string') return false;
    if (!Array.isArray(template.connections)) return false;
    if (typeof template.properties !== 'object') return false;
    if (typeof template.requirements !== 'object') return false;
    return true;
  }

  static validateInteractionTemplate(template) {
    if (!this.validateBaseTemplate(template)) return false;
    if (!template.prerequisites || typeof template.prerequisites !== 'object') return false;
    if (!Array.isArray(template.prerequisites.groups)) return false;
    if (typeof template.prerequisites.showWhenUnavailable !== 'boolean') return false;
    if (typeof template.prerequisites.unavailableMessage !== 'string') return false;
    if (!template.effects || typeof template.effects !== 'object') return false;
    if (!Array.isArray(template.effects.influenceChanges)) return false;
    if (!Array.isArray(template.effects.prestigeChanges)) return false;
    if (!Array.isArray(template.effects.alignmentChanges)) return false;
    if (!Array.isArray(template.options)) return false;
    return true;
  }

  static validateEventTemplate(template) {
    if (!this.validateBaseTemplate(template)) return false;
    if (!template.trigger || typeof template.trigger !== 'object') return false;
    if (!Array.isArray(template.conditions)) return false;
    if (!Array.isArray(template.actions)) return false;
    if (!Array.isArray(template.consequences)) return false;
    return true;
  }

  static validateGroupTemplate(template) {
    if (!this.validateBaseTemplate(template)) return false;
    if (!Array.isArray(template.members)) return false;
    if (typeof template.roles !== 'object') return false;
    if (typeof template.hierarchy !== 'object') return false;
    if (!Array.isArray(template.rules)) return false;
    return true;
  }

  static validateItemTemplate(template) {
    if (!this.validateBaseTemplate(template)) return false;
    if (!template.type || typeof template.type !== 'string') return false;
    if (typeof template.properties !== 'object') return false;
    if (typeof template.requirements !== 'object') return false;
    if (typeof template.effects !== 'object') return false;
    return true;
  }

  static validateTemplate(type, template) {
    switch (type) {
      case 'characters':
        return this.validateCharacterTemplate(template);
      case 'nodes':
        return this.validateNodeTemplate(template);
      case 'interactions':
        return this.validateInteractionTemplate(template);
      case 'events':
        return this.validateEventTemplate(template);
      case 'groups':
        return this.validateGroupTemplate(template);
      case 'items':
        return this.validateItemTemplate(template);
      default:
        return false;
    }
  }
}

export default TemplateValidator; 