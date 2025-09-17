// src/test/lod/test-helpers.js

/**
 * Common test utilities and helpers for LOD system tests
 */

import { LODTier } from '../../../domain/value-objects/LODTier.js';

/**
 * Test fixtures for LOD characters
 */
export const LODTestFixtures = {
  /**
   * Create a hero-tier character fixture
   */
  createHeroCharacter(overrides = {}) {
    return {
      id: 'char-hero-001',
      name: 'Hero Character',
      lodTier: 'hero',
      consciousness: { frequency: 0.8, coherence: 0.7 },
      attributes: {
        strength: 15, dexterity: 14, constitution: 13,
        intelligence: 12, wisdom: 16, charisma: 15
      },
      assignments: {
        nodes: new Set(['node-village-center']),
        interactions: new Set(['interact-quest-main']),
        settlements: new Set(['settlement-oakwood'])
      },
      playerInteractionCount: 5,
      completedQuests: ['quest-main-plot', 'quest-side-quest'],
      inactivityTurns: 0,
      settlementLoyalty: new Map([['settlement-oakwood', 0.9]]),
      ...overrides
    };
  },

  /**
   * Create a group-tier character fixture
   */
  createGroupCharacter(overrides = {}) {
    return {
      id: 'char-group-001',
      name: 'Group Representative',
      lodTier: 'group',
      populationGroupId: 'group-merchants',
      groupStatistics: {
        size: 12,
        averageWealth: 150,
        morale: 0.7,
        productivity: 0.8
      },
      assignments: {
        nodes: new Set(['node-market-district']),
        interactions: new Set(),
        settlements: new Set(['settlement-oakwood'])
      },
      playerInteractionCount: 0,
      inactivityTurns: 3,
      ...overrides
    };
  },

  /**
   * Create a background-tier character fixture
   */
  createBackgroundCharacter(overrides = {}) {
    return {
      id: 'char-bg-001',
      name: 'Background Demographic',
      lodTier: 'background',
      assignments: {
        nodes: new Set(),
        interactions: new Set(),
        settlements: new Set(['settlement-oakwood'])
      },
      demographicData: {
        ageGroup: 'adult',
        occupation: 'farmer',
        count: 25
      },
      ...overrides
    };
  },

  /**
   * Create a small settlement fixture for testing
   */
  createSmallSettlement(overrides = {}) {
    return {
      id: 'settlement-test-small',
      name: 'Test Settlement',
      type: 'village',
      totalPopulation: 8,
      heroNPCs: new Set(['char-hero-001']),
      populationGroups: new Map([
        ['group-merchants', {
          id: 'group-merchants',
          name: 'Local Merchants',
          type: 'merchants',
          size: 5,
          representatives: new Set(['char-group-001'])
        }]
      ]),
      nodes: new Map([
        ['node-village-center', {
          id: 'node-village-center',
          name: 'Village Center',
          type: 'settlement',
          assignedCharacters: ['char-hero-001']
        }],
        ['node-market-district', {
          id: 'node-market-district',
          name: 'Market District',
          type: 'location',
          assignedCharacters: ['char-group-001']
        }]
      ]),
      ...overrides
    };
  },

  /**
   * Create a world context for testing
   */
  createWorldContext(overrides = {}) {
    return {
      turn: 5,
      settlements: new Map([['settlement-oakwood', this.createSmallSettlement()]]),
      characters: new Map([
        ['char-hero-001', this.createHeroCharacter()],
        ['char-group-001', this.createGroupCharacter()],
        ['char-bg-001', this.createBackgroundCharacter()]
      ]),
      ...overrides
    };
  }
};

/**
 * Performance measurement utilities
 */
export const PerformanceUtils = {
  /**
   * Measure execution time of a function
   */
  measureExecutionTime(fn, iterations = 1) {
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const endTime = performance.now();
    return {
      totalTime: endTime - startTime,
      averageTime: (endTime - startTime) / iterations,
      iterations
    };
  },

  /**
   * Measure memory usage of a function
   */
  async measureMemoryUsage(fn) {
    if (!performance.memory) {
      return { error: 'Memory measurement not available' };
    }

    const before = performance.memory.usedJSHeapSize;
    await fn();
    const after = performance.memory.usedJSHeapSize;

    return {
      before,
      after,
      difference: after - before,
      differenceMB: (after - before) / (1024 * 1024)
    };
  },

  /**
   * Assert performance requirements
   */
  assertPerformance(result, maxTime, label = 'operation') {
    if (result.totalTime > maxTime) {
      throw new Error(`${label} took ${result.totalTime.toFixed(2)}ms, exceeding limit of ${maxTime}ms`);
    }
    return true;
  }
};

/**
 * LOD-specific test utilities
 */
export const LODTestUtils = {
  /**
   * Validate LOD tier consistency
   */
  validateLODTierConsistency(character) {
    const tier = LODTier.get(character.lodTier);

    // Check required properties based on tier
    if (tier.requiresIndividualInstances()) {
      if (!character.consciousness) {
        throw new Error(`Hero tier character must have consciousness`);
      }
      if (!character.attributes) {
        throw new Error(`Hero tier character must have attributes`);
      }
    }

    if (tier.supportsStatisticalAggregation()) {
      if (character.lodTier === 'group' && !character.populationGroupId) {
        throw new Error(`Group tier character must have populationGroupId`);
      }
    }

    return true;
  },

  /**
   * Create a batch of test characters with different tiers
   */
  createCharacterBatch(counts = { hero: 1, group: 5, background: 10 }) {
    const characters = [];

    // Create hero characters
    for (let i = 0; i < counts.hero; i++) {
      characters.push(LODTestFixtures.createHeroCharacter({
        id: `char-hero-${i + 1}`,
        name: `Hero ${i + 1}`
      }));
    }

    // Create group characters
    for (let i = 0; i < counts.group; i++) {
      characters.push(LODTestFixtures.createGroupCharacter({
        id: `char-group-${i + 1}`,
        name: `Group Rep ${i + 1}`,
        populationGroupId: `group-${i + 1}`
      }));
    }

    // Create background characters
    for (let i = 0; i < counts.background; i++) {
      characters.push(LODTestFixtures.createBackgroundCharacter({
        id: `char-bg-${i + 1}`,
        name: `Background ${i + 1}`
      }));
    }

    return characters;
  },

  /**
   * Simulate tier promotion/demotion
   */
  simulateTierTransition(character, newTier, reason = 'test') {
    const oldTier = character.lodTier;
    const updatedCharacter = { ...character, lodTier: newTier };

    // Apply tier-specific changes
    if (newTier === 'hero') {
      updatedCharacter.consciousness = { frequency: 0.7, coherence: 0.6 };
      updatedCharacter.attributes = {
        strength: 12, dexterity: 12, constitution: 12,
        intelligence: 12, wisdom: 12, charisma: 12
      };
      updatedCharacter.populationGroupId = null;
      updatedCharacter.groupStatistics = null;
    } else if (newTier === 'group') {
      updatedCharacter.consciousness = null;
      updatedCharacter.attributes = null;
      updatedCharacter.populationGroupId = `group-${character.id}`;
      updatedCharacter.groupStatistics = {
        size: 8,
        averageWealth: 100,
        morale: 0.6
      };
    } else if (newTier === 'background') {
      updatedCharacter.consciousness = null;
      updatedCharacter.attributes = null;
      updatedCharacter.populationGroupId = null;
      updatedCharacter.groupStatistics = null;
    }

    return {
      character: updatedCharacter,
      transition: {
        from: oldTier,
        to: newTier,
        reason,
        timestamp: Date.now()
      }
    };
  }
};

/**
 * Mock utilities for testing
 */
export const MockUtils = {
  /**
   * Create a mock LOD manager
   */
  createMockLODManager() {
    return {
      processCharacter: jest.fn(),
      processCharacterTier: jest.fn(),
      promoteCharacter: jest.fn(),
      demoteCharacter: jest.fn(),
      evaluatePromotions: jest.fn(),
      evaluateDemotions: jest.fn(),
      getProcessingMetrics: jest.fn(() => ({
        totalProcessed: 0,
        averageProcessingTime: 0,
        memoryUsage: 0
      }))
    };
  },

  /**
   * Create a mock world context
   */
  createMockWorld() {
    return {
      turn: 1,
      settlements: new Map(),
      characters: new Map(),
      getCharacter: jest.fn(id => null),
      getSettlement: jest.fn(id => null),
      updateCharacter: jest.fn(),
      updateSettlement: jest.fn()
    };
  }
};

const LODTestHelpers = {
  LODTestFixtures,
  PerformanceUtils,
  LODTestUtils,
  MockUtils
};

export default LODTestHelpers;