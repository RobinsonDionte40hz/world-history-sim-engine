// Currently not using specific template types, commenting out unused imports
// import {
//   BaseTemplate,
//   CharacterTemplate,
//   NodeTemplate,
//   InteractionTemplate,
//   EventTemplate,
//   GroupTemplate,
//   ItemTemplate
// } from './TemplateTypes';

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

  static validateSettlementTemplate(template) {
    if (!this.validateBaseTemplate(template)) return false;
    if (!template.type || typeof template.type !== 'string') return false;
    if (!template.size || typeof template.size !== 'string') return false;
    if (!template.economicProfile || typeof template.economicProfile !== 'string') return false;

    // Validate need satisfaction baseline
    if (!template.needSatisfactionBaseline || typeof template.needSatisfactionBaseline !== 'object') return false;
    const needs = ['food', 'water', 'shelter', 'goods', 'services'];
    for (const need of needs) {
      if (!template.needSatisfactionBaseline[need] || typeof template.needSatisfactionBaseline[need] !== 'object') return false;
      const needConfig = template.needSatisfactionBaseline[need];
      if (typeof needConfig.baseLevel !== 'number' || needConfig.baseLevel < 0 || needConfig.baseLevel > 1) return false;
      if (typeof needConfig.modifiers !== 'object') return false;
      if (typeof needConfig.requirements !== 'object') return false;
    }

    // Validate population config
    if (!template.populationConfig || typeof template.populationConfig !== 'object') return false;
    if (typeof template.populationConfig.basePopulation !== 'number') return false;
    if (typeof template.populationConfig.growthRate !== 'number') return false;

    // Validate resource config
    if (!template.resourceConfig || typeof template.resourceConfig !== 'object') return false;
    if (typeof template.resourceConfig.initialResources !== 'object') return false;

    // Validate building config
    if (!template.buildingConfig || typeof template.buildingConfig !== 'object') return false;
    if (!Array.isArray(template.buildingConfig.requiredBuildings)) return false;
    if (!Array.isArray(template.buildingConfig.optionalBuildings)) return false;

    return true;
  }

  static validateGoalTemplate(template) {
    if (!this.validateBaseTemplate(template)) return false;
    if (!template.type || typeof template.type !== 'string') return false;
    if (!template.category || typeof template.category !== 'string') return false;
    if (!template.priority || typeof template.priority !== 'string') return false;

    // Validate requirements
    if (!template.requirements || typeof template.requirements !== 'object') return false;

    // Validate steps
    if (!Array.isArray(template.steps)) return false;
    for (const step of template.steps) {
      if (!step.id || typeof step.id !== 'string') return false;
      if (!step.name || typeof step.name !== 'string') return false;
      if (!step.description || typeof step.description !== 'string') return false;
      if (typeof step.order !== 'number') return false;
      if (!Array.isArray(step.actions)) return false;
      if (typeof step.duration !== 'number') return false;
      if (typeof step.success_probability !== 'number' || step.success_probability < 0 || step.success_probability > 1) return false;
    }

    // Validate success conditions
    if (!template.success_conditions || typeof template.success_conditions !== 'object') return false;
    if (!template.success_conditions.primary || typeof template.success_conditions.primary !== 'string') return false;
    if (!Array.isArray(template.success_conditions.secondary)) return false;

    // Validate rewards
    if (!template.rewards || typeof template.rewards !== 'object') return false;

    // Validate consequences
    if (!template.consequences || typeof template.consequences !== 'object') return false;
    if (!template.consequences.success || typeof template.consequences.success !== 'object') return false;
    if (!template.consequences.failure || typeof template.consequences.failure !== 'object') return false;

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
      case 'settlements':
        return this.validateSettlementTemplate(template);
      case 'goals':
        return this.validateGoalTemplate(template);
      default:
        return false;
    }
  }
}

export default TemplateValidator; 