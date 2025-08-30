// src/test/application/services/TemplateService.test.js

import TemplateService from '../../../application/use-cases/services/TemplateService.js';
import Environment from '../../../domain/value-objects/Environment.js';
import { TerrainTypes } from '../../../shared/constants/TerrainTypes.js';
import { ClimateTypes } from '../../../shared/constants/ClimateTypes.js';
import { LightingTypes } from '../../../shared/constants/LightingTypes.js';
import Node from '../../../domain/entities/Node.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

// Mock localStorage
const localStorageMock = {
  storage: {},
  getItem: jest.fn((key) => localStorageMock.storage[key] || null),
  setItem: jest.fn((key, value) => { localStorageMock.storage[key] = value; }),
  removeItem: jest.fn((key) => { delete localStorageMock.storage[key]; }),
  clear: jest.fn(() => { localStorageMock.storage = {}; })
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

// Mock crypto.randomUUID
const mockCrypto = {
  randomUUID: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true
});

describe('TemplateService - Environmental Template Support', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Reset crypto mock
    mockCrypto.randomUUID.mockImplementation(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9));
    
    // Reset template service state
    TemplateService.templates = {
      characterTemplates: [],
      nodeTemplates: [],
      interactionTemplates: []
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNodeTemplate with environmental data', () => {
    test('should create a basic node template with default environment', () => {
      // Check if TemplateService is properly loaded
      expect(TemplateService).toBeDefined();
      expect(typeof TemplateService.createNodeTemplate).toBe('function');
      
      const config = {
        name: 'Test Forest Node',
        description: 'A test forest location',
        type: 'wilderness'
      };

      let template;
      try {
        template = TemplateService.createNodeTemplate(config);
        console.log('Template created successfully:', !!template);
        console.log('Template keys:', template ? Object.keys(template) : 'undefined');
      } catch (error) {
        console.error('Error creating template:', error);
        throw error;
      }

      expect(template).toBeDefined();
      expect(template.id).toBeDefined();
      expect(template.name).toBe('Test Forest Node');
      expect(template.type).toBe('wilderness');
      expect(template.environment).toBeDefined();
      expect(template.environmentalMetadata).toBeDefined();
    });

    test('should create a node template with custom environmental data', () => {
      const config = {
        name: 'Desert Oasis',
        description: 'A life-giving oasis',
        environment: {
          terrain: TerrainTypes.DESERT,
          climate: ClimateTypes.ARID,
          lighting: LightingTypes.BRIGHT,
          temperature: 35,
          waterAvailability: 0.9,
          shelterQuality: 0.4
        }
      };

      const template = TemplateService.createNodeTemplate(config);

      expect(template.environment.terrain).toBe(TerrainTypes.DESERT);
      expect(template.environment.climate).toBe(ClimateTypes.ARID);
      expect(template.environment.temperature).toBe(35);
      expect(template.environment.waterAvailability).toBe(0.9);
    });

    test('should reject invalid environmental data', () => {
      const config = {
        name: 'Invalid Node',
        environment: {
          density: 2.0, // Invalid: should be 0-1
          terrain: 'invalid_terrain'
        }
      };

      expect(() => {
        TemplateService.createNodeTemplate(config);
      }).toThrow(ValidationError);
    });
  });

  describe('createNodeTemplateFromPreset', () => {
    test('should create template from forest village preset', () => {
      const template = TemplateService.createNodeTemplateFromPreset('forest_village', {
        name: 'Custom Forest Village'
      });

      expect(template.name).toBe('Custom Forest Village');
      expect(template.environment.terrain).toBe(TerrainTypes.FOREST);
      expect(template.environment.climate).toBe(ClimateTypes.TEMPERATE);
      expect(template.environmentalMetadata.presetId).toBe('forest_village');
    });

    test('should apply environment overrides to preset', () => {
      // First, let's check what the preset actually contains
      const EnvironmentalPresetService = require('../../../domain/services/EnvironmentalPresetService.js').default;
      const preset = EnvironmentalPresetService.getPreset('desert_oasis');
      console.log('Desert oasis preset:', JSON.stringify(preset, null, 2));
      console.log('Preset terrain type:', preset?.environment?.terrain);
      console.log('TerrainTypes.DESERT:', TerrainTypes.DESERT);
      
      const template = TemplateService.createNodeTemplateFromPreset('desert_oasis', {
        environment: {
          waterAvailability: 0.5 // Override preset value
        }
      });

      console.log('Template environment:', template.environment);
      console.log('Expected terrain:', TerrainTypes.DESERT);
      console.log('Actual terrain:', template.environment.terrain);

      expect(template.environment.terrain).toBe(TerrainTypes.DESERT);
      expect(template.environment.waterAvailability).toBe(0.5);
    });

    test('should reject unknown preset IDs', () => {
      expect(() => {
        TemplateService.createNodeTemplateFromPreset('unknown_preset');
      }).toThrow(ValidationError);
    });
  });

  describe('instantiateNodeTemplate', () => {
    let testTemplate;

    beforeEach(() => {
      testTemplate = {
        id: 'test-template-id',
        name: 'Test Template',
        description: 'A test template',
        type: 'location',
        environment: {
          terrain: TerrainTypes.FOREST,
          climate: ClimateTypes.TEMPERATE,
          density: 0.5
        },
        size: 100,
        interactions: []
      };
    });

    test('should instantiate template as Node entity', () => {
      const node = TemplateService.instantiateNodeTemplate(testTemplate);

      expect(node).toBeInstanceOf(Node);
      expect(node.id).toBeDefined();
      expect(node.name).toBe('Test Template');
      expect(node.environment).toBeInstanceOf(Environment);
      expect(node.customData.templateId).toBe('test-template-id');
    });

    test('should apply environmental preset during instantiation', () => {
      const node = TemplateService.instantiateNodeTemplate(testTemplate, {
        environmentalPresetId: 'arctic_outpost',
        name: 'Cold Outpost'
      });

      expect(node.name).toBe('Cold Outpost');
      expect(node.environment.terrain).toBe(TerrainTypes.TUNDRA);
      expect(node.environment.climate).toBe(ClimateTypes.ARCTIC);
      expect(node.customData.environmentalPresetUsed).toBe('arctic_outpost');
    });
  });

  describe('validateTemplate with environmental checks', () => {
    test('should validate node template with valid environment', () => {
      const template = {
        id: 'test-id',
        name: 'Valid Template',
        position: { x: 0, y: 0 },
        environment: {
          terrain: TerrainTypes.FOREST,
          climate: ClimateTypes.TEMPERATE,
          density: 0.5
        },
        environmentalMetadata: {
          dangerLevel: 0.1
        }
      };

      expect(() => {
        TemplateService.validateTemplate(template, 'node');
      }).not.toThrow();
    });

    test('should reject template with invalid environmental data', () => {
      const template = {
        id: 'test-id',
        name: 'Invalid Template',
        position: { x: 0, y: 0 },
        environment: {
          terrain: 'invalid_terrain',
          density: 2.0
        }
      };

      expect(() => {
        TemplateService.validateTemplate(template, 'node');
      }).toThrow(/Node template environmental validation failed/);
    });
  });
});
