// src/domain/value-objects/__tests__/Influence.test.js

import { Influence } from '../Influence';

describe('Influence Value Object', () => {
  const mockDomains = [
    {
      id: 'political',
      name: 'Political',
      description: 'Political influence and power',
      min: 0,
      max: 100,
      defaultValue: 10,
      tiers: [
        { name: 'None', min: 0, max: 9, description: 'No political influence' },
        { name: 'Low', min: 10, max: 29, description: 'Minor political influence' },
        { name: 'Medium', min: 30, max: 59, description: 'Moderate political influence' },
        { name: 'High', min: 60, max: 89, description: 'High political influence' },
        { name: 'Very High', min: 90, max: 100, description: 'Dominant political influence' }
      ]
    },
    {
      id: 'economic',
      name: 'Economic',
      description: 'Economic influence and wealth',
      min: 0,
      max: 100,
      defaultValue: 5,
      tiers: [
        { name: 'Poor', min: 0, max: 19, description: 'Little economic influence' },
        { name: 'Modest', min: 20, max: 49, description: 'Modest economic influence' },
        { name: 'Wealthy', min: 50, max: 79, description: 'Significant economic influence' },
        { name: 'Very Wealthy', min: 80, max: 100, description: 'Dominant economic influence' }
      ]
    },
    {
      id: 'social',
      name: 'Social',
      description: 'Social influence and reputation',
      min: 0,
      max: 100,
      defaultValue: 15,
      tiers: [
        { name: 'Unknown', min: 0, max: 14, description: 'No social recognition' },
        { name: 'Known', min: 15, max: 39, description: 'Some social recognition' },
        { name: 'Respected', min: 40, max: 69, description: 'Well respected socially' },
        { name: 'Renowned', min: 70, max: 100, description: 'Widely renowned' }
      ]
    }
  ];

  describe('Construction', () => {
    test('should create influence with default values', () => {
      const influence = new Influence(mockDomains);
      
      expect(influence.getValue('political')).toBe(10);
      expect(influence.getValue('economic')).toBe(5);
      expect(influence.getValue('social')).toBe(15);
      expect(influence.domains).toHaveLength(3);
    });

    test('should create influence with custom values', () => {
      const values = { political: 50, economic: 75, social: 25 };
      const influence = new Influence(mockDomains, values);
      
      expect(influence.getValue('political')).toBe(50);
      expect(influence.getValue('economic')).toBe(75);
      expect(influence.getValue('social')).toBe(25);
    });

    test('should create influence with history', () => {
      const history = {
        political: [
          { timestamp: new Date(), change: 10, newValue: 20, reason: 'Test change' }
        ]
      };
      const influence = new Influence(mockDomains, { political: 20 }, history);
      
      expect(influence.getValue('political')).toBe(20);
      expect(influence.getLastChange('political').reason).toBe('Test change');
    });

    test('should throw error for empty domains', () => {
      expect(() => new Influence([])).toThrow('Influence must have at least one domain');
    });

    test('should throw error for invalid domain', () => {
      const invalidDomains = [{ id: 'test' }]; // Missing required fields
      expect(() => new Influence(invalidDomains)).toThrow();
    });

    test('should throw error for invalid domain structure', () => {
      const invalidDomains = [{
        id: 'test',
        name: 'Test',
        description: 'Test domain',
        min: 0,
        max: 100,
        defaultValue: 50,
        tiers: [] // Empty tiers array
      }];
      expect(() => new Influence(invalidDomains)).toThrow('Domain must have at least one tier');
    });
  });

  describe('Immutability', () => {
    test('should be immutable', () => {
      const influence = new Influence(mockDomains);
      
      expect(() => {
        influence._values.political = 100;
      }).toThrow();
      
      expect(() => {
        influence.domains.push({});
      }).toThrow();
    });

    test('should create new instance with withChange', () => {
      const influence = new Influence(mockDomains);
      const newInfluence = influence.withChange('political', 25, 'Test change');
      
      expect(influence.getValue('political')).toBe(10);
      expect(newInfluence.getValue('political')).toBe(35);
      expect(influence).not.toBe(newInfluence);
    });

    test('should preserve other domain values when changing one', () => {
      const influence = new Influence(mockDomains);
      const newInfluence = influence.withChange('political', 25, 'Test change');
      
      expect(newInfluence.getValue('economic')).toBe(5);
      expect(newInfluence.getValue('social')).toBe(15);
    });
  });

  describe('Value Operations', () => {
    test('should get correct values', () => {
      const influence = new Influence(mockDomains, { political: 75, economic: 50, social: 25 });
      
      expect(influence.getValue('political')).toBe(75);
      expect(influence.getValue('economic')).toBe(50);
      expect(influence.getValue('social')).toBe(25);
    });

    test('should throw error for unknown domain', () => {
      const influence = new Influence(mockDomains);
      
      expect(() => influence.getValue('unknown')).toThrow("Influence domain 'unknown' not found");
    });

    test('should clamp values to domain bounds', () => {
      const influence = new Influence(mockDomains);
      const newInfluence = influence.withChange('political', 200, 'Excessive change');
      
      expect(newInfluence.getValue('political')).toBe(100); // Clamped to max
    });

    test('should clamp negative values to domain minimum', () => {
      const influence = new Influence(mockDomains);
      const newInfluence = influence.withChange('political', -50, 'Negative change');
      
      expect(newInfluence.getValue('political')).toBe(0); // Clamped to min
    });
  });

  describe('Tier Operations', () => {
    test('should get correct tier', () => {
      const influence = new Influence(mockDomains, { political: 75, economic: 25, social: 45 });
      
      expect(influence.getTier('political').name).toBe('High');
      expect(influence.getTier('economic').name).toBe('Modest');
      expect(influence.getTier('social').name).toBe('Respected');
    });

    test('should return null for value outside tiers', () => {
      // This shouldn't happen with proper tier setup, but test defensive code
      const badDomains = [{
        id: 'test',
        name: 'Test',
        description: 'Test domain',
        min: 0,
        max: 100,
        defaultValue: 50,
        tiers: [{ name: 'Only', min: 10, max: 20, description: 'Limited tier' }]
      }];
      
      const influence = new Influence(badDomains);
      expect(influence.getTier('test')).toBe(null);
    });

    test('should handle edge case tier boundaries', () => {
      const influence = new Influence(mockDomains, { political: 30, economic: 50 });
      
      expect(influence.getTier('political').name).toBe('Medium'); // Exactly at boundary
      expect(influence.getTier('economic').name).toBe('Wealthy'); // Exactly at boundary
    });
  });

  describe('History Tracking', () => {
    test('should track changes in history', () => {
      const influence = new Influence(mockDomains);
      const newInfluence = influence.withChange('political', 25, 'Political victory');
      
      const history = newInfluence.getDomainHistory('political');
      expect(history).toHaveLength(1);
      expect(history[0].change).toBe(25);
      expect(history[0].newValue).toBe(35);
      expect(history[0].reason).toBe('Political victory');
      expect(history[0].timestamp).toBeInstanceOf(Date);
    });

    test('should track settlement context in history', () => {
      const influence = new Influence(mockDomains);
      const settlementContext = {
        settlementId: 'city1',
        settlementName: 'Capital City',
        settlementData: new Map([['population', 10000]])
      };
      
      const newInfluence = influence.withChange('political', 15, 'Mayor election', settlementContext);
      const lastChange = newInfluence.getLastChange('political');
      
      expect(lastChange.settlementContext.settlementId).toBe('city1');
      expect(lastChange.settlementContext.settlementName).toBe('Capital City');
      expect(lastChange.settlementContext.settlementData.get('population')).toBe(10000);
    });

    test('should get last change', () => {
      let influence = new Influence(mockDomains);
      influence = influence.withChange('political', 10, 'First change');
      influence = influence.withChange('political', 15, 'Second change');
      
      const lastChange = influence.getLastChange('political');
      expect(lastChange.reason).toBe('Second change');
      expect(lastChange.newValue).toBe(35);
    });

    test('should return null for domain with no changes', () => {
      const influence = new Influence(mockDomains);
      expect(influence.getLastChange('political')).toBe(null);
    });

    test('should maintain separate histories for different domains', () => {
      let influence = new Influence(mockDomains);
      influence = influence.withChange('political', 10, 'Political change');
      influence = influence.withChange('economic', 20, 'Economic change');
      
      expect(influence.getDomainHistory('political')).toHaveLength(1);
      expect(influence.getDomainHistory('economic')).toHaveLength(1);
      expect(influence.getDomainHistory('social')).toHaveLength(0);
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON', () => {
      const influence = new Influence(mockDomains, { political: 50 });
      const json = influence.toJSON();
      
      expect(json.domains).toEqual(mockDomains);
      expect(json.values.political).toBe(50);
      expect(json.history).toBeDefined();
    });

    test('should deserialize from JSON', () => {
      const influence = new Influence(mockDomains, { political: 50 });
      const json = influence.toJSON();
      const restored = Influence.fromJSON(json);
      
      expect(restored.getValue('political')).toBe(50);
      expect(restored.domains).toHaveLength(3);
    });

    test('should handle Map serialization in settlement context', () => {
      const influence = new Influence(mockDomains);
      const settlementContext = {
        settlementData: new Map([['population', 5000], ['prosperity', 75]])
      };
      
      const changedInfluence = influence.withChange('economic', 20, 'Trade success', settlementContext);
      const json = changedInfluence.toJSON();
      const restored = Influence.fromJSON(json);
      
      const restoredChange = restored.getLastChange('economic');
      expect(restoredChange.settlementContext.settlementData.get('population')).toBe(5000);
      expect(restoredChange.settlementContext.settlementData.get('prosperity')).toBe(75);
    });

    test('should handle round-trip serialization', () => {
      let influence = new Influence(mockDomains, { political: 25, economic: 40 });
      influence = influence.withChange('political', 15, 'Test change');
      
      const json = influence.toJSON();
      const restored = Influence.fromJSON(json);
      
      expect(restored.equals(influence)).toBe(true);
      expect(restored.getLastChange('political').reason).toBe('Test change');
    });

    test('should handle empty history serialization', () => {
      const influence = new Influence(mockDomains);
      const json = influence.toJSON();
      const restored = Influence.fromJSON(json);
      
      expect(restored.equals(influence)).toBe(true);
      expect(restored.getDomainHistory('political')).toHaveLength(0);
    });
  });

  describe('Utility Methods', () => {
    test('should get summary', () => {
      const influence = new Influence(mockDomains, { political: 75, economic: 25, social: 45 });
      const summary = influence.getSummary();
      
      expect(summary.political.value).toBe(75);
      expect(summary.political.tier.name).toBe('High');
      expect(summary.economic.value).toBe(25);
      expect(summary.economic.tier.name).toBe('Modest');
      expect(summary.social.value).toBe(45);
      expect(summary.social.tier.name).toBe('Respected');
    });

    test('should check domain existence', () => {
      const influence = new Influence(mockDomains);
      
      expect(influence.hasDomain('political')).toBe(true);
      expect(influence.hasDomain('economic')).toBe(true);
      expect(influence.hasDomain('unknown')).toBe(false);
    });

    test('should get domain definition', () => {
      const influence = new Influence(mockDomains);
      const domain = influence.getDomain('political');
      
      expect(domain.name).toBe('Political');
      expect(domain.min).toBe(0);
      expect(domain.max).toBe(100);
      expect(domain.tiers).toHaveLength(5);
    });

    test('should get all domain IDs', () => {
      const influence = new Influence(mockDomains);
      const domainIds = influence.getDomainIds();
      
      expect(domainIds).toEqual(['political', 'economic', 'social']);
    });

    test('should convert toString', () => {
      const influence = new Influence(mockDomains, { political: 75, economic: 25, social: 45 });
      const str = influence.toString();
      
      expect(str).toContain('political: 75 (High)');
      expect(str).toContain('economic: 25 (Modest)');
      expect(str).toContain('social: 45 (Respected)');
    });
  });

  describe('Compatibility', () => {
    test('should create from InfluenceManager format', () => {
      const managerData = {
        domains: mockDomains,
        playerInfluence: { political: 30, economic: 20, social: 40 },
        history: {
          political: [{ timestamp: new Date(), change: 20, newValue: 30, reason: 'Test' }],
          economic: [],
          social: []
        }
      };
      
      const influence = Influence.fromInfluenceManager(managerData);
      
      expect(influence.getValue('political')).toBe(30);
      expect(influence.getValue('economic')).toBe(20);
      expect(influence.getValue('social')).toBe(40);
      expect(influence.getLastChange('political').reason).toBe('Test');
    });

    test('should handle missing InfluenceManager', () => {
      expect(() => Influence.fromInfluenceManager(null)).toThrow('InfluenceManager is required');
    });
  });

  describe('Edge Cases', () => {
    test('should handle domain with single tier', () => {
      const singleTierDomain = [{
        id: 'simple',
        name: 'Simple',
        description: 'Simple domain',
        min: 0,
        max: 100,
        defaultValue: 50,
        tiers: [{ name: 'Only', min: 0, max: 100, description: 'Only tier' }]
      }];
      
      const influence = new Influence(singleTierDomain);
      expect(influence.getTier('simple').name).toBe('Only');
    });

    test('should handle very large influence changes', () => {
      const influence = new Influence(mockDomains);
      const newInfluence = influence.withChange('political', 1000, 'Massive change');
      
      expect(newInfluence.getValue('political')).toBe(100); // Clamped to max
    });

    test('should handle very negative influence changes', () => {
      const influence = new Influence(mockDomains, { political: 50 });
      const newInfluence = influence.withChange('political', -1000, 'Massive loss');
      
      expect(newInfluence.getValue('political')).toBe(0); // Clamped to min
    });

    test('should handle zero change', () => {
      const influence = new Influence(mockDomains);
      const newInfluence = influence.withChange('political', 0, 'No change');
      
      expect(newInfluence.getValue('political')).toBe(10);
      expect(newInfluence.getLastChange('political').change).toBe(0);
    });

    test('should handle influence at exact tier boundaries', () => {
      const influence = new Influence(mockDomains, { 
        political: 30, // Exactly at Medium tier boundary
        economic: 50,  // Exactly at Wealthy tier boundary
        social: 70     // Exactly at Renowned tier boundary
      });
      
      expect(influence.getTier('political').name).toBe('Medium');
      expect(influence.getTier('economic').name).toBe('Wealthy');
      expect(influence.getTier('social').name).toBe('Renowned');
    });

    test('should handle multiple rapid changes', () => {
      let influence = new Influence(mockDomains);
      
      // Apply 10 rapid changes
      for (let i = 0; i < 10; i++) {
        influence = influence.withChange('political', 5, `Change ${i + 1}`);
      }
      
      expect(influence.getValue('political')).toBe(60); // 10 + (5 * 10)
      expect(influence.getDomainHistory('political')).toHaveLength(10);
      expect(influence.getLastChange('political').reason).toBe('Change 10');
    });

    test('should handle fractional influence changes', () => {
      const influence = new Influence(mockDomains);
      const newInfluence = influence.withChange('political', 2.5, 'Fractional change');
      
      expect(newInfluence.getValue('political')).toBe(12.5);
      expect(newInfluence.getLastChange('political').change).toBe(2.5);
    });

    test('should handle negative fractional changes', () => {
      const influence = new Influence(mockDomains, { political: 20 });
      const newInfluence = influence.withChange('political', -3.7, 'Negative fractional');
      
      expect(newInfluence.getValue('political')).toBe(16.3);
      expect(newInfluence.getLastChange('political').change).toBe(-3.7);
    });

    test('should handle changes that would exceed boundaries by small amounts', () => {
      const influence = new Influence(mockDomains, { political: 98 });
      const newInfluence = influence.withChange('political', 5, 'Small overflow');
      
      expect(newInfluence.getValue('political')).toBe(100); // Clamped to max
      expect(newInfluence.getLastChange('political').change).toBe(5); // Original change preserved
      expect(newInfluence.getLastChange('political').newValue).toBe(100); // But result is clamped
    });

    test('should handle changes that would go below minimum by small amounts', () => {
      const influence = new Influence(mockDomains, { political: 2 });
      const newInfluence = influence.withChange('political', -5, 'Small underflow');
      
      expect(newInfluence.getValue('political')).toBe(0); // Clamped to min
      expect(newInfluence.getLastChange('political').change).toBe(-5); // Original change preserved
      expect(newInfluence.getLastChange('political').newValue).toBe(0); // But result is clamped
    });

    test('should handle domains with unusual min/max ranges', () => {
      const unusualDomains = [{
        id: 'unusual',
        name: 'Unusual',
        description: 'Unusual range domain',
        min: -50,
        max: 200,
        defaultValue: 0,
        tiers: [
          { name: 'Negative', min: -50, max: -1, description: 'Negative influence' },
          { name: 'Neutral', min: 0, max: 99, description: 'Neutral influence' },
          { name: 'Positive', min: 100, max: 200, description: 'Positive influence' }
        ]
      }];
      
      const influence = new Influence(unusualDomains);
      expect(influence.getValue('unusual')).toBe(0);
      expect(influence.getTier('unusual').name).toBe('Neutral');
      
      const negativeInfluence = influence.withChange('unusual', -25, 'Go negative');
      expect(negativeInfluence.getValue('unusual')).toBe(-25);
      expect(negativeInfluence.getTier('unusual').name).toBe('Negative');
      
      const positiveInfluence = influence.withChange('unusual', 150, 'Go positive');
      expect(positiveInfluence.getValue('unusual')).toBe(150);
      expect(positiveInfluence.getTier('unusual').name).toBe('Positive');
    });

    test('should handle concurrent modifications through withChange', () => {
      const influence = new Influence(mockDomains);
      
      // Simulate concurrent modifications
      const change1 = influence.withChange('political', 10, 'Change 1');
      const change2 = influence.withChange('economic', 15, 'Change 2');
      const change3 = influence.withChange('social', 20, 'Change 3');
      
      // Each should be independent
      expect(change1.getValue('political')).toBe(20);
      expect(change1.getValue('economic')).toBe(5); // Unchanged
      
      expect(change2.getValue('economic')).toBe(20);
      expect(change2.getValue('political')).toBe(10); // Unchanged
      
      expect(change3.getValue('social')).toBe(35);
      expect(change3.getValue('political')).toBe(10); // Unchanged
    });
  });

  describe('Validation', () => {
    test('should validate domain min/max values', () => {
      const invalidDomain = [{
        id: 'invalid',
        name: 'Invalid',
        description: 'Invalid domain',
        min: 100,
        max: 0, // Max less than min
        defaultValue: 50,
        tiers: [{ name: 'Test', min: 0, max: 100, description: 'Test tier' }]
      }];
      
      expect(() => new Influence(invalidDomain)).toThrow('Domain min value must be less than max value');
    });

    test('should validate default value within bounds', () => {
      const invalidDomain = [{
        id: 'invalid',
        name: 'Invalid',
        description: 'Invalid domain',
        min: 0,
        max: 100,
        defaultValue: 150, // Outside bounds
        tiers: [{ name: 'Test', min: 0, max: 100, description: 'Test tier' }]
      }];
      
      expect(() => new Influence(invalidDomain)).toThrow('Domain default value must be within min/max range');
    });

    test('should validate tier structure', () => {
      const invalidDomain = [{
        id: 'invalid',
        name: 'Invalid',
        description: 'Invalid domain',
        min: 0,
        max: 100,
        defaultValue: 50,
        tiers: [{ name: 'Test', min: 50, max: 25, description: 'Invalid tier' }] // Min > Max
      }];
      
      expect(() => new Influence(invalidDomain)).toThrow('Tier min value must be less than max value');
    });

    test('should validate custom values within domain bounds', () => {
      expect(() => {
        new Influence(mockDomains, { political: 150 }); // Outside bounds
      }).toThrow("Value for domain 'political' must be between 0 and 100");
    });
  });
});