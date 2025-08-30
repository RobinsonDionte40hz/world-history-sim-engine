// src/application/services/TemplateService.js

import Character from '../../../domain/entities/Character.js';
import Interaction from '../../../domain/entities/Interaction.js';
import Node from '../../../domain/entities/Node.js';
import Position from '../../../domain/value-objects/Positions.js';
import Attributes from '../../../domain/value-objects/Attributes.js';
import Environment from '../../../domain/value-objects/Environment.js';
import EnvironmentalPresetService from '../../../domain/services/EnvironmentalPresetService.js';
import EnvironmentalValidator from '../../../domain/services/EnvironmentalValidator.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

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

  // Create a new node template from an environmental preset
  createNodeTemplateFromPreset(presetId, config = {}) {
    const preset = EnvironmentalPresetService.getPreset(presetId);
    if (!preset) {
      throw new ValidationError('presetId', presetId, `Unknown environmental preset: ${presetId}`);
    }

    // Extract environment from config to avoid override issues
    const { environment: configEnvironment, ...otherConfig } = config;

    // Merge preset configuration with user overrides
    const templateConfig = {
      name: config.name || preset.name,
      description: config.description || preset.description,
      type: config.type || preset.nodeProperties.type,
      size: config.size || preset.nodeProperties.size,
      environment: {
        ...preset.environment,
        ...configEnvironment
      },
      presetId: presetId,
      environmentalTags: config.environmentalTags || [preset.category],
      position: config.position || {},
      interactions: config.interactions || [],
      ...otherConfig // Spread other config but not environment
    };

    return this.createNodeTemplate(templateConfig);
  }

  // Create a new node template with environmental support
  createNodeTemplate(config = {}) {
    // Validate environmental data if provided
    if (config.environment) {
      const validation = EnvironmentalValidator.validateEnvironment(config.environment);
      if (!validation.isValid) {
        throw new ValidationError('environment', config.environment, 
          `Environmental validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Create Environment instance for template
    const environment = config.environment ? 
      new Environment(config.environment) : 
      Environment.createDefault();

    const template = {
      id: crypto.randomUUID(),
      name: config.name || 'Unnamed Node Template',
      description: config.description || '',
      type: config.type || 'location',
      position: new Position(config.position || {}),
      interactions: config.interactions?.map(i => new Interaction(i)) || [],
      environment: environment.toJSON(), // Store as JSON for serialization
      size: config.size || 100,
      
      // Environmental template metadata
      environmentalMetadata: {
        presetId: config.presetId || null,
        customPreset: config.customPreset || false,
        environmentalTags: config.environmentalTags || [],
        dangerLevel: environment.getTotalHazardDanger(),
        comfortLevel: environment.getComfortLevel(),
        isHospitable: environment.isHospitable(),
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
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

  // Validate a template with enhanced environmental checks
  validateTemplate(template, type) {
    if (!template.name || !template.id) {
      throw new Error(`Invalid ${type} template: missing name or id`);
    }

    if (type === 'character' && !template.attributes) {
      throw new Error('Character template requires attributes');
    }

    if (type === 'node') {
      if (!template.position) {
        throw new Error('Node template requires position');
      }

      // Validate environmental data if present
      if (template.environment) {
        const validation = EnvironmentalValidator.validateEnvironment(template.environment, { warnings: false });
        if (!validation.isValid) {
          throw new Error(`Node template environmental validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Validate environmental metadata consistency
      if (template.environmentalMetadata && template.environment) {
        const environment = new Environment(template.environment);
        const calculatedDanger = environment.getTotalHazardDanger();
        const storedDanger = template.environmentalMetadata.dangerLevel;
        
        if (Math.abs(calculatedDanger - storedDanger) > 0.1) {
          throw new Error('Environmental metadata is inconsistent with environmental data');
        }
      }
    }

    return true;
  }

  // Apply environmental customizations to a template
  customizeTemplateEnvironment(templateId, environmentalChanges) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new ValidationError('templateId', templateId, 'Template not found');
    }

    // Validate environmental changes
    const currentEnvironment = template.environment || {};
    const updatedEnvironment = {
      ...currentEnvironment,
      ...environmentalChanges
    };

    const validation = EnvironmentalValidator.validateEnvironment(updatedEnvironment);
    if (!validation.isValid) {
      throw new ValidationError('environmentalChanges', environmentalChanges, 
        `Environmental validation failed: ${validation.errors.join(', ')}`);
    }

    // Update template
    template.environment = updatedEnvironment;
    template.environmentalMetadata = {
      ...template.environmentalMetadata,
      lastModified: new Date().toISOString(),
      customized: true
    };

    // Recalculate environmental metadata
    const environment = new Environment(updatedEnvironment);
    template.environmentalMetadata.dangerLevel = environment.getTotalHazardDanger();
    template.environmentalMetadata.comfortLevel = environment.getComfortLevel();
    template.environmentalMetadata.isHospitable = environment.isHospitable();

    this.saveTemplates();
    return template;
  }

  // Get environmental template recommendations
  getEnvironmentalTemplateRecommendations(criteria = {}) {
    const templates = this.templates.nodeTemplates || [];
    const recommendations = [];

    for (const template of templates) {
      let score = 0;
      const reasons = [];

      // Score based on criteria matching
      if (criteria.terrain && template.environment?.terrain === criteria.terrain) {
        score += 30;
        reasons.push(`matches ${criteria.terrain} terrain`);
      }

      if (criteria.climate && template.environment?.climate === criteria.climate) {
        score += 25;
        reasons.push(`compatible ${criteria.climate} climate`);
      }

      if (criteria.dangerLevel) {
        const templateDanger = template.environmentalMetadata?.dangerLevel || 0;
        const dangerDiff = Math.abs(templateDanger - criteria.dangerLevel);
        if (dangerDiff < 0.2) {
          score += 20;
          reasons.push('suitable danger level');
        }
      }

      if (criteria.hospitable !== undefined) {
        const templateHospitable = template.environmentalMetadata?.isHospitable || false;
        if (templateHospitable === criteria.hospitable) {
          score += 15;
          reasons.push(criteria.hospitable ? 'hospitable environment' : 'hostile environment');
        }
      }

      if (criteria.tags && Array.isArray(criteria.tags)) {
        const templateTags = template.environmentalMetadata?.environmentalTags || [];
        const matchingTags = criteria.tags.filter(tag => templateTags.includes(tag));
        if (matchingTags.length > 0) {
          score += matchingTags.length * 10;
          reasons.push(`matches tags: ${matchingTags.join(', ')}`);
        }
      }

      if (score > 0) {
        recommendations.push({
          template: template,
          score: score,
          reasons: reasons.join(', ') || 'general compatibility'
        });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  // Get template by ID from any category
  getTemplate(templateId) {
    const allTemplates = [
      ...this.templates.characterTemplates || [],
      ...this.templates.nodeTemplates || [],
      ...this.templates.interactionTemplates || []
    ];
    return allTemplates.find(t => t.id === templateId);
  }

  // Get environmental statistics for all node templates
  getEnvironmentalTemplateStatistics() {
    const nodeTemplates = this.templates.nodeTemplates || [];
    const stats = {
      totalTemplates: nodeTemplates.length,
      environmentalTemplates: 0,
      presetBased: 0,
      customEnvironments: 0,
      byTerrain: {},
      byClimate: {},
      byDangerLevel: { low: 0, medium: 0, high: 0 },
      hospitable: 0,
      inhospitable: 0
    };

    for (const template of nodeTemplates) {
      if (template.environment) {
        stats.environmentalTemplates++;

        // Count preset-based templates
        if (template.environmentalMetadata?.presetId) {
          stats.presetBased++;
        }

        // Count custom environments
        if (template.environmentalMetadata?.customized) {
          stats.customEnvironments++;
        }

        // Count by terrain
        const terrain = template.environment.terrain;
        if (terrain) {
          stats.byTerrain[terrain] = (stats.byTerrain[terrain] || 0) + 1;
        }

        // Count by climate
        const climate = template.environment.climate;
        if (climate) {
          stats.byClimate[climate] = (stats.byClimate[climate] || 0) + 1;
        }

        // Count by danger level
        const dangerLevel = template.environmentalMetadata?.dangerLevel || 0;
        if (dangerLevel < 0.3) {
          stats.byDangerLevel.low++;
        } else if (dangerLevel < 0.7) {
          stats.byDangerLevel.medium++;
        } else {
          stats.byDangerLevel.high++;
        }

        // Count hospitable vs inhospitable
        if (template.environmentalMetadata?.isHospitable) {
          stats.hospitable++;
        } else {
          stats.inhospitable++;
        }
      }
    }

    return stats;
  }

  // Instantiate a node template with enhanced environmental support
  instantiateNodeTemplate(template, overrides = {}) {
    if (!template) {
      throw new ValidationError('template', template, 'Template is required');
    }

    // Apply environmental preset if specified in overrides
    let environmentalData = template.environment || {};
    
    if (overrides.environmentalPresetId) {
      try {
        const presetData = EnvironmentalPresetService.applyPreset(
          { environment: environmentalData },
          overrides.environmentalPresetId,
          { environment: overrides.environment || {} }
        );
        environmentalData = presetData.environment;
      } catch (error) {
        throw new ValidationError(
          'environmentalPresetId', 
          overrides.environmentalPresetId, 
          `Failed to apply environmental preset: ${error.message}`
        );
      }
    } else if (overrides.environment) {
      // Merge environment overrides
      environmentalData = {
        ...environmentalData,
        ...overrides.environment
      };
    }

    // Validate final environmental data
    const validation = EnvironmentalValidator.validateEnvironment(environmentalData, { warnings: false });
    if (!validation.isValid) {
      throw new ValidationError('environment', environmentalData, 
        `Environmental validation failed: ${validation.errors.join(', ')}`);
    }

    // Create Environment instance
    const environment = new Environment(environmentalData);

    // Create enhanced node data
    const nodeData = {
      id: crypto.randomUUID(),
      name: overrides.name || template.name,
      description: overrides.description || template.description,
      type: overrides.type || template.type || 'location',
      position: new Position(overrides.position || template.position || {}),
      interactions: (overrides.interactions || template.interactions || []).map(i => 
        i instanceof Interaction ? i : new Interaction(i)
      ),
      environment: environment,
      size: overrides.size || template.size || 100,
      population: overrides.population || 0,
      connections: overrides.connections || [],
      customData: {
        ...template.customData,
        ...overrides.customData,
        templateId: template.id,
        instantiatedAt: new Date().toISOString(),
        environmentalPresetUsed: overrides.environmentalPresetId || template.environmentalMetadata?.presetId || null
      }
    };

    return new Node(nodeData);
  }

  // Legacy method for backward compatibility
  applyTemplate(template, overrides = {}) {
    // Determine template type
    const templateType = template.type || this._determineTemplateType(template);
    
    switch (templateType) {
      case 'character':
      case 'characterTemplates':
        return new Character({
          ...template,
          ...overrides,
          position: new Position(overrides.position || template.position),
          attributes: new Attributes(overrides.attributes || template.attributes),
        });
      case 'node':
      case 'nodeTemplates':
        // Use the enhanced node instantiation method
        return this.instantiateNodeTemplate(template, overrides);
      case 'interaction':
      case 'interactionTemplates':
        return new Interaction({ ...template, ...overrides });
      default:
        throw new Error(`Unknown template type: ${templateType}`);
    }
  }

  // Helper method to determine template type
  _determineTemplateType(template) {
    if (template.attributes) return 'character';
    if (template.position || template.environment) return 'node';
    if (template.branches || template.effects) return 'interaction';
    
    // Check which template array contains this template
    if (this.templates.characterTemplates?.includes(template)) return 'character';
    if (this.templates.nodeTemplates?.includes(template)) return 'node';
    if (this.templates.interactionTemplates?.includes(template)) return 'interaction';
    
    return 'unknown';
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

// Create singleton instance
const templateServiceInstance = new TemplateService();

export default templateServiceInstance;  // Singleton instance for global access