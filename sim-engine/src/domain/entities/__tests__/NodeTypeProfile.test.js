import NodeTypeProfile from '../NodeTypeProfile.js';
import NodeTypeCapabilities from '../../value-objects/NodeTypeCapabilities.js';

describe('NodeTypeProfile', () => {
  let mockCapabilities;

  beforeEach(() => {
    mockCapabilities = new NodeTypeCapabilities({
      canHaveEconomy: true,
      canProduceResources: true,
      canHaveGovernment: true
    });
  });

  describe('constructor', () => {
    it('should create profile with provided config', () => {
      const config = {
        id: 'test-settlement',
        name: 'Test Settlement',
        description: 'A test settlement type',
        type: 'settlement',
        capabilities: mockCapabilities
      };

      const profile = new NodeTypeProfile(config);

      expect(profile.id).toBe('test-settlement');
      expect(profile.name).toBe('Test Settlement');
      expect(profile.description).toBe('A test settlement type');
      expect(profile.type).toBe('settlement');
      expect(profile.capabilities).toBe(mockCapabilities);
    });

    it('should create profile with default values', () => {
      const profile = new NodeTypeProfile();

      expect(profile.id).toMatch(/^node_type_/);
      expect(profile.name).toBe('Unknown Type');
      expect(profile.description).toBe('');
      expect(profile.type).toBe('unknown');
      expect(profile.capabilities).toBeInstanceOf(NodeTypeCapabilities);
    });

    it('should initialize resource profile with defaults', () => {
      const profile = new NodeTypeProfile();

      expect(profile.resourceProfile.canProduce).toBe(false);
      expect(profile.resourceProfile.canConsume).toBe(false);
      expect(profile.resourceProfile.productionTypes).toEqual([]);
      expect(profile.resourceProfile.consumptionTypes).toEqual([]);
      expect(profile.resourceProfile.productionCapacity).toBe(0);
      expect(profile.resourceProfile.consumptionCapacity).toBe(0);
    });

    it('should initialize economic capabilities with defaults', () => {
      const profile = new NodeTypeProfile();

      expect(profile.economicCapabilities.hasMarkets).toBe(false);
      expect(profile.economicCapabilities.hasTrade).toBe(false);
      expect(profile.economicCapabilities.economicComplexity).toBe('none');
    });
  });

  describe('hasCapability', () => {
    it('should delegate to capabilities object', () => {
      const profile = new NodeTypeProfile({
        capabilities: mockCapabilities
      });

      expect(profile.hasCapability('economy')).toBe(true);
      expect(profile.hasCapability('trade')).toBe(false);
    });
  });

  describe('getCapabilities', () => {
    it('should delegate to capabilities object', () => {
      const profile = new NodeTypeProfile({
        capabilities: mockCapabilities
      });

      const capabilities = profile.getCapabilities();
      expect(capabilities).toContain('economy');
      expect(capabilities).toContain('resource_production');
      expect(capabilities).toContain('government');
    });
  });

  describe('resource methods', () => {
    let profile;

    beforeEach(() => {
      profile = new NodeTypeProfile({
        resourceProfile: {
          canProduce: true,
          canConsume: true,
          productionTypes: ['food', 'water'],
          consumptionTypes: ['food', 'goods'],
          productionCapacity: 100,
          consumptionCapacity: 50
        }
      });
    });

    describe('canProduceResource', () => {
      it('should return true for allowed production types', () => {
        expect(profile.canProduceResource('food')).toBe(true);
        expect(profile.canProduceResource('water')).toBe(true);
      });

      it('should return false for disallowed production types', () => {
        expect(profile.canProduceResource('minerals')).toBe(false);
      });

      it('should return false when production is disabled', () => {
        profile.resourceProfile.canProduce = false;
        expect(profile.canProduceResource('food')).toBe(false);
      });
    });

    describe('canConsumeResource', () => {
      it('should return true for allowed consumption types', () => {
        expect(profile.canConsumeResource('food')).toBe(true);
        expect(profile.canConsumeResource('goods')).toBe(true);
      });

      it('should return false for disallowed consumption types', () => {
        expect(profile.canConsumeResource('minerals')).toBe(false);
      });

      it('should return false when consumption is disabled', () => {
        profile.resourceProfile.canConsume = false;
        expect(profile.canConsumeResource('food')).toBe(false);
      });
    });
  });

  describe('complexity methods', () => {
    it('should return economic complexity', () => {
      const profile = new NodeTypeProfile({
        economicCapabilities: { economicComplexity: 'full' }
      });

      expect(profile.getEconomicComplexity()).toBe('full');
    });

    it('should return political complexity', () => {
      const profile = new NodeTypeProfile({
        politicalCapabilities: { politicalComplexity: 'moderate' }
      });

      expect(profile.getPoliticalComplexity()).toBe('moderate');
    });

    it('should return social complexity', () => {
      const profile = new NodeTypeProfile({
        socialCapabilities: { socialComplexity: 'minimal' }
      });

      expect(profile.getSocialComplexity()).toBe('minimal');
    });
  });

  describe('special mechanics', () => {
    it('should check for special mechanics', () => {
      const profile = new NodeTypeProfile({
        specialMechanics: ['cultural_significance', 'ritual_sites']
      });

      expect(profile.hasSpecialMechanic('cultural_significance')).toBe(true);
      expect(profile.hasSpecialMechanic('ritual_sites')).toBe(true);
      expect(profile.hasSpecialMechanic('unknown')).toBe(false);
    });
  });

  describe('validateNodeConfig', () => {
    it('should validate node config using validation rules', () => {
      const mockRule = {
        validate: jest.fn().mockReturnValue({ isValid: true, errors: [] })
      };

      const profile = new NodeTypeProfile({
        validationRules: [mockRule]
      });

      const nodeConfig = { type: 'settlement' };
      const result = profile.validateNodeConfig(nodeConfig);

      expect(mockRule.validate).toHaveBeenCalledWith(nodeConfig);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return validation errors when rules fail', () => {
      const mockRule = {
        validate: jest.fn().mockReturnValue({
          isValid: false,
          errors: ['Invalid type']
        })
      };

      const profile = new NodeTypeProfile({
        validationRules: [mockRule]
      });

      const result = profile.validateNodeConfig({});

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(['Invalid type']);
    });
  });

  describe('clone', () => {
    it('should create a deep clone of the profile', () => {
      const original = new NodeTypeProfile({
        id: 'test',
        name: 'Test Profile',
        capabilities: mockCapabilities,
        resourceProfile: {
          canProduce: true,
          productionTypes: ['food']
        },
        specialMechanics: ['test']
      });

      const cloned = original.clone();

      expect(cloned).toBeInstanceOf(NodeTypeProfile);
      expect(cloned.id).toBe('test');
      expect(cloned.name).toBe('Test Profile');
      expect(cloned.capabilities).not.toBe(original.capabilities); // Different instance
      expect(cloned.resourceProfile).not.toBe(original.resourceProfile); // Different object
      expect(cloned.specialMechanics).not.toBe(original.specialMechanics); // Different array
    });
  });
});