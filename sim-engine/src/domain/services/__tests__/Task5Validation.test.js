/**
 * Task 5.1 Validation Tests
 * Personality-Weighted Choice Selection System - Infrastructure
 *
 * Tests for BranchWeight value object and BranchWeightingService
 */

import BranchWeight from '../../valueObjects/BranchWeight.js';
import BranchWeightingService from '../BranchWeightingService.js';
import BehavioralStateService from '../BehavioralStateService.js';
import SignificantMemoryService from '../SignificantMemoryService.js';

describe('Task 5.1: Personality-Weighted Choice Selection System - Infrastructure', () => {
  let branchWeightingService;
  let behavioralStateService;
  let memoryService;

  // Test data
  let testCharacter;
  let testBranches;

  beforeEach(() => {
    // Initialize services
    memoryService = new SignificantMemoryService();
    behavioralStateService = new BehavioralStateService(memoryService);
    branchWeightingService = new BranchWeightingService(behavioralStateService, memoryService);

    // Create test character with comprehensive data
    testCharacter = {
      id: 'test-character-1',
      name: 'Test Character',
      consciousness: {
        frequency: 40,
        coherence: 0.8,
        behavioralState: {
          energy: 0.8,
          focus: 0.7,
          socialDrive: 0.6,
          riskTolerance: 0.5,
          ambition: 0.9
        }
      },
      personality: {
        traits: {
          empathy: 0.7,
          aggression: 0.3,
          curiosity: 0.8,
          loyalty: 0.6,
          greed: 0.4,
          bravery: 0.7
        }
      },
      attributes: {
        strength: 15,
        dexterity: 12,
        intelligence: 16,
        wisdom: 14,
        charisma: 13,
        constitution: 14
      },
      lawfulAlignment: 0.8, // Lawful
      goodAlignment: 0.6,   // Good
      prestige: 0.7,
      emotionalState: {
        happiness: 0.8,
        anger: 0.2,
        fear: 0.3,
        excitement: 0.6
      },
      choiceHistory: [
        { category: 'social', timestamp: Date.now() - 1000 },
        { category: 'social', timestamp: Date.now() - 2000 },
        { category: 'combat', timestamp: Date.now() - 3000 }
      ],
      significantMemories: []
    };

    // Create test branches with different metadata
    testBranches = [
      {
        id: 'branch-1',
        type: 'social',
        category: 'conversation',
        metadata: {
          personalityAffinities: {
            empathy: 0.8,
            curiosity: 0.7
          },
          alignmentLean: {
            good: 0.7,
            lawful: 0.6
          },
          attributePreference: {
            charisma: 0.8,
            wisdom: 0.6
          },
          consciousnessFactors: {
            socialDrive: 0.8,
            focus: 0.7
          },
          prestigePreference: 0.6,
          emotionalPreference: {
            happiness: 0.8,
            excitement: 0.6
          }
        }
      },
      {
        id: 'branch-2',
        type: 'combat',
        category: 'confrontation',
        metadata: {
          personalityAffinities: {
            aggression: 0.8,
            bravery: 0.9
          },
          alignmentLean: {
            good: 0.4,
            lawful: 0.3
          },
          attributePreference: {
            strength: 0.9,
            constitution: 0.7
          },
          consciousnessFactors: {
            riskTolerance: 0.8,
            energy: 0.9
          },
          prestigePreference: 0.8,
          emotionalPreference: {
            anger: 0.7,
            excitement: 0.8
          }
        }
      },
      {
        id: 'branch-3',
        type: 'exploration',
        category: 'discovery',
        metadata: {
          personalityAffinities: {
            curiosity: 0.9,
            bravery: 0.6
          },
          alignmentLean: {
            good: 0.5,
            lawful: 0.4
          },
          attributePreference: {
            intelligence: 0.8,
            wisdom: 0.7
          },
          consciousnessFactors: {
            focus: 0.8,
            ambition: 0.7
          },
          prestigePreference: 0.5,
          emotionalPreference: {
            excitement: 0.9,
            happiness: 0.6
          }
        }
      }
    ];
  });

  describe('BranchWeight Value Object', () => {
    test('should create valid BranchWeight instance', () => {
      const branchWeight = new BranchWeight(testCharacter, testBranches[0].metadata);

      expect(branchWeight).toBeDefined();
      expect(branchWeight.character).toBe(testCharacter);
      expect(branchWeight.branchMetadata).toBe(testBranches[0].metadata);
      expect(branchWeight.weights).toBeDefined();
      expect(branchWeight.breakdown).toBeDefined();
    });

    test('should calculate personality weight correctly', () => {
      const branchWeight = new BranchWeight(testCharacter, testBranches[0].metadata);
      const personalityWeight = branchWeight.calculatePersonalityWeight();

      expect(typeof personalityWeight).toBe('number');
      expect(personalityWeight).toBeGreaterThanOrEqual(0.1);
      expect(personalityWeight).toBeLessThanOrEqual(3.0);
      expect(branchWeight.weights.personality).toBe(personalityWeight);
    });

    test('should calculate alignment weight correctly', () => {
      const branchWeight = new BranchWeight(testCharacter, testBranches[0].metadata);
      const alignmentWeight = branchWeight.calculateAlignmentWeight();

      expect(typeof alignmentWeight).toBe('number');
      expect(alignmentWeight).toBeGreaterThanOrEqual(0.1);
      expect(alignmentWeight).toBeLessThanOrEqual(3.0);
      expect(branchWeight.weights.alignment).toBe(alignmentWeight);
    });

    test('should calculate attribute weight correctly', () => {
      const branchWeight = new BranchWeight(testCharacter, testBranches[0].metadata);
      const attributeWeight = branchWeight.calculateAttributeWeight();

      expect(typeof attributeWeight).toBe('number');
      expect(attributeWeight).toBeGreaterThanOrEqual(0.1);
      expect(attributeWeight).toBeLessThanOrEqual(3.0);
      expect(branchWeight.weights.attributes).toBe(attributeWeight);
    });

    test('should calculate consciousness weight correctly', () => {
      const branchWeight = new BranchWeight(testCharacter, testBranches[0].metadata);
      const consciousnessWeight = branchWeight.calculateConsciousnessWeight();

      expect(typeof consciousnessWeight).toBe('number');
      expect(consciousnessWeight).toBeGreaterThanOrEqual(0.1);
      expect(consciousnessWeight).toBeLessThanOrEqual(3.0);
      expect(branchWeight.weights.consciousness).toBe(consciousnessWeight);
    });

    test('should calculate prestige weight correctly', () => {
      const branchWeight = new BranchWeight(testCharacter, testBranches[0].metadata);
      const prestigeWeight = branchWeight.calculatePrestigeWeight();

      expect(typeof prestigeWeight).toBe('number');
      expect(prestigeWeight).toBeGreaterThanOrEqual(0.1);
      expect(prestigeWeight).toBeLessThanOrEqual(3.0);
      expect(branchWeight.weights.prestige).toBe(prestigeWeight);
    });

    test('should calculate emotional weight correctly', () => {
      const branchWeight = new BranchWeight(testCharacter, testBranches[0].metadata);
      const emotionalWeight = branchWeight.calculateEmotionalWeight();

      expect(typeof emotionalWeight).toBe('number');
      expect(emotionalWeight).toBeGreaterThanOrEqual(0.1);
      expect(emotionalWeight).toBeLessThanOrEqual(3.0);
      expect(branchWeight.weights.emotional).toBe(emotionalWeight);
    });

    test('should calculate consistency weight correctly', () => {
      const branchWeight = new BranchWeight(testCharacter, testBranches[0].metadata);
      const consistencyWeight = branchWeight.calculateConsistencyWeight();

      expect(typeof consistencyWeight).toBe('number');
      expect(consistencyWeight).toBeGreaterThanOrEqual(0.1);
      expect(consistencyWeight).toBeLessThanOrEqual(3.0);
      expect(branchWeight.weights.consistency).toBe(consistencyWeight);
    });

    test('should calculate final weight combining all factors', () => {
      const branchWeight = BranchWeight.create(testCharacter, testBranches[0].metadata);

      expect(branchWeight.finalWeight).toBeDefined();
      expect(typeof branchWeight.finalWeight).toBe('number');
      expect(branchWeight.finalWeight).toBeGreaterThanOrEqual(0.1);
      expect(branchWeight.finalWeight).toBeLessThanOrEqual(3.0);
    });

    test('should provide detailed weight breakdown', () => {
      const branchWeight = BranchWeight.create(testCharacter, testBranches[0].metadata);
      const breakdown = branchWeight.getWeightBreakdown();

      expect(breakdown.finalWeight).toBe(branchWeight.finalWeight);
      expect(breakdown.componentWeights).toBeDefined();
      expect(breakdown.detailedBreakdown).toBeDefined();
      expect(breakdown.componentWeights.personality).toBeDefined();
      expect(breakdown.detailedBreakdown.personality.factors).toBeDefined();
    });

    test('should clamp weights to valid bounds', () => {
      // Test with extreme metadata that would produce out-of-bounds weights
      const extremeMetadata = {
        personalityAffinities: { empathy: 1.0 },
        alignmentLean: { good: 1.0 },
        attributePreference: { charisma: 1.0 },
        consciousnessFactors: { socialDrive: 1.0 },
        prestigePreference: 1.0,
        emotionalPreference: { happiness: 1.0 }
      };

      const branchWeight = BranchWeight.create(testCharacter, extremeMetadata);

      // All weights should be within bounds
      Object.values(branchWeight.weights).forEach(weight => {
        expect(weight).toBeGreaterThanOrEqual(0.1);
        expect(weight).toBeLessThanOrEqual(3.0);
      });
      expect(branchWeight.finalWeight).toBeGreaterThanOrEqual(0.1);
      expect(branchWeight.finalWeight).toBeLessThanOrEqual(3.0);
    });

    test('should handle missing metadata gracefully', () => {
      const branchWeight = BranchWeight.create(testCharacter, {});

      expect(branchWeight.finalWeight).toBeDefined();
      expect(branchWeight.finalWeight).toBeGreaterThanOrEqual(0.1);
      expect(branchWeight.finalWeight).toBeLessThanOrEqual(3.0);
    });

    test('should validate inputs', () => {
      expect(() => new BranchWeight(null, {})).toThrow('Character is required');
      expect(() => new BranchWeight(testCharacter, null)).not.toThrow(); // null metadata is allowed
    });
  });

  describe('BranchWeightingService - Weight Calculation', () => {
    test('should calculate branch weights for multiple branches', () => {
      const branchWeights = branchWeightingService.calculateBranchWeights(
        testCharacter,
        testBranches
      );

      expect(branchWeights).toHaveLength(3);
      branchWeights.forEach(result => {
        expect(result.branch).toBeDefined();
        expect(result.weight).toBeInstanceOf(BranchWeight);
        expect(result.finalWeight).toBeDefined();
        expect(typeof result.finalWeight).toBe('number');
      });
    });

    test('should handle empty branches array', () => {
      expect(() => {
        branchWeightingService.calculateBranchWeights(testCharacter, []);
      }).toThrow('Branches array is required and cannot be empty');
    });

    test('should handle invalid character', () => {
      const branchWeights = branchWeightingService.calculateBranchWeights(
        null,
        testBranches
      );

      expect(branchWeights).toHaveLength(3);
      // Should return fallback neutral weights
      branchWeights.forEach(result => {
        expect(result.finalWeight).toBe(1.0);
      });
    });
  });

  describe('BranchWeightingService - Branch Selection', () => {
    test('should select weighted random branch', () => {
      const result = branchWeightingService.selectWeightedBranch(
        testCharacter,
        testBranches,
        {},
        'weighted_random'
      );

      expect(result.branch).toBeDefined();
      expect(result.weight).toBeDefined();
      expect(result.selectionMethod).toBe('weighted_random');
      expect(result.reason).toContain('Selected based on');
    });

    test('should select highest weight branch', () => {
      const result = branchWeightingService.selectWeightedBranch(
        testCharacter,
        testBranches,
        {},
        'highest_weight'
      );

      expect(result.branch).toBeDefined();
      expect(result.weight).toBeDefined();
      expect(result.selectionMethod).toBe('highest_weight');
      expect(result.reason).toContain('Selected highest weight');
    });

    test('should select personality-driven branch', () => {
      const result = branchWeightingService.selectWeightedBranch(
        testCharacter,
        testBranches,
        {},
        'personality_driven'
      );

      expect(result.branch).toBeDefined();
      expect(result.weight).toBeDefined();
      expect(result.selectionMethod).toBe('personality_driven');
      expect(result.reason).toContain('Personality-driven selection');
    });

    test('should select balanced branch', () => {
      const result = branchWeightingService.selectWeightedBranch(
        testCharacter,
        testBranches,
        {},
        'balanced'
      );

      expect(result.branch).toBeDefined();
      expect(result.weight).toBeDefined();
      expect(result.selectionMethod).toBe('balanced');
      expect(result.reason).toContain('Balanced selection');
    });

    test('should record choices for consistency tracking', () => {
      const initialHistoryLength = testCharacter.choiceHistory.length;

      branchWeightingService.selectWeightedBranch(
        testCharacter,
        testBranches,
        { includeWeightBreakdown: true }
      );

      expect(testCharacter.choiceHistory.length).toBeGreaterThan(initialHistoryLength);
      const lastChoice = testCharacter.choiceHistory[testCharacter.choiceHistory.length - 1];
      expect(lastChoice).toHaveProperty('branchId');
      expect(lastChoice).toHaveProperty('weight');
      expect(lastChoice).toHaveProperty('timestamp');
    });

    test('should handle selection errors gracefully', () => {
      const result = branchWeightingService.selectWeightedBranch(
        null, // Invalid character - should use fallback weights but proceed normally
        testBranches
      );

      expect(result.branch).toBeDefined();
      expect(result.selectionMethod).toBe('weighted_random'); // Normal selection with fallback weights
      expect(result.weight).toBeDefined();
    });
  });

  describe('BranchWeightingService - Memory Integration', () => {
    test('should get memory patterns for branch evaluation', () => {
      const patterns = branchWeightingService.getMemoryPatternsForBranch(
        testCharacter,
        testBranches[0]
      );

      expect(Array.isArray(patterns)).toBe(true);
      // Should return empty array for character with no memories
      expect(patterns).toHaveLength(0);
    });

    test('should calculate memory pattern strength', () => {
      const memory = {
        interactionType: 'social',
        outcome: 'success',
        significance: 0.8,
        contextTags: ['friendly']
      };

      const strength = branchWeightingService.calculateMemoryPatternStrength(
        memory,
        testBranches[0]
      );

      expect(typeof strength).toBe('number');
      expect(strength).toBeGreaterThanOrEqual(0);
      expect(strength).toBeLessThanOrEqual(1);
    });

    test('should calculate memory recency', () => {
      const recentMemory = { timestamp: Date.now() - (1 * 60 * 60 * 1000) }; // 1 hour ago
      const oldMemory = { timestamp: Date.now() - (30 * 24 * 60 * 60 * 1000) }; // 30 days ago

      const recentRecency = branchWeightingService.calculateMemoryRecency(recentMemory);
      const oldRecency = branchWeightingService.calculateMemoryRecency(oldMemory);

      expect(recentRecency).toBeGreaterThan(oldRecency);
      expect(recentRecency).toBeGreaterThanOrEqual(0.6); // Recent should be high
      expect(oldRecency).toBeLessThanOrEqual(0.3); // Old should be low
    });
  });

  describe('BranchWeightingService - Analysis and Utilities', () => {
    test('should analyze branch weights distribution', () => {
      const branchWeights = branchWeightingService.calculateBranchWeights(
        testCharacter,
        testBranches
      );

      const analysis = branchWeightingService.analyzeBranchWeights(branchWeights);

      expect(analysis.count).toBe(3);
      expect(analysis).toHaveProperty('totalWeight');
      expect(analysis).toHaveProperty('averageWeight');
      expect(analysis).toHaveProperty('minWeight');
      expect(analysis).toHaveProperty('maxWeight');
      expect(analysis).toHaveProperty('distribution');
      expect(analysis).toHaveProperty('weights');
    });

    test('should get available selection methods', () => {
      const methods = branchWeightingService.getAvailableSelectionMethods();

      expect(Array.isArray(methods)).toBe(true);
      expect(methods).toContain('weighted_random');
      expect(methods).toContain('highest_weight');
      expect(methods).toContain('personality_driven');
      expect(methods).toContain('balanced');
    });

    test('should handle analysis of empty branch weights', () => {
      const analysis = branchWeightingService.analyzeBranchWeights([]);

      expect(analysis.error).toBe('No branch weights to analyze');
    });
  });

  describe('Integration with BehavioralStateService', () => {
    test('should integrate with BehavioralStateService for consciousness factors', () => {
      // Test that BranchWeightingService uses BehavioralStateService
      const branchWeights = branchWeightingService.calculateBranchWeights(
        testCharacter,
        testBranches
      );

      // Verify that consciousness weights are calculated
      branchWeights.forEach(result => {
        expect(result.weight.weights.consciousness).toBeDefined();
        expect(typeof result.weight.weights.consciousness).toBe('number');
      });
    });
  });

  describe('Consistency Bonus Calculation', () => {
    test('should calculate consistency bonus from choice history', () => {
      const branchWeight = new BranchWeight(testCharacter, {});
      const consistencyWeight = branchWeight.calculateConsistencyWeight();

      expect(typeof consistencyWeight).toBe('number');
      expect(consistencyWeight).toBeGreaterThanOrEqual(0.1);
      expect(consistencyWeight).toBeLessThanOrEqual(3.0);
    });

    test('should handle character with no choice history', () => {
      const characterNoHistory = { ...testCharacter, choiceHistory: [] };
      const branchWeight = new BranchWeight(characterNoHistory, {});
      const consistencyWeight = branchWeight.calculateConsistencyWeight();

      expect(consistencyWeight).toBe(1.0); // Neutral weight
    });
  });

  describe('Error Handling', () => {
    test('should handle calculation errors gracefully', () => {
      // Force an error by passing invalid data that will cause calculation errors
      const branchWeights = branchWeightingService.calculateBranchWeights(
        null, // This should trigger the error handling
        testBranches
      );

      expect(branchWeights).toHaveLength(3);
      // Should return fallback weights
      branchWeights.forEach(result => {
        expect(result.finalWeight).toBe(1.0);
      });
    });

    test('should handle selection method errors gracefully', () => {
      const result = branchWeightingService.selectWeightedBranch(
        testCharacter,
        testBranches,
        {},
        'invalid_method'
      );

      // Should fall back to default method
      expect(result.selectionMethod).toBe('weighted_random');
    });
  });
});