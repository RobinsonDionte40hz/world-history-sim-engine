import NodeTypeService from '../NodeTypeService.js';
import NodeTypeProfile from '../../entities/NodeTypeProfile.js';
import NodeTypeCapabilities from '../../value-objects/NodeTypeCapabilities.js';

describe('NodeTypeService', () => {
  let service;

  beforeEach(() => {
    service = new NodeTypeService();
  });

  describe('initialization', () => {
    it('should initialize with standard node types', () => {
      expect(service.getAllNodeTypes()).toHaveLength(5);

      const types = service.getAllNodeTypes().map(t => t.type);
      expect(types).toContain('settlement');
      expect(types).toContain('resource');
      expect(types).toContain('wilderness');
      expect(types).toContain('landmark');
      expect(types).toContain('sacred');
    });

    it('should have settlement type with full capabilities', () => {
      const settlement = service.getNodeType('settlement');

      expect(settlement.name).toBe('Settlement');
      expect(settlement.getEconomicComplexity()).toBe('full');
      expect(settlement.getPoliticalComplexity()).toBe('full');
      expect(settlement.getSocialComplexity()).toBe('full');
      expect(settlement.hasCapability('economy')).toBe(true);
      expect(settlement.hasCapability('government')).toBe(true);
      expect(settlement.hasCapability('population')).toBe(true);
    });

    it('should have resource type with production-only capabilities', () => {
      const resource = service.getNodeType('resource');

      expect(resource.name).toBe('Resource Node');
      expect(resource.getEconomicComplexity()).toBe('minimal');
      expect(resource.canProduceResource('food')).toBe(true);
      expect(resource.canConsumeResource('food')).toBe(false);
      expect(resource.hasCapability('economy')).toBe(false);
    });

    it('should have wilderness type with minimal capabilities', () => {
      const wilderness = service.getNodeType('wilderness');

      expect(wilderness.name).toBe('Wilderness');
      expect(wilderness.getEconomicComplexity()).toBe('minimal');
      expect(wilderness.hasCapability('population')).toBe(false);
      expect(wilderness.hasCapability('government')).toBe(false);
    });

    it('should have landmark type with special mechanics', () => {
      const landmark = service.getNodeType('landmark');

      expect(landmark.name).toBe('Landmark');
      expect(landmark.hasSpecialMechanic('cultural_significance')).toBe(true);
      expect(landmark.hasCapability('economy')).toBe(false);
    });

    it('should have sacred type with spiritual mechanics', () => {
      const sacred = service.getNodeType('sacred');

      expect(sacred.name).toBe('Sacred Site');
      expect(sacred.hasSpecialMechanic('spiritual_power')).toBe(true);
      expect(sacred.hasCapability('religion')).toBe(true);
    });
  });

  describe('registerNodeType', () => {
    it('should register a new node type', () => {
      const customProfile = new NodeTypeProfile({
        id: 'custom',
        name: 'Custom Type',
        type: 'custom'
      });

      service.registerNodeType(customProfile);

      expect(service.getNodeType('custom')).toBe(customProfile);
      expect(service.getAllNodeTypes()).toHaveLength(6);
    });

    it('should throw error for invalid profile', () => {
      expect(() => {
        service.registerNodeType({});
      }).toThrow('Must register a valid NodeTypeProfile instance');
    });
  });

  describe('getNodeType', () => {
    it('should return node type by id', () => {
      const settlement = service.getNodeType('settlement');
      expect(settlement).toBeInstanceOf(NodeTypeProfile);
      expect(settlement.type).toBe('settlement');
    });

    it('should return null for unknown type', () => {
      expect(service.getNodeType('unknown')).toBe(null);
    });
  });

  describe('isValidNodeType', () => {
    it('should return true for registered types', () => {
      expect(service.isValidNodeType('settlement')).toBe(true);
      expect(service.isValidNodeType('resource')).toBe(true);
    });

    it('should return false for unregistered types', () => {
      expect(service.isValidNodeType('unknown')).toBe(false);
    });
  });

  describe('typeHasCapability', () => {
    it('should check if type has capability', () => {
      expect(service.typeHasCapability('settlement', 'economy')).toBe(true);
      expect(service.typeHasCapability('resource', 'economy')).toBe(false);
      expect(service.typeHasCapability('unknown', 'economy')).toBe(false);
    });
  });

  describe('getTypeCapabilities', () => {
    it('should return capabilities for valid type', () => {
      const capabilities = service.getTypeCapabilities('settlement');
      expect(capabilities).toContain('economy');
      expect(capabilities).toContain('government');
      expect(capabilities).toContain('population');
    });

    it('should return empty array for unknown type', () => {
      expect(service.getTypeCapabilities('unknown')).toEqual([]);
    });
  });

  describe('complexity queries', () => {
    it('should return economic complexity', () => {
      expect(service.getEconomicComplexity('settlement')).toBe('full');
      expect(service.getEconomicComplexity('resource')).toBe('minimal');
      expect(service.getEconomicComplexity('unknown')).toBe('none');
    });

    it('should return political complexity', () => {
      expect(service.getPoliticalComplexity('settlement')).toBe('full');
      expect(service.getPoliticalComplexity('resource')).toBe('none');
    });

    it('should return social complexity', () => {
      expect(service.getSocialComplexity('settlement')).toBe('full');
      expect(service.getSocialComplexity('wilderness')).toBe('minimal');
    });
  });

  describe('resource queries', () => {
    it('should check resource production capability', () => {
      expect(service.canProduceResource('settlement', 'food')).toBe(true);
      expect(service.canProduceResource('resource', 'food')).toBe(true);
      expect(service.canProduceResource('wilderness', 'food')).toBe(true);
      expect(service.canProduceResource('landmark', 'food')).toBe(false);
    });

    it('should check resource consumption capability', () => {
      expect(service.canConsumeResource('settlement', 'food')).toBe(true);
      expect(service.canConsumeResource('resource', 'food')).toBe(false);
      expect(service.canConsumeResource('landmark', 'food')).toBe(false);
    });
  });

  describe('getTypesWithCapability', () => {
    it('should return types with specific capability', () => {
      const economyTypes = service.getTypesWithCapability('economy');
      expect(economyTypes).toHaveLength(1);
      expect(economyTypes[0].type).toBe('settlement');

      const populationTypes = service.getTypesWithCapability('population');
      expect(populationTypes).toHaveLength(1);
      expect(populationTypes[0].type).toBe('settlement');
    });
  });

  describe('createCustomNodeType', () => {
    it('should create and register custom node type', () => {
      const config = {
        id: 'custom',
        name: 'Custom Type',
        type: 'custom',
        capabilities: new NodeTypeCapabilities({
          canHaveEconomy: true
        })
      };

      const customType = service.createCustomNodeType(config);

      expect(customType).toBeInstanceOf(NodeTypeProfile);
      expect(customType.id).toBe('custom');
      expect(service.getNodeType('custom')).toBe(customType);
    });
  });

  describe('validateNodeConfig', () => {
    it('should validate config for valid type', () => {
      const nodeConfig = {
        type: 'settlement',
        population: 100
      };

      const result = service.validateNodeConfig('settlement', nodeConfig);
      expect(result.isValid).toBe(true);
    });

    it('should return error for unknown type', () => {
      const result = service.validateNodeConfig('unknown', {});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unknown node type: unknown');
    });
  });

  describe('getNodeTypeSummary', () => {
    it('should return summary of all node types', () => {
      const summary = service.getNodeTypeSummary();

      expect(summary.settlement).toBeDefined();
      expect(summary.settlement.name).toBe('Settlement');
      expect(summary.settlement.economicComplexity).toBe('full');
      expect(summary.settlement.capabilities).toContain('economy');

      expect(summary.resource).toBeDefined();
      expect(summary.resource.name).toBe('Resource Node');
      expect(summary.resource.economicComplexity).toBe('minimal');
    });
  });
});