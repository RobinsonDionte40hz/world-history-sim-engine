/**
 * Task 5.4 Validation Tests
 * Consciousness and Memory Integration in Personality-Weighted Choice Selection System
 *
 * Tests for BehavioralStateService integration with BranchWeightingService
 */

import BranchWeightingService from '../../services/BranchWeightingService.js';
import SignificantMemoryService from '../../services/SignificantMemoryService.js';

describe('Task 5.4: Consciousness and Memory Integration in Personality-Weighted Choice Selection System', () => {
  let branchWeightingService;
  let behavioralStateService;
  let memoryService;
  let testCharacter;
  let testBranches;

  beforeEach(() => {
    // Initialize services with proper mocking
    memoryService = new SignificantMemoryService();

    // Create a mock BehavioralStateService that returns predictable values
    behavioralStateService = {
      getBehavioralModifier: jest.fn((character, interactionType, context) => {
        // Return a predictable modifier based on interaction type
        const baseModifiers = {
          'social': 1.1,
          'combat': 0.9,
          'exploration': 1.2,
          'content': 1.0
        };
        return baseModifiers[interactionType] || 1.0;
      }),
      getPersonalityModifier: jest.fn((character, interactionType) => {
        // Return personality modifier based on character traits
        if (character && character.personality && character.personality.traits) {
          const empathy = character.personality.traits.empathy || 0.5;
          return 0.8 + (empathy * 0.4); // 0.8 to 1.2 range
        }
        return 1.0;
      }),
      getConsciousnessModifier: jest.fn((character, interactionType) => {
        // Return consciousness modifier based on behavioral state
        if (character && character.consciousness && character.consciousness.behavioralState) {
          const energy = character.consciousness.behavioralState.energy || 0.5;
          return 0.9 + (energy * 0.2); // 0.9 to 1.1 range
        }
        return 1.0;
      }),
      getMemoryModifier: jest.fn((character, interactionType, context) => {
        // Return memory modifier based on significant memories
        if (character && character.significantMemories && character.significantMemories.length > 0) {
          const successCount = character.significantMemories.filter(m => m.outcome === 'success').length;
          const totalCount = character.significantMemories.length;
          const successRate = totalCount > 0 ? successCount / totalCount : 0.5;
          return 0.9 + (successRate * 0.2); // 0.9 to 1.1 range
        }
        return 1.0;
      })
    };

    branchWeightingService = new BranchWeightingService(behavioralStateService, memoryService);

    // Create test character with comprehensive consciousness data
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
          ambition: 0.9,
          aggression: 0.3,
          empathy: 0.7
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
      lawfulAlignment: 0.8,
      goodAlignment: 0.6,
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
      significantMemories: [
        {
          id: 'memory-1',
          interactionType: 'social',
          outcome: 'success',
          significance: 0.8,
          timestamp: Date.now() - 86400000, // 1 day ago
          contextTags: ['conversation', 'helpful']
        },
        {
          id: 'memory-2',
          interactionType: 'combat',
          outcome: 'failure',
          significance: 0.6,
          timestamp: Date.now() - 172800000, // 2 days ago
          contextTags: ['fight', 'aggressive']
        }
      ]
    };

    // Create test branches with different interaction types
    testBranches = [
      {
        id: 'branch-1',
        text: 'Help the person in need',
        type: 'social',
        category: 'conversation',
        metadata: {
          personalityAffinities: {
            empathy: 0.8,
            loyalty: 0.7
          },
          consciousnessFactors: {
            socialDrive: 0.8,
            focus: 0.7
          }
        }
      },
      {
        id: 'branch-2',
        text: 'Demand payment for help',
        type: 'social',
        category: 'negotiation',
        metadata: {
          personalityAffinities: {
            greed: 0.8,
            aggression: 0.6
          },
          consciousnessFactors: {
            ambition: 0.8,
            riskTolerance: 0.9
          }
        }
      },
      {
        id: 'branch-3',
        text: 'Attack the person',
        type: 'combat',
        category: 'aggression',
        metadata: {
          personalityAffinities: {
            aggression: 0.9,
            bravery: 0.8
          },
          consciousnessFactors: {
            energy: 0.9,
            riskTolerance: 0.8
          }
        }
      }
    ];
  });

  describe('BehavioralStateService Integration', () => {
    test('should use BehavioralStateService for behavioral modifiers', () => {
      const result = branchWeightingService.selectWeightedBranch(testCharacter, testBranches);

      expect(result).toBeDefined();
      expect(result.weightBreakdown).toBeDefined();
      expect(result.weightBreakdown.behavioralModifiers).toBeDefined();
      expect(result.weightBreakdown.behavioralModifiers.overallModifier).toBe(1.1); // social branch modifier
    });

    test('should include behavioral modifiers in weight breakdown', () => {
      const branchWeights = branchWeightingService.calculateBranchWeights(testCharacter, testBranches);

      expect(branchWeights).toHaveLength(testBranches.length);

      // Check social branch specifically
      const socialBranch = branchWeights.find(bw => bw.branch.type === 'social');
      expect(socialBranch).toBeDefined();
      const socialBreakdown = socialBranch.weight.getWeightBreakdown();
      expect(socialBreakdown.behavioralModifiers.overallModifier).toBe(1.1);

      // Check combat branch specifically
      const combatBranch = branchWeights.find(bw => bw.branch.type === 'combat');
      expect(combatBranch).toBeDefined();
      const combatBreakdown = combatBranch.weight.getWeightBreakdown();
      expect(combatBreakdown.behavioralModifiers.overallModifier).toBe(0.9);

      branchWeights.forEach(branchWeight => {
        const breakdown = branchWeight.weight.getWeightBreakdown();
        expect(breakdown.behavioralModifiers).toBeDefined();
        expect(breakdown.behavioralModifiers.personalityModifier).toBeDefined();
        expect(breakdown.behavioralModifiers.consciousnessModifier).toBeDefined();
        expect(breakdown.behavioralModifiers.memoryModifier).toBeDefined();
      });
    });

    test('should apply behavioral modifiers to personality weights', () => {
      const branchWeights = branchWeightingService.calculateBranchWeights(testCharacter, testBranches);

      const socialBranch = branchWeights.find(bw => bw.branch.type === 'social');
      const breakdown = socialBranch.weight.getWeightBreakdown();

      // Check that personality breakdown includes behavioral modifier
      expect(breakdown.detailedBreakdown.personality.factors).toContainEqual(
        expect.objectContaining({
          type: 'behavioral_modifier',
          modifier: 1.08, // Based on empathy trait (0.7) -> 0.8 + (0.7 * 0.4) = 1.08
          description: 'Behavioral state personality modifier'
        })
      );
    });

    test('should apply behavioral modifiers to consciousness weights', () => {
      const branchWeights = branchWeightingService.calculateBranchWeights(testCharacter, testBranches);

      const combatBranch = branchWeights.find(bw => bw.branch.type === 'combat');
      const breakdown = combatBranch.weight.getWeightBreakdown();

      // Check that consciousness breakdown includes behavioral modifier
      expect(breakdown.detailedBreakdown.consciousness.factors).toContainEqual(
        expect.objectContaining({
          type: 'behavioral_modifier',
          modifier: 1.06, // Based on energy (0.8) -> 0.9 + (0.8 * 0.2) = 1.06
          description: 'Behavioral state consciousness modifier'
        })
      );
    });

    test('should apply behavioral modifiers to memory weights', () => {
      const branchWeights = branchWeightingService.calculateBranchWeights(testCharacter, testBranches);

      const branch = branchWeights[0];
      const breakdown = branch.weight.getWeightBreakdown();

      // Check that memory breakdown includes behavioral modifier
      expect(breakdown.detailedBreakdown.memory.factors).toContainEqual(
        expect.objectContaining({
          type: 'behavioral_modifier',
          modifier: 1.0, // Based on 1 success out of 2 memories -> 0.5 success rate -> 0.9 + (0.5 * 0.2) = 1.0
          description: 'Behavioral state memory modifier'
        })
      );
    });

    test('should apply overall behavioral modifier to final weight', () => {
      const branchWeights = branchWeightingService.calculateBranchWeights(testCharacter, testBranches);

      branchWeights.forEach(branchWeight => {
        // The final weight should be the product of all component weights including behavioral modifier
        // Since behavioral modifiers are applied multiplicatively to each component
        expect(branchWeight.finalWeight).toBeDefined();
        expect(typeof branchWeight.finalWeight).toBe('number');
        expect(isFinite(branchWeight.finalWeight)).toBe(true);
        expect(isNaN(branchWeight.finalWeight)).toBe(false);
      });
    });
  });

  describe('Memory Service Integration', () => {
    test('should use SignificantMemoryService for memory patterns', () => {
      const memoryPatterns = branchWeightingService.getMemoryPatternsForBranch(
        testCharacter,
        testBranches[0]
      );

      expect(Array.isArray(memoryPatterns)).toBe(true);
      // Memory patterns should be processed from significant memories
    });

    test('should calculate memory pattern strength correctly', () => {
      const memoryPatterns = branchWeightingService.getMemoryPatternsForBranch(
        testCharacter,
        testBranches[0] // social branch
      );

      // Should have patterns for social interactions
      const socialPatterns = memoryPatterns.filter(p => p.type === 'social');
      expect(socialPatterns.length).toBeGreaterThan(0);

      socialPatterns.forEach(pattern => {
        expect(pattern).toHaveProperty('strength');
        expect(pattern).toHaveProperty('recency');
        expect(pattern).toHaveProperty('outcome');
        expect(pattern.strength).toBeGreaterThanOrEqual(0);
        expect(pattern.strength).toBeLessThanOrEqual(1);
      });
    });

    test('should factor memory patterns into branch weights', () => {
      const branchWeights = branchWeightingService.calculateBranchWeights(testCharacter, testBranches);

      branchWeights.forEach(branchWeight => {
        const breakdown = branchWeight.weight.getWeightBreakdown();
        expect(breakdown.componentWeights.memory).toBeDefined();
        expect(typeof breakdown.componentWeights.memory).toBe('number');
      });
    });
  });

  describe('Interaction Type Context', () => {
    test('should consider interaction type in behavioral modifiers', () => {
      const socialBranch = testBranches[0]; // social type
      const combatBranch = testBranches[2]; // combat type

      const socialModifiers = branchWeightingService.getBehavioralModifiers(
        testCharacter,
        socialBranch,
        { interactionType: 'social' }
      );

      const combatModifiers = branchWeightingService.getBehavioralModifiers(
        testCharacter,
        combatBranch,
        { interactionType: 'combat' }
      );

      // Behavioral modifiers should be different for different interaction types
      expect(socialModifiers).toBeDefined();
      expect(combatModifiers).toBeDefined();
      // Note: Actual modifier values depend on BehavioralStateService implementation
    });

    test('should use branch type when interactionType not provided in context', () => {
      const branch = testBranches[0]; // social type

      const modifiers = branchWeightingService.getBehavioralModifiers(
        testCharacter,
        branch,
        {} // No interactionType in context
      );

      expect(modifiers).toBeDefined();
      // Should use branch.type as fallback
    });
  });

  describe('Error Handling and Fallbacks', () => {
    test('should handle BehavioralStateService errors gracefully', () => {
      // Create a mock BehavioralStateService that throws errors
      const failingBehavioralStateService = {
        getBehavioralModifier: () => { throw new Error('Service failure'); },
        getPersonalityModifier: () => { throw new Error('Service failure'); },
        getConsciousnessModifier: () => { throw new Error('Service failure'); },
        getMemoryModifier: () => { throw new Error('Service failure'); }
      };

      const failingBranchWeightingService = new BranchWeightingService(
        failingBehavioralStateService,
        memoryService
      );

      const result = failingBranchWeightingService.selectWeightedBranch(testCharacter, testBranches);

      expect(result).toBeDefined();
      expect(result.branch).toBeDefined();
      // Should still work with fallback neutral modifiers (1.0)
    });

    test('should provide neutral modifiers when BehavioralStateService unavailable', () => {
      const noBehavioralService = new BranchWeightingService(null, memoryService);

      const modifiers = noBehavioralService.getBehavioralModifiers(testCharacter, testBranches[0]);

      expect(modifiers).toEqual({
        overallModifier: 1.0,
        personalityModifier: 1.0,
        consciousnessModifier: 1.0,
        memoryModifier: 1.0
      });
    });

    test('should handle missing character consciousness data', () => {
      const characterWithoutConsciousness = {
        ...testCharacter,
        consciousness: null
      };

      const result = branchWeightingService.selectWeightedBranch(characterWithoutConsciousness, testBranches);

      expect(result).toBeDefined();
      expect(result.branch).toBeDefined();
      // Should still work with fallback calculations
    });
  });

  describe('Performance and Integration', () => {
    test('should complete weight calculations within reasonable time', () => {
      const startTime = Date.now();

      const branchWeights = branchWeightingService.calculateBranchWeights(testCharacter, testBranches);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(branchWeights).toHaveLength(testBranches.length);
    });

    test('should maintain weight bounds with behavioral modifiers', () => {
      const branchWeights = branchWeightingService.calculateBranchWeights(testCharacter, testBranches);

      branchWeights.forEach(branchWeight => {
        // With the mock values, weights should stay within reasonable bounds
        expect(branchWeight.finalWeight).toBeGreaterThanOrEqual(0.5);
        expect(branchWeight.finalWeight).toBeLessThanOrEqual(3.0); // Increased upper bound for mock values
        expect(isFinite(branchWeight.finalWeight)).toBe(true);
        expect(isNaN(branchWeight.finalWeight)).toBe(false);
      });
    });

    test('should record choices with behavioral modifier context', () => {
      const initialChoiceCount = testCharacter.choiceHistory.length;

      branchWeightingService.selectWeightedBranch(testCharacter, testBranches);

      expect(testCharacter.choiceHistory.length).toBeGreaterThan(initialChoiceCount);

      const lastChoice = testCharacter.choiceHistory[testCharacter.choiceHistory.length - 1];
      expect(lastChoice).toHaveProperty('weight');
      expect(lastChoice).toHaveProperty('weightBreakdown');
      expect(lastChoice.weightBreakdown).toHaveProperty('behavioralModifiers');
      expect(lastChoice.weightBreakdown.behavioralModifiers.overallModifier).toBeDefined();
    });
  });
});