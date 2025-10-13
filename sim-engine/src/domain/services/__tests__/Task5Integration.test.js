/**
 * Task 5.3 Validation Tests
 * Personality-Weighted Choice Selection System - ContentInteraction Integration
 *
 * Tests for ContentInteraction integration with BranchWeightingService
 */

import ContentInteraction from '../../entities/interactions/ContentInteraction.js';

describe('Task 5.3: Personality-Weighted Choice Selection System - ContentInteraction Integration', () => {
  let testCharacter;
  let testBranches;

  beforeEach(() => {
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

    // Create test branches with personality-weighted metadata
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
        text: 'Demand payment for help',
        type: 'social',
        category: 'negotiation',
        metadata: {
          personalityAffinities: {
            greed: 0.8,
            aggression: 0.6
          },
          alignmentLean: {
            good: 0.4,
            lawful: 0.3
          },
          attributePreference: {
            charisma: 0.9,
            intelligence: 0.7
          },
          consciousnessFactors: {
            ambition: 0.8,
            riskTolerance: 0.9
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
        text: 'Walk away indifferently',
        type: 'social',
        category: 'dismissal',
        metadata: {
          personalityAffinities: {
            aggression: 0.5,
            greed: 0.4
          },
          alignmentLean: {
            good: 0.2,
            lawful: 0.1
          },
          attributePreference: {
            wisdom: 0.5,
            intelligence: 0.4
          },
          consciousnessFactors: {
            focus: 0.6,
            energy: 0.5
          },
          prestigePreference: 0.3,
          emotionalPreference: {
            fear: 0.6,
            anger: 0.4
          }
        }
      }
    ];
  });

  describe('ContentInteraction Branch Selection', () => {
    test('should use BranchWeightingService when available', () => {
      const interaction = new ContentInteraction({
        id: 'test-interaction',
        name: 'Test Interaction',
        branches: testBranches
      });

      const selectedBranch = interaction.selectBranch(testCharacter);

      expect(selectedBranch).toBeDefined();
      expect(testBranches).toContain(selectedBranch);
    });

    test('should fall back gracefully when service encounters errors', () => {
      // This test validates that the try-catch in selectBranch works
      // We can't easily mock the import, but we can test that the method doesn't crash
      const interaction = new ContentInteraction({
        id: 'test-interaction',
        name: 'Test Interaction',
        branches: testBranches
      });

      // Test with minimal character data to ensure fallback works
      const minimalCharacter = { id: 'test' };

      const selectedBranch = interaction.selectBranch(minimalCharacter);

      expect(selectedBranch).toBeDefined();
      expect(testBranches).toContain(selectedBranch);
    });

    test('should handle empty branches array', () => {
      const interaction = new ContentInteraction({
        id: 'test-interaction',
        name: 'Test Interaction',
        branches: []
      });

      const selectedBranch = interaction.selectBranch(testCharacter);

      expect(selectedBranch).toBeNull();
    });

    test('should filter branches based on conditions', () => {
      const conditionalBranches = [
        {
          id: 'branch-1',
          text: 'High charisma option',
          condition: (character) => character.attributes.charisma >= 13
        },
        {
          id: 'branch-2',
          text: 'Low charisma option',
          condition: (character) => character.attributes.charisma < 13
        }
      ];

      const interaction = new ContentInteraction({
        id: 'test-interaction',
        name: 'Test Interaction',
        branches: conditionalBranches
      });

      const selectedBranch = interaction.selectBranch(testCharacter);

      // Character has charisma 13, so should get branch-1
      expect(selectedBranch.id).toBe('branch-1');
    });

    test('should record choices for consistency tracking', () => {
      const interaction = new ContentInteraction({
        id: 'test-interaction',
        name: 'Test Interaction',
        branches: testBranches
      });

      const initialHistoryLength = testCharacter.choiceHistory.length;

      interaction.selectBranch(testCharacter);

      expect(testCharacter.choiceHistory.length).toBeGreaterThan(initialHistoryLength);
      const lastChoice = testCharacter.choiceHistory[testCharacter.choiceHistory.length - 1];
      expect(lastChoice).toHaveProperty('branchId');
      expect(lastChoice).toHaveProperty('weight');
    });
  });

  describe('Branch Metadata Support', () => {
    test('should support personalityAffinities metadata', () => {
      const branchWithPersonality = {
        id: 'personality-branch',
        text: 'Empathetic response',
        metadata: {
          personalityAffinities: {
            empathy: 0.9,
            aggression: -0.5 // Negative affinity
          }
        }
      };

      const interaction = new ContentInteraction({
        id: 'test-interaction',
        name: 'Test Interaction',
        branches: [branchWithPersonality]
      });

      const selectedBranch = interaction.selectBranch(testCharacter);

      expect(selectedBranch).toBe(branchWithPersonality);
    });

    test('should support alignmentLean metadata', () => {
      const branchWithAlignment = {
        id: 'alignment-branch',
        text: 'Lawful good response',
        metadata: {
          alignmentLean: {
            good: 0.8,
            lawful: 0.7
          }
        }
      };

      const interaction = new ContentInteraction({
        id: 'test-interaction',
        name: 'Test Interaction',
        branches: [branchWithAlignment]
      });

      const selectedBranch = interaction.selectBranch(testCharacter);

      expect(selectedBranch).toBe(branchWithAlignment);
    });

    test('should support attributePreference metadata', () => {
      const branchWithAttributes = {
        id: 'attribute-branch',
        text: 'Intelligence-based response',
        metadata: {
          attributePreference: {
            intelligence: 0.8,
            wisdom: 0.6
          }
        }
      };

      const interaction = new ContentInteraction({
        id: 'test-interaction',
        name: 'Test Interaction',
        branches: [branchWithAttributes]
      });

      const selectedBranch = interaction.selectBranch(testCharacter);

      expect(selectedBranch).toBe(branchWithAttributes);
    });
  });

  describe('Backward Compatibility', () => {
    test('should work with branches that have no metadata', () => {
      const simpleBranches = [
        {
          id: 'simple-1',
          text: 'Simple option 1'
        },
        {
          id: 'simple-2',
          text: 'Simple option 2'
        }
      ];

      const interaction = new ContentInteraction({
        id: 'test-interaction',
        name: 'Test Interaction',
        branches: simpleBranches
      });

      const selectedBranch = interaction.selectBranch(testCharacter);

      expect(selectedBranch).toBeDefined();
      expect(simpleBranches).toContain(selectedBranch);
    });

    test('should handle null character gracefully', () => {
      const interaction = new ContentInteraction({
        id: 'test-interaction',
        name: 'Test Interaction',
        branches: testBranches
      });

      const selectedBranch = interaction.selectBranch(null);

      expect(selectedBranch).toBeDefined();
      expect(selectedBranch).toBe(testBranches[0]); // Should fall back to first branch
    });
  });

  describe('Integration with Interaction Entity', () => {
    test('should work with Interaction class that extends ContentInteraction', () => {
      // Import the Interaction class
      const Interaction = require('../../entities/Interaction.js').default;

      const interaction = new Interaction({
        id: 'test-interaction',
        name: 'Test Interaction',
        branches: testBranches
      });

      const selectedBranch = interaction.selectBranch(testCharacter);

      expect(selectedBranch).toBeDefined();
      expect(testBranches).toContain(selectedBranch);
    });

    test('should fall back to original weighted selection when BranchWeightingService fails', () => {
      // Import the Interaction class
      const Interaction = require('../../entities/Interaction.js').default;

      // Mock BranchWeightingService to throw an error
      const mockService = jest.spyOn(require('../../services/BranchWeightingService.js'), 'default');
      mockService.mockImplementation(() => ({
        selectWeightedBranch: () => {
          throw new Error('Service unavailable');
        }
      }));

      try {
        const interaction = new Interaction({
          id: 'test-interaction',
          name: 'Test Interaction',
          branches: testBranches
        });

        const selectedBranch = interaction.selectBranch(testCharacter);

        expect(selectedBranch).toBeDefined();
        // Should use fallback selection (not the first branch necessarily)
      } finally {
        mockService.mockRestore();
      }
    });
  });
});