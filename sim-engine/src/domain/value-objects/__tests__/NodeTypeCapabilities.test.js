import NodeTypeCapabilities from '../NodeTypeCapabilities.js';

describe('NodeTypeCapabilities', () => {
  describe('constructor', () => {
    it('should create capabilities with default values', () => {
      const capabilities = new NodeTypeCapabilities();

      expect(capabilities.canHaveEconomy).toBe(false);
      expect(capabilities.canProduceResources).toBe(false);
      expect(capabilities.canConsumeResources).toBe(false);
      expect(capabilities.canHaveMarkets).toBe(false);
      expect(capabilities.canTrade).toBe(false);
      expect(capabilities.canHaveGovernment).toBe(false);
      expect(capabilities.canHavePopulation).toBe(false);
    });

    it('should create capabilities with provided values', () => {
      const config = {
        canHaveEconomy: true,
        canProduceResources: true,
        canHaveGovernment: true,
        canHavePopulation: true
      };

      const capabilities = new NodeTypeCapabilities(config);

      expect(capabilities.canHaveEconomy).toBe(true);
      expect(capabilities.canProduceResources).toBe(true);
      expect(capabilities.canHaveGovernment).toBe(true);
      expect(capabilities.canHavePopulation).toBe(true);
      expect(capabilities.canTrade).toBe(false); // Not provided, should be false
    });
  });

  describe('hasCapability', () => {
    let capabilities;

    beforeEach(() => {
      capabilities = new NodeTypeCapabilities({
        canHaveEconomy: true,
        canProduceResources: true,
        canHaveGovernment: true,
        canHavePopulation: true,
        canHaveSpecialMechanics: true
      });
    });

    it('should return true for enabled capabilities', () => {
      expect(capabilities.hasCapability('economy')).toBe(true);
      expect(capabilities.hasCapability('resource_production')).toBe(true);
      expect(capabilities.hasCapability('government')).toBe(true);
      expect(capabilities.hasCapability('population')).toBe(true);
      expect(capabilities.hasCapability('special_mechanics')).toBe(true);
    });

    it('should return false for disabled capabilities', () => {
      expect(capabilities.hasCapability('trade')).toBe(false);
      expect(capabilities.hasCapability('markets')).toBe(false);
      expect(capabilities.hasCapability('military')).toBe(false);
    });

    it('should return false for unknown capabilities', () => {
      expect(capabilities.hasCapability('unknown')).toBe(false);
      expect(capabilities.hasCapability('')).toBe(false);
    });
  });

  describe('getAllCapabilities', () => {
    it('should return all enabled capabilities', () => {
      const capabilities = new NodeTypeCapabilities({
        canHaveEconomy: true,
        canProduceResources: true,
        canHaveGovernment: true,
        canHaveSpecialMechanics: true
      });

      const allCapabilities = capabilities.getAllCapabilities();

      expect(allCapabilities).toContain('economy');
      expect(allCapabilities).toContain('resource_production');
      expect(allCapabilities).toContain('government');
      expect(allCapabilities).toContain('special_mechanics');
      expect(allCapabilities).not.toContain('trade');
      expect(allCapabilities).not.toContain('markets');
    });

    it('should return empty array when no capabilities are enabled', () => {
      const capabilities = new NodeTypeCapabilities();
      const allCapabilities = capabilities.getAllCapabilities();

      expect(allCapabilities).toEqual([]);
    });
  });

  describe('getCapabilitiesByCategory', () => {
    it('should group capabilities by category', () => {
      const capabilities = new NodeTypeCapabilities({
        canHaveEconomy: true,
        canProduceResources: true,
        canHaveGovernment: true,
        canHavePopulation: true,
        canHaveSpecialMechanics: true,
        canHaveContentInteractions: true
      });

      const categorized = capabilities.getCapabilitiesByCategory();

      expect(categorized.economic.economy).toBe(true);
      expect(categorized.economic.resourceProduction).toBe(true);
      expect(categorized.political.government).toBe(true);
      expect(categorized.social.population).toBe(true);
      expect(categorized.environmental.specialMechanics).toBe(true);
      expect(categorized.interaction.contentInteractions).toBe(true);
    });
  });

  describe('clone', () => {
    it('should create a new instance with same values', () => {
      const original = new NodeTypeCapabilities({
        canHaveEconomy: true,
        canProduceResources: true,
        canHaveGovernment: true
      });

      const cloned = original.clone();

      expect(cloned).toBeInstanceOf(NodeTypeCapabilities);
      expect(cloned.canHaveEconomy).toBe(true);
      expect(cloned.canProduceResources).toBe(true);
      expect(cloned.canHaveGovernment).toBe(true);
      expect(cloned).not.toBe(original); // Different instances
    });
  });

  describe('equals', () => {
    it('should return true for identical capabilities', () => {
      const cap1 = new NodeTypeCapabilities({
        canHaveEconomy: true,
        canProduceResources: true
      });

      const cap2 = new NodeTypeCapabilities({
        canHaveEconomy: true,
        canProduceResources: true
      });

      expect(cap1.equals(cap2)).toBe(true);
    });

    it('should return false for different capabilities', () => {
      const cap1 = new NodeTypeCapabilities({
        canHaveEconomy: true
      });

      const cap2 = new NodeTypeCapabilities({
        canHaveEconomy: false
      });

      expect(cap1.equals(cap2)).toBe(false);
    });

    it('should return false when compared with non-NodeTypeCapabilities', () => {
      const cap1 = new NodeTypeCapabilities();
      const other = {};

      expect(cap1.equals(other)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should be frozen and immutable', () => {
      const capabilities = new NodeTypeCapabilities({
        canHaveEconomy: true
      });

      expect(Object.isFrozen(capabilities)).toBe(true);

      expect(() => {
        capabilities.canHaveEconomy = false;
      }).toThrow();
    });
  });
});