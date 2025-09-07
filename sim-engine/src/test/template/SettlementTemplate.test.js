// src/test/template/SettlementTemplate.test.js

import TemplateManager from '../../template/TemplateManager.js';
import TemplateValidator from '../../template/TemplateValidator.js';

describe('Settlement Template System', () => {
  let templateManager;

  beforeEach(() => {
    templateManager = new TemplateManager();
  });

  describe('Settlement Template Creation', () => {
    test('should create a valid settlement template', () => {
      const templateData = {
        id: 'test_settlement_template',
        name: 'Test Settlement',
        description: 'A test settlement template',
        version: '1.0.0',
        tags: ['test', 'settlement'],
        type: 'village',
        size: 'small',
        economicProfile: 'agrarian',
        needSatisfactionBaseline: {
          food: {
            baseLevel: 0.8,
            modifiers: { terrain: 0.1 },
            requirements: { farms: 2 }
          },
          water: {
            baseLevel: 0.7,
            modifiers: {},
            requirements: { wells: 1 }
          },
          shelter: {
            baseLevel: 0.6,
            modifiers: {},
            requirements: { houses: 10 }
          },
          goods: {
            baseLevel: 0.5,
            modifiers: {},
            requirements: { workshops: 1 }
          },
          services: {
            baseLevel: 0.4,
            modifiers: {},
            requirements: { temple: 1 }
          }
        },
        populationConfig: {
          basePopulation: 100,
          growthRate: 0.02,
          composition: { farmers: 50, others: 50 },
          migrationFactors: {}
        },
        resourceConfig: {
          initialResources: { food: 100, water: 150 },
          productionRates: {},
          consumptionRates: {},
          storageCapacity: {}
        },
        buildingConfig: {
          requiredBuildings: [
            { type: 'house', level: 1, quantity: 10 },
            { type: 'farm', level: 1, quantity: 2 }
          ],
          optionalBuildings: [
            { type: 'workshop', level: 1, probability: 0.5 }
          ]
        },
        economicConfig: {
          tradePartners: [],
          taxStructure: {},
          marketConfig: {}
        },
        metadata: {
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      };

      const template = templateManager.addTemplate('settlements', templateData);

      expect(template).toBeDefined();
      expect(template.id).toBe('test_settlement_template');
      expect(template.type).toBe('village');
      expect(template.economicProfile).toBe('agrarian');
    });

    test('should validate settlement template structure', () => {
      const validTemplate = {
        id: 'valid_template',
        name: 'Valid Template',
        description: 'A valid template',
        version: '1.0.0',
        tags: ['test'],
        type: 'village',
        size: 'small',
        economicProfile: 'agrarian',
        needSatisfactionBaseline: {
          food: { baseLevel: 0.8, modifiers: {}, requirements: {} },
          water: { baseLevel: 0.7, modifiers: {}, requirements: {} },
          shelter: { baseLevel: 0.6, modifiers: {}, requirements: {} },
          goods: { baseLevel: 0.5, modifiers: {}, requirements: {} },
          services: { baseLevel: 0.4, modifiers: {}, requirements: {} }
        },
        populationConfig: {
          basePopulation: 100,
          growthRate: 0.02
        },
        resourceConfig: {
          initialResources: {}
        },
        buildingConfig: {
          requiredBuildings: [],
          optionalBuildings: []
        },
        economicConfig: {
          tradePartners: [],
          taxStructure: {},
          marketConfig: {}
        },
        metadata: {}
      };

      const isValid = TemplateValidator.validateSettlementTemplate(validTemplate);
      expect(isValid).toBe(true);
    });

    test('should reject invalid settlement template', () => {
      const invalidTemplate = {
        id: 'invalid_template',
        name: 'Invalid Template',
        description: 'An invalid template',
        version: '1.0.0',
        tags: ['test']
        // Missing required fields
      };

      const isValid = TemplateValidator.validateSettlementTemplate(invalidTemplate);
      expect(isValid).toBe(false);
    });
  });

  describe('Settlement Template Instantiation', () => {
    let agrarianTemplate;

    beforeEach(() => {
      agrarianTemplate = templateManager.createPresetSettlementTemplate('agrarian');
    });

    test('should instantiate settlement template with need satisfaction data', () => {
      const settlement = templateManager.instantiateSettlementTemplate(agrarianTemplate.id);

      expect(settlement).toBeDefined();
      expect(settlement.needSatisfaction).toBeDefined();
      expect(settlement.needSatisfaction.current).toBeDefined();
      expect(settlement.needSatisfaction.current.food).toBeGreaterThan(0);
      expect(settlement.needSatisfaction.current.overall).toBeGreaterThan(0);
      expect(settlement.population.total).toBe(150);
      expect(settlement.buildings).toBeDefined();
      expect(settlement.buildings.length).toBeGreaterThan(0);
    });

    test('should apply customizations during instantiation', () => {
      const customizations = {
        name: 'Custom Agrarian Village',
        populationConfig: {
          basePopulation: 200
        },
        needModifiers: {
          food: 0.1,
          water: -0.05
        }
      };

      const settlement = templateManager.instantiateSettlementTemplate(
        agrarianTemplate.id,
        customizations
      );

      expect(settlement.name).toBe('Custom Agrarian Village');
      expect(settlement.population.total).toBe(200);
      expect(settlement.needSatisfaction.current.food).toBeCloseTo(0.9, 1); // 0.8 + 0.1
    });

    test('should generate buildings from template configuration', () => {
      const settlement = templateManager.instantiateSettlementTemplate(agrarianTemplate.id);

      const farms = settlement.buildings.filter(b => b.type === 'farm');
      const houses = settlement.buildings.filter(b => b.type === 'house');
      const wells = settlement.buildings.filter(b => b.type === 'well');

      expect(farms.length).toBe(3); // Required 3 farms
      expect(houses.length).toBe(15); // Required 15 houses
      expect(wells.length).toBe(2); // Required 2 wells
    });
  });

  describe('Preset Settlement Templates', () => {
    test('should create agrarian preset template', () => {
      const template = templateManager.createPresetSettlementTemplate('agrarian');

      expect(template).toBeDefined();
      expect(template.economicProfile).toBe('agrarian');
      expect(template.needSatisfactionBaseline.food.baseLevel).toBe(0.8);
      expect(template.populationConfig.basePopulation).toBe(150);
      expect(template.buildingConfig.requiredBuildings.some(b => b.type === 'farm')).toBe(true);
    });

    test('should create commercial preset template', () => {
      const template = templateManager.createPresetSettlementTemplate('commercial');

      expect(template).toBeDefined();
      expect(template.economicProfile).toBe('commercial');
      expect(template.needSatisfactionBaseline.goods.baseLevel).toBe(0.9);
      expect(template.populationConfig.basePopulation).toBe(300);
      expect(template.economicConfig.tradePartners.length).toBeGreaterThan(0);
    });

    test('should create industrial preset template', () => {
      const template = templateManager.createPresetSettlementTemplate('industrial');

      expect(template).toBeDefined();
      expect(template.economicProfile).toBe('industrial');
      expect(template.needSatisfactionBaseline.goods.baseLevel).toBe(0.95);
      expect(template.populationConfig.basePopulation).toBe(500);
      expect(template.buildingConfig.requiredBuildings.some(b => b.type === 'factory')).toBe(true);
    });

    test('should reject unknown preset type', () => {
      expect(() => {
        templateManager.createPresetSettlementTemplate('unknown');
      }).toThrow('Unknown preset type: unknown');
    });
  });

  describe('Settlement Template Validation', () => {
    test('should validate need satisfaction requirements', () => {
      const template = templateManager.createPresetSettlementTemplate('agrarian');
      const validation = templateManager.validateSettlementTemplateNeeds(template.id);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toBeDefined();
    });

    test('should detect insufficient housing capacity', () => {
      // Create a template with insufficient housing
      const templateData = {
        id: 'insufficient_housing_template',
        name: 'Insufficient Housing',
        description: 'Template with not enough housing',
        version: '1.0.0',
        tags: ['test'],
        type: 'village',
        size: 'small',
        economicProfile: 'agrarian',
        needSatisfactionBaseline: {
          food: { baseLevel: 0.8, modifiers: {}, requirements: {} },
          water: { baseLevel: 0.7, modifiers: {}, requirements: {} },
          shelter: { baseLevel: 0.6, modifiers: {}, requirements: {} },
          goods: { baseLevel: 0.5, modifiers: {}, requirements: {} },
          services: { baseLevel: 0.4, modifiers: {}, requirements: {} }
        },
        populationConfig: {
          basePopulation: 100, // Large population
          growthRate: 0.02
        },
        resourceConfig: {
          initialResources: {}
        },
        buildingConfig: {
          requiredBuildings: [
            { type: 'house', level: 1, quantity: 5 } // Only 5 houses * 4 capacity = 20, but need 100
          ],
          optionalBuildings: []
        },
        economicConfig: {
          tradePartners: [],
          taxStructure: {},
          marketConfig: {}
        },
        metadata: {}
      };

      templateManager.addTemplate('settlements', templateData);
      const validation = templateManager.validateSettlementTemplateNeeds(templateData.id);

      expect(validation.warnings.some(w => w.includes('Housing capacity'))).toBe(true);
    });

    test('should detect invalid need satisfaction levels', () => {
      const invalidTemplate = {
        id: 'invalid_needs_template',
        name: 'Invalid Needs',
        description: 'Template with invalid need levels',
        version: '1.0.0',
        tags: ['test'],
        type: 'village',
        size: 'small',
        economicProfile: 'agrarian',
        needSatisfactionBaseline: {
          food: { baseLevel: 1.5, modifiers: {}, requirements: {} }, // Invalid: > 1.0
          water: { baseLevel: 0.7, modifiers: {}, requirements: {} },
          shelter: { baseLevel: 0.6, modifiers: {}, requirements: {} },
          goods: { baseLevel: 0.5, modifiers: {}, requirements: {} },
          services: { baseLevel: 0.4, modifiers: {}, requirements: {} }
        },
        populationConfig: {
          basePopulation: 100,
          growthRate: 0.02
        },
        resourceConfig: {
          initialResources: {}
        },
        buildingConfig: {
          requiredBuildings: [],
          optionalBuildings: []
        },
        economicConfig: {
          tradePartners: [],
          taxStructure: {},
          marketConfig: {}
        },
        metadata: {}
      };

      const isValid = TemplateValidator.validateSettlementTemplate(invalidTemplate);
      expect(isValid).toBe(false);
    });
  });

  describe('Template Integration with Need Satisfaction', () => {
    test('should instantiate settlement with proper need satisfaction history', () => {
      const template = templateManager.createPresetSettlementTemplate('agrarian');
      const settlement = templateManager.instantiateSettlementTemplate(template.id);

      expect(settlement.needSatisfaction.history).toEqual([]);
      expect(settlement.needSatisfaction.trends.food).toBe(0);
      expect(settlement.needSatisfaction.activeConsequences).toEqual([]);
      expect(settlement.needSatisfaction.current.lastCalculated).toBeDefined();
    });

    test('should apply environmental modifiers to need satisfaction', () => {
      const template = templateManager.createPresetSettlementTemplate('agrarian');

      const customizations = {
        environmentalModifiers: {
          food: 0.1, // Boost food satisfaction
          water: -0.1 // Reduce water satisfaction
        }
      };

      const settlement = templateManager.instantiateSettlementTemplate(
        template.id,
        customizations
      );

      expect(settlement.needSatisfaction.current.food).toBeCloseTo(0.9, 1); // 0.8 + 0.1
      expect(settlement.needSatisfaction.current.water).toBeCloseTo(0.5, 1); // 0.6 - 0.1
    });

    test('should generate trade configuration from template', () => {
      const commercialTemplate = templateManager.createPresetSettlementTemplate('commercial');
      const settlement = templateManager.instantiateSettlementTemplate(commercialTemplate.id);

      expect(settlement.economy.trade).toBeDefined();
      expect(settlement.economy.trade.length).toBeGreaterThan(0);
      expect(settlement.economy.trade[0]).toHaveProperty('partner');
      expect(settlement.economy.trade[0]).toHaveProperty('resources');
    });
  });
});
