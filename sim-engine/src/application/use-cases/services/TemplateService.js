// src/application/services/TemplateService.js

import Character from '../domain/entities/Character.js';
import Interaction from '../domain/entities/Interaction.js';
import Position from '../domain/entities/Position.js';
import Attributes from '../domain/entities/Attributes.js';

class TemplateService {
  constructor() {
    this.templates = this.loadTemplates() || {
      characterTemplates: [],
      nodeTemplates: [],
      interactionTemplates: [],
    };
  }

  // Create a new character template
  createCharacterTemplate(config = {}) {
    const template = {
      id: crypto.randomUUID(),
      name: config.name || 'Unnamed NPC Template',
      description: config.description || '',
      consciousness: {
        frequency: config.consciousness?.frequency || 40,  // 40 Hz gamma baseline
        coherence: this.calculateInitialCoherence(config.environment || {}),  // Node-dependent
      },
      personality: config.personality || { aggression: 0.5, curiosity: 0.5 },
      attributes: new Attributes(config.attributes || {
        strength: { score: 10 },
        dexterity: { score: 10 },
        // ... other defaults
      }),
      goals: config.goals || [{ id: 'gather_resources', progress: 0 }],
    };
    this.templates.characterTemplates.push(template);
    this.saveTemplates();
    return template;
  }

  // Create a new node template
  createNodeTemplate(config = {}) {
    const template = {
      id: crypto.randomUUID(),
      name: config.name || 'Unnamed Node Template',
      description: config.description || '',
      position: new Position(config.position || {}),
      interactions: config.interactions?.map(i => new Interaction(i)) || [],
      environment: config.environment || { density: 0.5 },  // For coherence calc
    };
    this.templates.nodeTemplates.push(template);
    this.saveTemplates();
    return template;
  }

  // Create a new interaction template
  createInteractionTemplate(config = {}) {
    const template = new Interaction({
      id: crypto.randomUUID(),
      name: config.name || 'Unnamed Interaction Template',
      description: config.description || '',
      type: config.type || 'dialogue',
      requirements: config.requirements || [],
      branches: config.branches || [],
      effects: config.effects || [],
    });
    this.templates.interactionTemplates.push(template);
    this.saveTemplates();
    return template;
  }

  // Validate a template (basic checks)
  validateTemplate(template, type) {
    if (!template.name || !template.id) {
      throw new Error(`Invalid ${type} template: missing name or id`);
    }
    if (type === 'character' && !template.attributes) {
      throw new Error('Character template requires attributes');
    }
    if (type === 'node' && !template.position) {
      throw new Error('Node template requires position');
    }
    return true;
  }

  // Apply a template to create an instance
  applyTemplate(template, overrides = {}) {
    switch (template.type || Object.keys(this.templates).find(t => this.templates[t].includes(template))) {
      case 'characterTemplates':
        return new Character({
          ...template,
          ...overrides,
          position: new Position(overrides.position || template.position),
          attributes: new Attributes(overrides.attributes || template.attributes),
        });
      case 'nodeTemplates':
        return {
          ...template,
          ...overrides,
          position: new Position(overrides.position || template.position),
          interactions: template.interactions.map(i => new Interaction(i)),
        };
      case 'interactionTemplates':
        return new Interaction({ ...template, ...overrides });
      default:
        throw new Error('Unknown template type');
    }
  }

  // Calculate initial coherence based on environment (quantum-inspired)
  calculateInitialCoherence(environment) {
    // Simulate ordered water shielding (papers' 0.28 nm spacing) with density
    const densityFactor = environment.density || Math.random() * 0.5 + 0.5;  // 0.5-1.0
    const baseCoherence = 0.7;  // Default from papers' microtubule coherence
    return Math.min(1, baseCoherence * densityFactor);  // Caps at 1
  }

  // Save templates to localStorage (reused from old project)
  saveTemplates() {
    localStorage.setItem('templates', JSON.stringify(this.templates));
  }

  // Load templates from localStorage
  loadTemplates() {
    const saved = JSON.parse(localStorage.getItem('templates') || '{}');
    return {
      characterTemplates: saved.characterTemplates || [],
      nodeTemplates: saved.nodeTemplates || [],
      interactionTemplates: saved.interactionTemplates || [],
    };
  }
}

export default new TemplateService();  // Singleton instance for global access