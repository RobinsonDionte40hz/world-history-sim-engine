/**
 * Encounter System Integration Tests
 * 
 * Tests the complete encounter system including:
 * - Encounter entity functionality
 * - Turn-based simulation integration
 * - Interaction system integration
 * - Template system integration
 */

import Encounter from '../domain/entities/Encounter.js';
import EncounterService from '../application/services/EncounterService.js';
import Interaction from '../domain/entities/Interaction.js';

describe('Encounter System Integration Tests', () => {
  let encounterService;
  let mockContext;
  let mockCharacter;

  beforeEach(() => {
    encounterService = new EncounterService();
    
    mockCharacter = {
      id: 'test_character',
      level: 5,
      attributes: {
        strength: { score: 14 },
        dexterity: { score: 12 },
        constitution: { score: 13 },
        intelligence: { score: 10 },
        wisdom: { score: 11 },
        charisma: { score: 15 }
      },
      skills: {
        athletics: 3,
        stealth: 2,
        perception: 4
      },
      health: 100,
      energy: 80,
      mood: 60,
      quests: [],
      inventory: []
    };

    mockContext = {
      currentTurn: 1,
      nodeId: 'test_node',
      character: mockCharacter,
      participants: [mockCharacter]
    };
  });

  describe('Encounter Entity', () => {
    test('should create encounter with default values', () => {
      const encounter = new Encounter();
      
      expect(encounter.id).toBeDefined();
      expect(encounter.name).toBe('Unnamed Encounter');
      expect(encounter.type).toBe('combat');
      expect(encounter.difficulty).toBe('medium');
      expect(encounter.turnBased.duration).toBe(1);
      expect(encounter.turnBased.initiative).toBe('random');
      expect(encounter.turnBased.timing).toBe('immediate');
      expect(encounter.turnBased.sequencing).toBe('simultaneous');
    });

    test('should create encounter with custom configuration', () => {
      const config = {
        name: 'Dragon Battle',
        description: 'A fierce battle with an ancient dragon',
        type: 'combat',
        difficulty: 'deadly',
        challengeRating: 15,
        turnBased: {
          duration: 10,
          initiative: 'attribute',
          timing: 'immediate',
          sequencing: 'sequential'
        },
        outcomes: [
          {
            id: 'victory',
            description: 'Dragon defeated',
            probability: 0.3,
            effects: [{ type: 'experience', value: 5000 }]
          }
        ]
      };

      const encounter = new Encounter(config);
      
      expect(encounter.name).toBe('Dragon Battle');
      expect(encounter.type).toBe('combat');
      expect(encounter.difficulty).toBe('deadly');
      expect(encounter.challengeRating).toBe(15);
      expect(encounter.turnBased.duration).toBe(10);
      expect(encounter.outcomes).toHaveLength(1);
    });

    test('should validate prerequisites correctly', () => {
      const encounter = new Encounter({
        prerequisites: [
          { type: 'attribute', attribute: 'strength', value: 12 },
          { type: 'level', value: 3 }
        ]
      });

      // Should pass with sufficient stats
      expect(encounter.canTrigger(mockContext)).toBe(true);

      // Should fail with insufficient strength
      const weakContext = {
        ...mockContext,
        character: {
          ...mockCharacter,
          attributes: { ...mockCharacter.attributes, strength: { score: 8 } }
        }
      };
      expect(encounter.canTrigger(weakContext)).toBe(false);

      // Should fail with insufficient level
      const lowLevelContext = {
        ...mockContext,
        character: { ...mockCharacter, level: 2 }
      };
      expect(encounter.canTrigger(lowLevelContext)).toBe(false);
    });

    test('should handle cooldown correctly', () => {
      const encounter = new Encounter({
        cooldown: 5
      });

      // First trigger should work
      expect(encounter.canTrigger(mockContext)).toBe(true);
      encounter.markTriggered(1);

      // Should be on cooldown
      expect(encounter.canTrigger({ ...mockContext, currentTurn: 3 })).toBe(false);

      // Should be available after cooldown
      expect(encounter.canTrigger({ ...mockContext, currentTurn: 7 })).toBe(true);
    });

    test('should evaluate triggers correctly', () => {
      const encounter = new Encounter({
        triggers: [
          { type: 'probability', probability: 1.0 }, // Always trigger
          { type: 'location', nodeId: 'test_node' }
        ]
      });

      expect(encounter.canTrigger(mockContext)).toBe(true);

      // Should fail with wrong location
      const wrongLocationContext = { ...mockContext, nodeId: 'other_node' };
      expect(encounter.canTrigger(wrongLocationContext)).toBe(false);
    });

    test('should resolve outcomes with probability', () => {
      const encounter = new Encounter({
        outcomes: [
          { id: 'win', description: 'Victory', probability: 0.6 },
          { id: 'lose', description: 'Defeat', probability: 0.4 }
        ]
      });

      // Test multiple resolutions to check probability distribution
      const results = [];
      for (let i = 0; i < 100; i++) {
        const outcome = encounter.resolveOutcome(mockContext);
        results.push(outcome.id);
      }

      // Should have both outcomes represented
      expect(results.includes('win')).toBe(true);
      expect(results.includes('lose')).toBe(true);
    });

    test('should generate interactions correctly', () => {
      const encounter = new Encounter({
        name: 'Test Encounter',
        description: 'A test encounter',
        outcomes: [
          { id: 'success', description: 'Success', effects: [{ type: 'experience', value: 100 }] }
        ]
      });

      const interactions = encounter.generateInteractions();
      
      expect(interactions).toHaveLength(1);
      expect(interactions[0].name).toBe('Encounter: Test Encounter');
      expect(interactions[0].type).toBe('encounter');
      expect(interactions[0].branches).toHaveLength(1);
      expect(interactions[0].turnBased).toBeDefined();
    });
  });

  describe('Encounter Service', () => {
    test('should create and manage encounters', () => {
      const encounterData = {
        name: 'Test Encounter',
        type: 'combat',
        outcomes: [{ id: 'win', description: 'Victory' }]
      };

      const encounter = encounterService.createEncounter(encounterData);
      
      expect(encounter).toBeInstanceOf(Encounter);
      expect(encounterService.getEncounter(encounter.id)).toBe(encounter);
      expect(encounterService.getAllEncounters()).toContain(encounter);
    });

    test('should filter encounters by type', () => {
      encounterService.createEncounter({ name: 'Combat 1', type: 'combat' });
      encounterService.createEncounter({ name: 'Social 1', type: 'social' });
      encounterService.createEncounter({ name: 'Combat 2', type: 'combat' });

      const combatEncounters = encounterService.getEncountersByType('combat');
      const socialEncounters = encounterService.getEncountersByType('social');

      expect(combatEncounters).toHaveLength(2);
      expect(socialEncounters).toHaveLength(1);
    });

    test('should get available encounters for node', () => {
      // Create encounters with different restrictions
      const globalEncounter = encounterService.createEncounter({
        name: 'Global Encounter',
        nodeRestrictions: []
      });

      const restrictedEncounter = encounterService.createEncounter({
        name: 'Restricted Encounter',
        nodeRestrictions: ['specific_node']
      });

      const availableForTestNode = encounterService.getAvailableEncounters('test_node', mockContext);
      const availableForSpecificNode = encounterService.getAvailableEncounters('specific_node', mockContext);

      expect(availableForTestNode).toContain(globalEncounter);
      expect(availableForTestNode).not.toContain(restrictedEncounter);
      expect(availableForSpecificNode).toContain(globalEncounter);
      expect(availableForSpecificNode).toContain(restrictedEncounter);
    });

    test('should trigger encounters and create instances', () => {
      const encounter = encounterService.createEncounter({
        name: 'Test Encounter',
        type: 'combat',
        turnBased: { duration: 3 },
        outcomes: [{ id: 'win', description: 'Victory' }]
      });

      const instance = encounterService.triggerEncounter(encounter.id, mockContext);

      expect(instance).toBeDefined();
      expect(instance.encounterId).toBe(encounter.id);
      expect(instance.status).toBe('active');
      expect(instance.maxTurns).toBe(3);
      expect(instance.generatedInteractions).toBeDefined();
      expect(encounterService.getActiveEncounters()).toContain(instance);
    });

    test('should process turns for active encounters', () => {
      const encounter = encounterService.createEncounter({
        name: 'Short Encounter',
        turnBased: { duration: 2 },
        outcomes: [{ id: 'end', description: 'Encounter ends' }]
      });

      const instance = encounterService.triggerEncounter(encounter.id, mockContext);
      
      // Process first turn
      let results = encounterService.processTurn(2);
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('encounter_turn');
      expect(instance.currentTurn).toBe(1);

      // Process second turn (should complete)
      results = encounterService.processTurn(3);
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('encounter_completed');
      expect(encounterService.getActiveEncounters()).not.toContain(instance);
      expect(encounterService.getEncounterHistory()).toContain(instance);
    });

    test('should handle encounter statistics', () => {
      encounterService.createEncounter({ type: 'combat', difficulty: 'easy' });
      encounterService.createEncounter({ type: 'combat', difficulty: 'hard' });
      encounterService.createEncounter({ type: 'social', difficulty: 'medium' });

      const stats = encounterService.getEncounterStatistics();

      expect(stats.total).toBe(3);
      expect(stats.byType.combat).toBe(2);
      expect(stats.byType.social).toBe(1);
      expect(stats.byDifficulty.easy).toBe(1);
      expect(stats.byDifficulty.medium).toBe(1);
      expect(stats.byDifficulty.hard).toBe(1);
    });
  });

  describe('Turn-Based Integration', () => {
    test('should integrate with turn-based simulation timing', () => {
      const encounter = new Encounter({
        name: 'Turn-Based Test',
        turnBased: {
          duration: 3,
          initiative: 'attribute',
          timing: 'delayed',
          sequencing: 'sequential'
        }
      });

      const interactions = encounter.generateInteractions();
      const baseInteraction = interactions[0];

      expect(baseInteraction.turnBased).toBeDefined();
      expect(baseInteraction.turnBased.duration).toBe(3);
      expect(baseInteraction.turnBased.timing).toBe('delayed');
    });

    test('should handle different initiative types', () => {
      const randomInit = new Encounter({
        turnBased: { initiative: 'random' }
      });

      const attributeInit = new Encounter({
        turnBased: { initiative: 'attribute' }
      });

      const fixedInit = new Encounter({
        turnBased: { initiative: 'fixed' }
      });

      expect(randomInit.turnBased.initiative).toBe('random');
      expect(attributeInit.turnBased.initiative).toBe('attribute');
      expect(fixedInit.turnBased.initiative).toBe('fixed');
    });

    test('should handle different sequencing modes', () => {
      const simultaneous = new Encounter({
        turnBased: { sequencing: 'simultaneous' }
      });

      const sequential = new Encounter({
        turnBased: { sequencing: 'sequential' }
      });

      expect(simultaneous.turnBased.sequencing).toBe('simultaneous');
      expect(sequential.turnBased.sequencing).toBe('sequential');
    });
  });

  describe('Template Integration', () => {
    test('should create template from encounter', () => {
      const encounter = new Encounter({
        name: 'Template Source',
        description: 'Source for template',
        type: 'combat',
        difficulty: 'medium',
        outcomes: [{ id: 'win', description: 'Victory' }]
      });

      const template = encounter.toTemplate();

      expect(template.name).toBe('Template Source Template');
      expect(template.type).toBe('encounter');
      expect(template.template.type).toBe('combat');
      expect(template.template.difficulty).toBe('medium');
      expect(template.metadata.isTemplate).toBe(true);
    });

    test('should create encounter from template', () => {
      const template = {
        id: 'combat_template',
        name: 'Combat Template',
        description: 'A basic combat encounter template',
        type: 'encounter',
        template: {
          type: 'combat',
          difficulty: 'medium',
          challengeRating: 3,
          turnBased: {
            duration: 5,
            initiative: 'attribute'
          },
          outcomes: [
            { id: 'victory', description: 'Victory', probability: 0.7 }
          ]
        }
      };

      const encounter = Encounter.fromTemplate(template, {
        name: 'Specific Combat',
        challengeRating: 5
      });

      expect(encounter.name).toBe('Specific Combat');
      expect(encounter.type).toBe('combat');
      expect(encounter.difficulty).toBe('medium');
      expect(encounter.challengeRating).toBe(5); // Override applied
      expect(encounter.turnBased.duration).toBe(5);
      expect(encounter.template.templateId).toBe('combat_template');
    });

    test('should export and import templates through service', () => {
      const encounter = encounterService.createEncounter({
        name: 'Export Test',
        type: 'social',
        difficulty: 'easy'
      });

      const template = encounterService.exportAsTemplate(encounter.id);
      const newEncounter = encounterService.createFromTemplate(template, {
        name: 'Imported Encounter'
      });

      expect(newEncounter.name).toBe('Imported Encounter');
      expect(newEncounter.type).toBe('social');
      expect(newEncounter.difficulty).toBe('easy');
      expect(newEncounter.template.templateId).toBe(template.id);
    });
  });

  describe('Interaction System Integration', () => {
    test('should generate interactions with proper structure', () => {
      const encounter = new Encounter({
        name: 'Integration Test',
        description: 'Testing interaction integration',
        type: 'combat',
        prerequisites: [
          { type: 'attribute', attribute: 'strength', value: 12 }
        ],
        outcomes: [
          {
            id: 'victory',
            description: 'You emerge victorious',
            effects: [{ type: 'experience', value: 200 }],
            turnDuration: 2
          },
          {
            id: 'retreat',
            description: 'You retreat safely',
            effects: [{ type: 'experience', value: 50 }]
          }
        ],
        cooldown: 3
      });

      const interactions = encounter.generateInteractions();
      const baseInteraction = interactions[0];

      expect(baseInteraction.id).toContain('encounter_');
      expect(baseInteraction.name).toBe('Encounter: Integration Test');
      expect(baseInteraction.description).toBe('Testing interaction integration');
      expect(baseInteraction.type).toBe('encounter');
      expect(baseInteraction.requirements).toHaveLength(1);
      expect(baseInteraction.requirements[0].attr).toBe('strength');
      expect(baseInteraction.requirements[0].min).toBe(12);
      expect(baseInteraction.branches).toHaveLength(2);
      expect(baseInteraction.cooldown).toBe(3);
      expect(baseInteraction.repeatable).toBe(true);
      expect(baseInteraction.turnBased).toBeDefined();
    });

    test('should map encounter effects to interaction effects', () => {
      const encounter = new Encounter({
        outcomes: [
          {
            id: 'success',
            description: 'Success',
            effects: [
              { type: 'experience', value: 100 },
              { type: 'attribute', target: 'strength', value: 1 }
            ]
          }
        ]
      });

      const interactions = encounter.generateInteractions();
      const branch = interactions[0].branches[0];

      expect(branch.text).toBe('Success');
      expect(branch.effects).toHaveLength(2);
    });

    test('should handle encounter participants in interactions', () => {
      const encounter = new Encounter({
        participants: [
          { type: 'character', minLevel: 3 },
          { type: 'npc', role: 'merchant' }
        ]
      });

      const interactions = encounter.generateInteractions();
      const baseInteraction = interactions[0];

      expect(baseInteraction.participants).toHaveLength(2);
      expect(baseInteraction.participants[0].type).toBe('character');
      expect(baseInteraction.participants[1].role).toBe('merchant');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid encounter data gracefully', () => {
      expect(() => {
        new Encounter({
          challengeRating: -1 // Invalid
        });
      }).not.toThrow(); // Should create with default values

      expect(() => {
        Encounter.fromJSON(null);
      }).toThrow('Invalid JSON data for Encounter');
    });

    test('should handle missing encounters in service', () => {
      expect(() => {
        encounterService.triggerEncounter('nonexistent');
      }).toThrow('Encounter not found: nonexistent');

      expect(encounterService.getEncounter('nonexistent')).toBeUndefined();
    });

    test('should handle encounter resolution with no outcomes', () => {
      const encounter = new Encounter({
        outcomes: []
      });

      const outcome = encounter.resolveOutcome(mockContext);
      expect(outcome).toBeNull();
    });
  });

  describe('Serialization', () => {
    test('should serialize and deserialize encounters correctly', () => {
      const originalEncounter = new Encounter({
        name: 'Serialization Test',
        type: 'exploration',
        difficulty: 'hard',
        challengeRating: 8,
        turnBased: {
          duration: 4,
          initiative: 'fixed'
        },
        outcomes: [
          { id: 'find', description: 'Discovery made' }
        ],
        prerequisites: [
          { type: 'level', value: 5 }
        ]
      });

      const json = originalEncounter.toJSON();
      const deserializedEncounter = Encounter.fromJSON(json);

      expect(deserializedEncounter.name).toBe(originalEncounter.name);
      expect(deserializedEncounter.type).toBe(originalEncounter.type);
      expect(deserializedEncounter.difficulty).toBe(originalEncounter.difficulty);
      expect(deserializedEncounter.challengeRating).toBe(originalEncounter.challengeRating);
      expect(deserializedEncounter.turnBased.duration).toBe(originalEncounter.turnBased.duration);
      expect(deserializedEncounter.outcomes).toHaveLength(1);
      expect(deserializedEncounter.prerequisites).toHaveLength(1);
    });

    test('should handle service save/load operations', () => {
      // Create some encounters
      encounterService.createEncounter({ name: 'Test 1', type: 'combat' });
      encounterService.createEncounter({ name: 'Test 2', type: 'social' });

      // Save encounters
      const savedData = encounterService.saveEncounters();
      expect(savedData).toHaveLength(2);

      // Create new service and load
      const newService = new EncounterService();
      newService.loadEncounters(savedData);

      expect(newService.getAllEncounters()).toHaveLength(2);
      expect(newService.getAllEncounters().map(e => e.name)).toContain('Test 1');
      expect(newService.getAllEncounters().map(e => e.name)).toContain('Test 2');
    });
  });
});

// Run the tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  console.log('Running Encounter System Integration Tests...');
  
  // Simple test runner for Node.js environment
  const runTests = async () => {
    try {
      console.log('✓ All encounter system tests would run here');
      console.log('Note: Run with Jest for full test execution');
    } catch (error) {
      console.error('✗ Test execution failed:', error);
    }
  };

  runTests();
}