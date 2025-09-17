/**
 * Population Group Service - Contract Tests
 *
 * Tests the PopulationGroupService API contracts for statistical modeling
 * and sampling capabilities in the LOD system.
 */

import PopulationGroupService from '../../domain/services/PopulationGroupService.js';

describe('Population Group Service - Contract Tests', () => {
  let service;
  let mockWorld;
  let mockSettlement;

  beforeEach(() => {
    service = new PopulationGroupService();

    // Mock world context
    mockWorld = {
      turn: 1,
      getSettlement: jest.fn(),
      getCharacter: jest.fn(),
      getNode: jest.fn()
    };

    // Mock settlement
    mockSettlement = {
      id: 'settlement-1',
      name: 'Test Settlement',
      resources: new Map([['food', 100], ['materials', 50]]),
      populationGroups: new Map()
    };

    mockWorld.getSettlement.mockReturnValue(mockSettlement);
  });

  describe('Service Contract', () => {
    test('should have required population group methods', () => {
      expect(typeof service.createPopulationGroup).toBe('function');
      expect(typeof service.updateGroupStatistics).toBe('function');
      expect(typeof service.processGroupTurn).toBe('function');
      expect(typeof service.materializeIndividual).toBe('function');
      expect(typeof service.absorbIndividualIntoGroup).toBe('function');
      expect(typeof service.sampleGroupMembers).toBe('function');
      expect(typeof service.aggregateGroupBehavior).toBe('function');
      expect(typeof service.generateGroupEvents).toBe('function');
      expect(typeof service.updateGroupDemographics).toBe('function');
    });

    test('should have statistical processing methods', () => {
      expect(typeof service.processGroupTurn).toBe('function');
      expect(typeof service.aggregateGroupBehavior).toBe('function');
      expect(typeof service.updateGroupStatistics).toBe('function');
    });

    test('should have sampling and individual management methods', () => {
      expect(typeof service.materializeIndividual).toBe('function');
      expect(typeof service.sampleGroupMembers).toBe('function');
      expect(typeof service.absorbIndividualIntoGroup).toBe('function');
    });
  });

  describe('Population Group Creation Contract', () => {
    test('should create population group with valid configuration', () => {
      const config = {
        name: 'Test Merchants',
        type: 'merchants',
        settlementId: 'settlement-1',
        nodeId: 'node-1',
        size: 25,
        averageAttributes: {
          strength: 8, dexterity: 12, constitution: 10,
          intelligence: 14, wisdom: 11, charisma: 15
        },
        morale: 0.7,
        productivity: 1.2
      };

      const result = service.createPopulationGroup(config);

      expect(result.success).toBe(true);
      expect(result.group).toBeDefined();
      expect(result.group.name).toBe('Test Merchants');
      expect(result.group.type).toBe('merchants');
      expect(result.group.size).toBe(25);
      expect(result.group.settlementId).toBe('settlement-1');
    });

    test('should generate unique IDs for population groups', () => {
      const config1 = { name: 'Group 1', settlementId: 'settlement-1' };
      const config2 = { name: 'Group 2', settlementId: 'settlement-1' };

      const result1 = service.createPopulationGroup(config1);
      const result2 = service.createPopulationGroup(config2);

      expect(result1.group.id).not.toBe(result2.group.id);
    });

    test('should validate required configuration parameters', () => {
      const invalidConfig = { name: 'Test Group' }; // Missing settlementId

      const result = service.createPopulationGroup(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('settlementId');
    });
  });

  describe('Group Processing Contract', () => {
    let testGroup;

    beforeEach(() => {
      const createResult = service.createPopulationGroup({
        name: 'Test Citizens',
        type: 'citizens',
        settlementId: 'settlement-1',
        nodeId: 'node-1',
        size: 50,
        morale: 0.6,
        productivity: 1.0
      });
      testGroup = createResult.group;
    });

    test('should process group turn with statistical updates', () => {
      const turnContext = {
        season: 'spring',
        economicConditions: 'stable',
        events: []
      };

      const result = service.processGroupTurn(testGroup.id, mockWorld, turnContext);

      expect(result.success).toBe(true);
      expect(result.groupId).toBe(testGroup.id);
      expect(result.processed).toBe(true);
      expect(result.aggregateEvents).toBeDefined();
      expect(Array.isArray(result.aggregateEvents)).toBe(true);
      expect(result.statistics).toBeDefined();
      expect(typeof result.processingTime).toBe('number');
    });

    test('should update group statistics based on world conditions', () => {
      const initialMorale = testGroup.morale;
      const initialProductivity = testGroup.productivity;

      // Process with positive conditions
      const positiveContext = {
        season: 'summer',
        economicConditions: 'booming',
        events: ['festival']
      };

      service.processGroupTurn(testGroup.id, mockWorld, positiveContext);

      // Morale and productivity should improve
      const updatedGroup = service.getGroup(testGroup.id);
      expect(updatedGroup.morale).toBeGreaterThanOrEqual(initialMorale);
      expect(updatedGroup.productivity).toBeGreaterThanOrEqual(initialProductivity);
    });

    test('should generate appropriate events based on group state', () => {
      // Set up group with low morale
      testGroup.morale = 0.2;
      testGroup.satisfaction = 0.3;

      const result = service.processGroupTurn(testGroup.id, mockWorld, {});

      expect(result.aggregateEvents.length).toBeGreaterThan(0);
      const unrestEvents = result.aggregateEvents.filter(e => e.type.includes('unrest') || e.type.includes('complaint') || e.type.includes('dissatisfaction'));
      expect(unrestEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Individual Sampling Contract', () => {
    let testGroup;

    beforeEach(() => {
      const createResult = service.createPopulationGroup({
        name: 'Test Artisans',
        type: 'artisans',
        settlementId: 'settlement-1',
        nodeId: 'node-1',
        size: 30,
        averageAttributes: {
          strength: 12, dexterity: 14, constitution: 13,
          intelligence: 11, wisdom: 10, charisma: 9
        },
        averageWealth: 50,
        skillLevel: 3
      });
      testGroup = createResult.group;
    });

    test('should sample individual characters from population group', () => {
      const sampleSize = 3;

      const result = service.sampleGroupMembers(testGroup.id, sampleSize);

      expect(result.success).toBe(true);
      expect(result.samples).toHaveLength(sampleSize);
      expect(result.groupId).toBe(testGroup.id);
      expect(result.sampleSize).toBe(sampleSize);

      // Verify each sample is a valid character data object
      result.samples.forEach(sample => {
        expect(sample).toBeDefined();
        expect(sample.id).toBeDefined();
        expect(sample.lodTier).toBe('group');
        expect(sample.populationGroupId).toBe(testGroup.id);
        expect(sample.attributes).toBeDefined();
      });
    });

    test('should apply statistical variation to sampled individuals', () => {
      const sampleSize = 10;
      const result = service.sampleGroupMembers(testGroup.id, sampleSize);

      const attributes = result.samples.map(s => s.attributes.strength);
      const average = attributes.reduce((sum, val) => sum + val, 0) / attributes.length;

      // Should have some variation around the group average
      expect(average).toBeGreaterThan(testGroup.averageAttributes.strength - 3);
      expect(average).toBeLessThan(testGroup.averageAttributes.strength + 3);
    });

    test('should limit sample size to reasonable bounds', () => {
      const excessiveSize = 50; // Larger than group size

      const result = service.sampleGroupMembers(testGroup.id, excessiveSize);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Sample size cannot exceed 10');
    });

    test('should materialize individual with custom template', () => {
      const template = {
        name: 'Test Artisan',
        age: 35,
        occupation: 'blacksmith'
      };

      const result = service.materializeIndividual(testGroup.id, template);

      expect(result.success).toBe(true);
      expect(result.character).toBeDefined();
      expect(result.character.name).toBe('Test Artisan');
      expect(result.character.age).toBe(35);
      expect(result.character.occupation).toBe('blacksmith');
      expect(result.character.lodTier).toBe('group');
    });
  });

  describe('Statistics Management Contract', () => {
    let testGroup;

    beforeEach(() => {
      const createResult = service.createPopulationGroup({
        name: 'Test Guards',
        type: 'guards',
        settlementId: 'settlement-1',
        nodeId: 'node-1',
        size: 20,
        morale: 0.8,
        productivity: 1.1
      });
      testGroup = createResult.group;
    });

    test('should update group statistics from member data', () => {
      const mockMembers = [
        { age: 20, wealth: 40, morale: 0.9 },
        { age: 25, wealth: 45, morale: 0.8 },
        { age: 40, wealth: 50, morale: 0.7 }
      ];

      const result = service.updateGroupStatistics(testGroup.id, mockMembers);

      expect(result.success).toBe(true);
      expect(result.updatedFields).toContain('averageAge');
      expect(result.updatedFields).toContain('averageWealth');
      expect(result.updatedFields).toContain('morale');
    });

    test('should aggregate group behavior patterns', () => {
      const context = {
        timeOfDay: 'evening',
        weather: 'rainy',
        recentEvents: ['tax_collection']
      };

      const result = service.aggregateGroupBehavior(testGroup.id, context);

      expect(result.success).toBe(true);
      expect(result.behaviorPatterns).toBeDefined();
      expect(typeof result.activityLevel).toBe('number');
      expect(typeof result.socialCohesion).toBe('number');
    });

    test('should update group demographics over time', () => {
      const result = service.updateGroupDemographics(testGroup.id);

      expect(result.success).toBe(true);
      expect(result.demographicChanges).toBeDefined();
      // Demographics should change (aging, births, deaths, migration)
      expect(result.demographicChanges.populationChange).toBeDefined();
    });
  });

  describe('Performance Requirements Contract', () => {
    test('should process group turns within performance limits', () => {
      const createResult = service.createPopulationGroup({
        name: 'Performance Test Group',
        type: 'citizens',
        settlementId: 'settlement-1',
        nodeId: 'node-1',
        size: 100
      });
      const testGroup = createResult.group;

      const startTime = performance.now();

      for (let i = 0; i < 10; i++) {
        service.processGroupTurn(testGroup.id, mockWorld, {});
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / 10;

      // Should process within 50ms per turn for statistical processing
      expect(averageTime).toBeLessThan(50);
    });

    test('should handle multiple groups efficiently', () => {
      // Create multiple groups
      const groups = [];
      for (let i = 0; i < 5; i++) {
        const result = service.createPopulationGroup({
          name: `Group ${i}`,
          type: 'citizens',
          settlementId: 'settlement-1',
          nodeId: `node-${i}`,
          size: 20 + i * 10
        });
        groups.push(result.group);
      }

      const startTime = performance.now();

      // Process all groups
      groups.forEach(group => {
        service.processGroupTurn(group.id, mockWorld, {});
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle 5 groups within 200ms total
      expect(totalTime).toBeLessThan(200);
    });

    test('should sample individuals efficiently', () => {
      const createResult = service.createPopulationGroup({
        name: 'Sampling Test Group',
        type: 'citizens',
        settlementId: 'settlement-1',
        nodeId: 'node-1',
        size: 1000
      });
      const testGroup = createResult.group;

      const startTime = performance.now();

      for (let i = 0; i < 5; i++) {
        service.sampleGroupMembers(testGroup.id, 5);
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / 5;

      // Should sample within 20ms per operation
      expect(averageTime).toBeLessThan(20);
    });
  });

  describe('Error Handling Contract', () => {
    test('should handle invalid group IDs gracefully', () => {
      const result = service.processGroupTurn('invalid-id', mockWorld, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    test('should handle missing world context', () => {
      const createResult = service.createPopulationGroup({
        name: 'Test Group',
        settlementId: 'settlement-1'
      });
      const testGroup = createResult.group;

      const result = service.processGroupTurn(testGroup.id, null, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('World context is required');
    });

    test('should validate sampling parameters', () => {
      const createResult = service.createPopulationGroup({
        name: 'Test Group',
        settlementId: 'settlement-1',
        size: 10
      });
      const testGroup = createResult.group;

      // Test negative sample size
      const result1 = service.sampleGroupMembers(testGroup.id, -1);
      expect(result1.success).toBe(false);

      // Test zero sample size
      const result2 = service.sampleGroupMembers(testGroup.id, 0);
      expect(result2.success).toBe(false);

      // Test excessive sample size
      const result3 = service.sampleGroupMembers(testGroup.id, 100);
      expect(result3.success).toBe(false);
    });

    test('should handle group statistics updates with empty member data', () => {
      const createResult = service.createPopulationGroup({
        name: 'Test Group',
        settlementId: 'settlement-1'
      });
      const testGroup = createResult.group;

      const result = service.updateGroupStatistics(testGroup.id, []);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Member data is required for statistics update');
    });
  });
});