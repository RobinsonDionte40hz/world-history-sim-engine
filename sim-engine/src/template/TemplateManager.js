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
      composite: new Map(),   // Added for composite templates (role sets, etc.)
      settlements: new Map(), // Added for settlement templates with need satisfaction profiles
      goals: new Map(),       // Added for goal templates
      archetypes: new Map()   // Added for custom character archetypes
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
      new Node(nodeConfig);
      return nodeConfig;
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
        new Node(template);
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
   * Instantiates a settlement template with need satisfaction data
   * @param {string} templateId - Template ID
   * @param {Object} customizations - Customizations to apply
   * @returns {Object} Instantiated settlement configuration
   */
  instantiateSettlementTemplate(templateId, customizations = {}) {
    const template = this.getTemplate('settlements', templateId);
    if (!template) {
      throw new Error(`Settlement template not found: ${templateId}`);
    }

    // Apply need satisfaction baseline
    const needSatisfaction = this._applyNeedSatisfactionBaseline(template, customizations);

    // Generate settlement configuration
    const settlementConfig = {
      ...template,
      ...customizations,
      id: customizations.id || `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: templateId,
      isTemplateInstance: true,
      needSatisfaction: {
        current: {
          ...needSatisfaction,
          lastCalculated: Date.now()
        },
        history: [],
        trends: {
          food: 0,
          water: 0,
          shelter: 0,
          goods: 0,
          services: 0,
          overall: 0
        },
        activeConsequences: []
      },
      population: {
        total: customizations.populationConfig?.basePopulation || template.populationConfig.basePopulation,
        composition: customizations.populationConfig?.composition || template.populationConfig.composition || {},
        growth: customizations.populationConfig?.growthRate || template.populationConfig.growthRate,
        migration: 0
      },
      resources: {
        types: Object.keys(template.resourceConfig.initialResources),
        amounts: { ...template.resourceConfig.initialResources },
        production: template.resourceConfig.productionRates || {},
        consumption: template.resourceConfig.consumptionRates || {},
        storage: template.resourceConfig.storageCapacity || {}
      },
      buildings: this._generateBuildingsFromTemplate(template),
      economy: {
        currency: {},
        trade: template.economicConfig.tradePartners?.map(partner => ({
          partner,
          resources: {},
          value: 0,
          frequency: 1
        })) || [],
        markets: [],
        taxes: template.economicConfig.taxStructure || {},
        income: {},
        expenses: {}
      },
      metadata: {
        ...template.metadata,
        instantiatedAt: new Date().toISOString(),
        customizations: Object.keys(customizations)
      }
    };

    return settlementConfig;
  }

  /**
   * Applies need satisfaction baseline from template
   * @private
   */
  _applyNeedSatisfactionBaseline(template, customizations) {
    const baseline = template.needSatisfactionBaseline;
    const needs = ['food', 'water', 'shelter', 'goods', 'services'];

    const satisfaction = {};
    let overall = 0;

    needs.forEach(need => {
      const config = baseline[need];
      let level = config.baseLevel;

      // Apply environmental modifiers
      if (customizations.environmentalModifiers) {
        const envModifier = customizations.environmentalModifiers[need];
        if (envModifier) {
          level = Math.max(0, Math.min(1, level + envModifier));
        }
      }

      // Apply custom modifiers
      if (customizations.needModifiers && customizations.needModifiers[need]) {
        level = Math.max(0, Math.min(1, level + customizations.needModifiers[need]));
      }

      satisfaction[need] = level;
      overall += level;
    });

    satisfaction.overall = overall / needs.length;
    return satisfaction;
  }

  /**
   * Generates buildings from template configuration
   * @private
   */
  _generateBuildingsFromTemplate(template) {
    const buildings = [];

    // Add required buildings
    template.buildingConfig.requiredBuildings.forEach((building, index) => {
      for (let i = 0; i < building.quantity; i++) {
        buildings.push({
          id: `${building.type}_${index}_${i}`,
          type: building.type,
          level: building.level,
          status: 'operational',
          capacity: this._calculateBuildingCapacity(building),
          occupants: [],
          production: {},
          maintenance: {}
        });
      }
    });

    // Add optional buildings based on probability
    template.buildingConfig.optionalBuildings.forEach((building, index) => {
      if (Math.random() < building.probability) {
        buildings.push({
          id: `${building.type}_optional_${index}`,
          type: building.type,
          level: building.level,
          status: 'operational',
          capacity: this._calculateBuildingCapacity(building),
          occupants: [],
          production: {},
          maintenance: {}
        });
      }
    });

    return buildings;
  }

  /**
   * Calculates building capacity based on type and level
   * @private
   */
  _calculateBuildingCapacity(building) {
    const baseCapacities = {
      house: 4,
      farm: 10,
      well: 50,
      workshop: 8,
      temple: 20,
      market: 30
    };

    const baseCapacity = baseCapacities[building.type] || 10;
    return Math.floor(baseCapacity * (1 + (building.level - 1) * 0.5));
  }

  /**
   * Creates preset settlement templates with different economic profiles
   * @param {string} profileType - Type of economic profile
   * @returns {Object} Preset template
   */
  createPresetSettlementTemplate(profileType) {
    const presets = {
      agrarian: {
        name: 'Agrarian Village',
        description: 'A farming-focused settlement with strong food production',
        type: 'village',
        size: 'medium',
        economicProfile: 'agrarian',
        needSatisfactionBaseline: {
          food: { baseLevel: 0.8, modifiers: {}, requirements: { farms: 3 } },
          water: { baseLevel: 0.6, modifiers: {}, requirements: { wells: 2 } },
          shelter: { baseLevel: 0.7, modifiers: {}, requirements: { houses: 15 } },
          goods: { baseLevel: 0.4, modifiers: {}, requirements: { workshops: 2 } },
          services: { baseLevel: 0.5, modifiers: {}, requirements: { temple: 1 } }
        },
        populationConfig: {
          basePopulation: 150,
          growthRate: 0.02,
          composition: { farmers: 60, craftsmen: 20, merchants: 10, clergy: 5, others: 5 },
          migrationFactors: { food: 0.3, economy: 0.2 }
        },
        resourceConfig: {
          initialResources: { food: 200, water: 300, wood: 100, stone: 50 },
          productionRates: { food: 15, water: 20 },
          consumptionRates: { food: 12, water: 18 },
          storageCapacity: { food: 500, water: 600 }
        },
        buildingConfig: {
          requiredBuildings: [
            { type: 'farm', level: 2, quantity: 3 },
            { type: 'house', level: 1, quantity: 15 },
            { type: 'well', level: 1, quantity: 2 }
          ],
          optionalBuildings: [
            { type: 'workshop', level: 1, probability: 0.6 },
            { type: 'temple', level: 1, probability: 0.4 }
          ]
        },
        economicConfig: {
          tradePartners: ['neighboring_village'],
          taxStructure: { income: 0.1, property: 0.05 },
          marketConfig: { general: true }
        }
      },

      commercial: {
        name: 'Trading Hub',
        description: 'A commerce-focused settlement with extensive trade networks',
        type: 'town',
        size: 'medium',
        economicProfile: 'commercial',
        needSatisfactionBaseline: {
          food: { baseLevel: 0.6, modifiers: {}, requirements: { farms: 2 } },
          water: { baseLevel: 0.7, modifiers: {}, requirements: { wells: 3 } },
          shelter: { baseLevel: 0.8, modifiers: {}, requirements: { houses: 25 } },
          goods: { baseLevel: 0.9, modifiers: {}, requirements: { workshops: 5, markets: 2 } },
          services: { baseLevel: 0.7, modifiers: {}, requirements: { temple: 1, administrative: 1 } }
        },
        populationConfig: {
          basePopulation: 300,
          growthRate: 0.03,
          composition: { merchants: 40, craftsmen: 25, farmers: 15, administrators: 10, others: 10 },
          migrationFactors: { economy: 0.4, goods: 0.3 }
        },
        resourceConfig: {
          initialResources: { food: 150, water: 400, gold: 500, spices: 100 },
          productionRates: { goods: 25, services: 15 },
          consumptionRates: { food: 20, water: 25 },
          storageCapacity: { food: 300, water: 800, goods: 1000 }
        },
        buildingConfig: {
          requiredBuildings: [
            { type: 'market', level: 2, quantity: 2 },
            { type: 'workshop', level: 2, quantity: 5 },
            { type: 'house', level: 1, quantity: 25 }
          ],
          optionalBuildings: [
            { type: 'temple', level: 1, probability: 0.7 },
            { type: 'administrative', level: 1, probability: 0.8 }
          ]
        },
        economicConfig: {
          tradePartners: ['major_city', 'port_town', 'mining_village'],
          taxStructure: { trade: 0.15, income: 0.08 },
          marketConfig: { general: true, luxury: true }
        }
      },

      industrial: {
        name: 'Industrial Center',
        description: 'A manufacturing-focused settlement with advanced production',
        type: 'town',
        size: 'large',
        economicProfile: 'industrial',
        needSatisfactionBaseline: {
          food: { baseLevel: 0.5, modifiers: {}, requirements: { farms: 1 } },
          water: { baseLevel: 0.8, modifiers: {}, requirements: { wells: 4, aqueduct: 1 } },
          shelter: { baseLevel: 0.6, modifiers: {}, requirements: { houses: 40 } },
          goods: { baseLevel: 0.95, modifiers: {}, requirements: { workshops: 8, factories: 3 } },
          services: { baseLevel: 0.6, modifiers: {}, requirements: { temple: 1, hospital: 1 } }
        },
        populationConfig: {
          basePopulation: 500,
          growthRate: 0.025,
          composition: { craftsmen: 50, laborers: 30, merchants: 10, engineers: 5, others: 5 },
          migrationFactors: { jobs: 0.4, goods: 0.3 }
        },
        resourceConfig: {
          initialResources: { food: 100, water: 600, iron: 200, coal: 150 },
          productionRates: { goods: 40, tools: 20 },
          consumptionRates: { food: 35, water: 40 },
          storageCapacity: { food: 200, water: 1000, goods: 1500 }
        },
        buildingConfig: {
          requiredBuildings: [
            { type: 'workshop', level: 3, quantity: 8 },
            { type: 'factory', level: 2, quantity: 3 },
            { type: 'house', level: 1, quantity: 40 }
          ],
          optionalBuildings: [
            { type: 'hospital', level: 1, probability: 0.6 },
            { type: 'aqueduct', level: 1, probability: 0.8 }
          ]
        },
        economicConfig: {
          tradePartners: ['raw_materials_town', 'major_city'],
          taxStructure: { production: 0.12, income: 0.1 },
          marketConfig: { industrial: true, general: true }
        }
      }
    };

    if (!presets[profileType]) {
      throw new Error(`Unknown preset type: ${profileType}`);
    }

    const preset = presets[profileType];
    const template = {
      id: `preset_${profileType}_${Date.now()}`,
      name: preset.name,
      description: preset.description,
      version: '1.0.0',
      tags: ['preset', profileType, 'need-satisfaction'],
      ...preset,
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        author: 'System',
        type: 'settlement-preset',
        profileType
      }
    };

    return this.addTemplate('settlements', template);
  }

  /**
   * Validates settlement template need satisfaction requirements
   * @param {string} templateId - Template ID
   * @returns {Object} Validation result
   */
  validateSettlementTemplateNeeds(templateId) {
    const template = this.getTemplate('settlements', templateId);
    if (!template) {
      return {
        isValid: false,
        errors: ['Template not found'],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    // Validate need satisfaction baseline
    const needs = ['food', 'water', 'shelter', 'goods', 'services'];
    needs.forEach(need => {
      const config = template.needSatisfactionBaseline[need];
      if (!config) {
        errors.push(`Missing ${need} configuration`);
        return;
      }

      if (config.baseLevel < 0 || config.baseLevel > 1) {
        errors.push(`${need} base level must be between 0 and 1`);
      }

      // Check if requirements can be met by buildings
      const requirements = config.requirements;
      if (requirements) {
        Object.entries(requirements).forEach(([reqType, reqCount]) => {
          const availableBuildings = template.buildingConfig.requiredBuildings.filter(
            b => b.type === reqType
          ).length;

          if (availableBuildings < reqCount) {
            warnings.push(`Insufficient ${reqType} buildings for ${need} requirement (${availableBuildings}/${reqCount})`);
          }
        });
      }
    });

    // Validate population vs building capacity
    const totalHousingCapacity = template.buildingConfig.requiredBuildings
      .filter(b => b.type === 'house')
      .reduce((total, building) => total + (this._calculateBuildingCapacity(building) * building.quantity), 0);

    if (totalHousingCapacity < template.populationConfig.basePopulation) {
      warnings.push(`Housing capacity (${totalHousingCapacity}) insufficient for base population (${template.populationConfig.basePopulation})`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Instantiates a goal template for a character
   * @param {string} templateId - Goal template ID
   * @param {Object} character - Character to assign the goal to
   * @param {Object} customizations - Customizations to apply
   * @returns {Object} Instantiated goal
   */
  instantiateGoalTemplate(templateId, character, customizations = {}) {
    const template = this.getTemplate('goals', templateId);
    if (!template) {
      throw new Error(`Goal template not found: ${templateId}`);
    }

    // Validate character meets requirements
    const validation = this._validateGoalRequirements(template, character);
    if (!validation.isValid) {
      throw new Error(`Character does not meet goal requirements: ${validation.errors.join(', ')}`);
    }

    // Create goal instance
    const goalInstance = {
      id: `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      priority: template.priority,

      // Progress tracking
      progress: 0,
      currentStep: 0,
      completedSteps: [],
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),

      // Steps and requirements
      steps: template.steps.map(step => ({
        ...step,
        completed: false,
        startedAt: null,
        completedAt: null,
        attempts: 0
      })),

      // Status
      status: 'active', // 'active', 'completed', 'failed', 'paused'
      success_conditions: template.success_conditions,
      rewards: template.rewards,
      consequences: template.consequences,

      // Character-specific data
      characterId: character.id,
      customizations: customizations,

      // Metadata
      metadata: {
        ...template.metadata,
        instantiatedAt: new Date().toISOString(),
        characterId: character.id,
        templateVersion: template.version
      }
    };

    return goalInstance;
  }

  /**
   * Validates if a character meets goal requirements
   * @param {Object} template - Goal template
   * @param {Object} character - Character to validate
   * @returns {Object} Validation result
   * @private
   */
  _validateGoalRequirements(template, character) {
    const errors = [];

    // Age requirements
    if (template.requirements.age) {
      const age = character.age || 0;
      if (template.requirements.age.min && age < template.requirements.age.min) {
        errors.push(`Character too young (minimum: ${template.requirements.age.min})`);
      }
      if (template.requirements.age.max && age > template.requirements.age.max) {
        errors.push(`Character too old (maximum: ${template.requirements.age.max})`);
      }
    }

    // Attribute requirements
    if (template.requirements.attributes) {
      Object.entries(template.requirements.attributes).forEach(([attr, required]) => {
        const current = character.attributes?.[attr]?.score || 0;
        if (current < required) {
          errors.push(`Insufficient ${attr} (required: ${required}, current: ${current})`);
        }
      });
    }

    // Personality requirements
    if (template.requirements.personality) {
      Object.entries(template.requirements.personality).forEach(([trait, required]) => {
        const current = character.personality?.[trait] || 0;
        if (current < required) {
          errors.push(`Insufficient ${trait} (required: ${required}, current: ${current})`);
        }
      });
    }

    // Relationship status requirements
    if (template.requirements.relationship_status) {
      const current = character.relationship_status || 'single';
      if (current !== template.requirements.relationship_status) {
        errors.push(`Wrong relationship status (required: ${template.requirements.relationship_status}, current: ${current})`);
      }
    }

    // Resource requirements
    if (template.requirements.resources) {
      Object.entries(template.requirements.resources).forEach(([resource, required]) => {
        const current = character.resources?.[resource] || 0;
        if (current < required) {
          errors.push(`Insufficient ${resource} (required: ${required}, current: ${current})`);
        }
      });
    }

    // Children requirements
    if (template.requirements.children) {
      const currentChildren = character.children || 0;
      if (template.requirements.children.min && currentChildren < template.requirements.children.min) {
        errors.push(`Insufficient children (required: ${template.requirements.children.min}, current: ${currentChildren})`);
      }
      if (template.requirements.children.max && currentChildren > template.requirements.children.max) {
        errors.push(`Too many children (maximum: ${template.requirements.children.max}, current: ${currentChildren})`);
      }
    }

    // Skills requirements
    if (template.requirements.skills) {
      template.requirements.skills.forEach(skill => {
        if (!character.skills?.includes(skill)) {
          errors.push(`Missing required skill: ${skill}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Updates goal progress based on character actions
   * @param {Object} goal - Goal instance
   * @param {string} action - Action performed
   * @param {Object} context - Action context
   * @returns {Object} Updated goal
   */
  updateGoalProgress(goal, action, context = {}) {
    if (goal.status !== 'active') {
      return goal;
    }

    const currentStep = goal.steps[goal.currentStep];
    if (!currentStep || currentStep.completed) {
      return goal;
    }

    // Check if action matches current step requirements
    const actionMatches = currentStep.actions.includes(action);
    if (!actionMatches) {
      return goal;
    }

    // Update step progress
    currentStep.attempts++;

    // Check if step is completed
    const stepCompleted = this._checkStepCompletion(currentStep, context);
    if (stepCompleted) {
      currentStep.completed = true;
      currentStep.completedAt = new Date().toISOString();
      goal.completedSteps.push(currentStep.id);

      // Move to next step
      goal.currentStep++;
      goal.progress = (goal.completedSteps.length / goal.steps.length) * 100;

      // Check if goal is completed
      if (goal.currentStep >= goal.steps.length) {
        goal.status = 'completed';
        goal.completedAt = new Date().toISOString();
      }
    }

    goal.lastUpdated = new Date().toISOString();
    return goal;
  }

  /**
   * Checks if a goal step is completed
   * @param {Object} step - Goal step
   * @param {Object} context - Action context
   * @returns {boolean} Whether step is completed
   * @private
   */
  _checkStepCompletion(step, context) {
    // Simple implementation - in a real system this would be more sophisticated
    // For now, assume steps complete after a certain number of attempts
    return step.attempts >= 1; // Could be based on success_probability, context, etc.
  }

  /**
   * Gets available goals for a character based on their current state
   * @param {Object} character - Character to check goals for
   * @returns {Array} Available goal templates
   */
  getAvailableGoalsForCharacter(character) {
    const allGoals = this.getAllTemplates('goals');
    return allGoals.filter(template => {
      const validation = this._validateGoalRequirements(template, character);
      return validation.isValid;
    });
  }

  /**
   * Creates preset family aspiration goal templates
   * @returns {Array} Created goal templates
   */
  createFamilyAspirationGoalTemplates() {
    const familyGoals = [
      {
        id: 'find_partner',
        name: 'Find a Partner',
        description: 'Find a compatible romantic partner to start a relationship',
        type: 'social',
        category: 'family',
        priority: 'medium',
        requirements: {
          age: { min: 18, max: 50 },
          attributes: { charisma: 10 },
          personality: { empathy: 0.3 },
          relationship_status: 'single'
        },
        steps: [
          {
            id: 'socialize_in_settlement',
            name: 'Socialize in Settlement',
            description: 'Spend time in social areas of the settlement to meet people',
            order: 1,
            requirements: {},
            actions: ['socialize', 'attend_social_event', 'visit_tavern'],
            duration: 7,
            success_probability: 0.8
          },
          {
            id: 'identify_compatible_partner',
            name: 'Identify Compatible Partner',
            description: 'Find someone with compatible personality and interests',
            order: 2,
            requirements: { social_interactions: 5 },
            actions: ['meet_people', 'converse', 'share_interests'],
            duration: 14,
            success_probability: 0.6
          },
          {
            id: 'build_romantic_relationship',
            name: 'Build Romantic Relationship',
            description: 'Develop a romantic connection with the partner',
            order: 3,
            requirements: { conversations: 10 },
            actions: ['date', 'court', 'romantic_gesture', 'spend_time_together'],
            duration: 30,
            success_probability: 0.7
          },
          {
            id: 'propose_marriage',
            name: 'Propose Marriage',
            description: 'Formally propose marriage to your partner',
            order: 4,
            requirements: { relationship_bond: 70 },
            actions: ['propose_marriage'],
            duration: 1,
            success_probability: 0.8
          }
        ],
        success_conditions: {
          primary: 'marriage_proposal_accepted',
          secondary: ['romantic_relationship_established'],
          time_limit: 180,
          failure_conditions: ['partner_rejects_proposal', 'relationship_ends']
        },
        rewards: {
          experience: 500,
          attributes: { charisma: 1, wisdom: 1 },
          relationships: { partner: 50 },
          reputation: 10,
          resources: { happiness: 20 }
        },
        consequences: {
          success: {
            immediate: { happiness: 20, social_status: 5 },
            long_term: { relationship_status: 'dating', marriage_potential: true }
          },
          failure: {
            immediate: { happiness: -10, social_penalty: -5 },
            long_term: { dating_cooldown: 30, reputation_penalty: -2 }
          }
        },
        metadata: {
          difficulty: 'medium',
          estimated_duration: 52,
          social_impact: 0.8,
          economic_impact: 0.1,
          historical_significance: 0.3,
          tags: ['romance', 'courtship', 'marriage', 'social']
        }
      },

      {
        id: 'start_family',
        name: 'Start a Family',
        description: 'Build a stable family unit with children',
        type: 'family',
        category: 'family',
        priority: 'high',
        requirements: {
          relationship_status: 'married',
          resources: { housing: 1, income: 100 },
          attributes: { constitution: 12, wisdom: 10 },
          age: { min: 20, max: 45 }
        },
        steps: [
          {
            id: 'establish_stable_home',
            name: 'Establish Stable Home',
            description: 'Secure adequate housing and financial stability',
            order: 1,
            requirements: { housing: 1, savings: 200 },
            actions: ['purchase_house', 'save_money', 'improve_home'],
            duration: 30,
            success_probability: 0.9
          },
          {
            id: 'prepare_for_parenthood',
            name: 'Prepare for Parenthood',
            description: 'Learn about childcare and prepare emotionally',
            order: 2,
            requirements: { knowledge_childcare: 1 },
            actions: ['study_childcare', 'discuss_parenthood', 'visit_families'],
            duration: 14,
            success_probability: 0.8
          },
          {
            id: 'conceive_child',
            name: 'Conceive Child',
            description: 'Successfully conceive a child',
            order: 3,
            requirements: { health: 80, partner_health: 80 },
            actions: ['intimate_encounter', 'consult_healer'],
            duration: 30,
            success_probability: 0.7
          },
          {
            id: 'prepare_for_birth',
            name: 'Prepare for Birth',
            description: 'Prepare home and resources for newborn',
            order: 4,
            requirements: { nursery_prepared: true, supplies_ready: true },
            actions: ['prepare_nursery', 'stock_supplies', 'hire_help'],
            duration: 7,
            success_probability: 0.9
          }
        ],
        success_conditions: {
          primary: 'child_born_healthy',
          secondary: ['home_prepared', 'family_stable'],
          time_limit: 180,
          failure_conditions: ['miscarriage', 'health_complications']
        },
        rewards: {
          experience: 1000,
          attributes: { wisdom: 2, constitution: 1 },
          relationships: { spouse: 20, child: 100 },
          reputation: 15,
          resources: { happiness: 30, family_legacy: 1 }
        },
        consequences: {
          success: {
            immediate: { happiness: 50, family_bond: 30 },
            long_term: { legacy: 1, family_lineage: true, parental_responsibility: true }
          },
          failure: {
            immediate: { happiness: -30, health_penalty: -10 },
            long_term: { fertility_penalty: -20, emotional_trauma: 15 }
          }
        },
        metadata: {
          difficulty: 'hard',
          estimated_duration: 81,
          social_impact: 0.9,
          economic_impact: 0.6,
          historical_significance: 0.7,
          tags: ['parenthood', 'legacy', 'stability']
        }
      },

      {
        id: 'raise_family',
        name: 'Raise a Family',
        description: 'Successfully raise children to adulthood',
        type: 'family',
        category: 'family',
        priority: 'high',
        requirements: {
          children: { min: 1 },
          resources: { housing: 1, income: 150 },
          attributes: { wisdom: 12 },
          personality: { patience: 0.5 }
        },
        steps: [
          {
            id: 'infant_care',
            name: 'Infant Care',
            description: 'Care for infant needs and development',
            order: 1,
            requirements: { child_age: 1 },
            actions: ['feed_child', 'change_diapers', 'bond_with_child'],
            duration: 365,
            success_probability: 0.85
          },
          {
            id: 'early_education',
            name: 'Early Education',
            description: 'Teach basic skills and values',
            order: 2,
            requirements: { child_age: 5 },
            actions: ['teach_basic_skills', 'read_stories', 'teach_manners'],
            duration: 1825, // 5 years
            success_probability: 0.8
          },
          {
            id: 'adolescent_guidance',
            name: 'Adolescent Guidance',
            description: 'Guide teenager through challenges',
            order: 3,
            requirements: { child_age: 13 },
            actions: ['provide_guidance', 'set_boundaries', 'support_growth'],
            duration: 2190, // 6 years
            success_probability: 0.75
          },
          {
            id: 'launch_adult',
            name: 'Launch into Adulthood',
            description: 'Prepare child for independent life',
            order: 4,
            requirements: { child_age: 18 },
            actions: ['teach_life_skills', 'provide_resources', 'emotional_support'],
            duration: 365,
            success_probability: 0.9
          }
        ],
        success_conditions: {
          primary: 'child_becomes_adult',
          secondary: ['child_healthy', 'child_educated', 'family_bond_strong'],
          time_limit: 6570, // 18 years
          failure_conditions: ['child_dies', 'child_runs_away', 'family_breaks_apart']
        },
        rewards: {
          experience: 2000,
          attributes: { wisdom: 3, charisma: 1 },
          relationships: { child: 80, spouse: 40 },
          reputation: 25,
          resources: { legacy_points: 50, family_honor: 20 }
        },
        consequences: {
          success: {
            immediate: { happiness: 60, fulfillment: 40 },
            long_term: { legacy: 2, family_continuity: true, wisdom_boost: 10 }
          },
          failure: {
            immediate: { happiness: -50, grief: 30 },
            long_term: { emotional_scars: 20, family_reputation_penalty: -10 }
          }
        },
        metadata: {
          difficulty: 'hard',
          estimated_duration: 6570,
          social_impact: 0.95,
          economic_impact: 0.7,
          historical_significance: 0.8,
          tags: ['parenting', 'legacy', 'nurturing', 'long-term']
        }
      },

      {
        id: 'family_legacy',
        name: 'Build Family Legacy',
        description: 'Create a lasting family legacy through generations',
        type: 'family',
        category: 'family',
        priority: 'critical',
        requirements: {
          children: { min: 2 },
          resources: { wealth: 1000, property: 5 },
          attributes: { wisdom: 15, leadership: 12 },
          age: { min: 40 }
        },
        steps: [
          {
            id: 'establish_family_business',
            name: 'Establish Family Business',
            description: 'Create a sustainable family business or enterprise',
            order: 1,
            requirements: { capital: 500 },
            actions: ['start_business', 'hire_family', 'build_reputation'],
            duration: 365,
            success_probability: 0.7
          },
          {
            id: 'build_family_wealth',
            name: 'Build Family Wealth',
            description: 'Accumulate wealth and assets for future generations',
            order: 2,
            requirements: { business_profit: 1000 },
            actions: ['invest_wisely', 'diversify_assets', 'save_for_future'],
            duration: 1825, // 5 years
            success_probability: 0.8
          },
          {
            id: 'educate_heirs',
            name: 'Educate Heirs',
            description: 'Ensure children receive proper education and training',
            order: 3,
            requirements: { children_educated: true },
            actions: ['hire_tutors', 'send_to_school', 'teach_family_values'],
            duration: 2190, // 6 years
            success_probability: 0.85
          },
          {
            id: 'create_family_traditions',
            name: 'Create Family Traditions',
            description: 'Establish lasting family traditions and values',
            order: 4,
            requirements: { family_bonds: 80 },
            actions: ['organize_family_events', 'document_history', 'teach_heritage'],
            duration: 365,
            success_probability: 0.9
          }
        ],
        success_conditions: {
          primary: 'multi_generational_success',
          secondary: ['business_established', 'wealth_accumulated', 'heirs_prepared'],
          time_limit: 7300, // 20 years
          failure_conditions: ['business_failure', 'family_dissolution', 'heir_death']
        },
        rewards: {
          experience: 5000,
          attributes: { wisdom: 5, leadership: 3 },
          relationships: { family: 100, community: 50 },
          reputation: 50,
          resources: { legacy_points: 100, family_influence: 30 }
        },
        consequences: {
          success: {
            immediate: { fulfillment: 80, pride: 60 },
            long_term: { historical_legacy: true, family_name_eternal: true }
          },
          failure: {
            immediate: { disappointment: -60, stress: 40 },
            long_term: { family_name_tarnished: true, personal_regret: 30 }
          }
        },
        metadata: {
          difficulty: 'legendary',
          estimated_duration: 7300,
          social_impact: 0.9,
          economic_impact: 0.95,
          historical_significance: 0.9,
          tags: ['legacy', 'wealth', 'tradition', 'multi-generational']
        }
      }
    ];

    const createdTemplates = [];
    familyGoals.forEach(goalData => {
      const template = {
        ...goalData,
        version: '1.0.0',
        tags: ['family', 'aspiration', goalData.type, goalData.category],
        metadata: {
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          author: 'System',
          type: 'goal-template',
          ...goalData.metadata
        }
      };

      this.addTemplate('goals', template);
      createdTemplates.push(template);
    });

    return createdTemplates;
  }
}

export default TemplateManager; 