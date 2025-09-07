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
      settlements: new Map()  // Added for settlement templates with need satisfaction profiles
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
}

export default TemplateManager; 