/**
 * Comprehensive Integration Tests for Hierarchical Interaction System
 *
 * This test suite covers end-to-end workflows for the complete interaction system,
 * including system/content interaction coordination, environmental integration,
 * behavior generation, and performance benchmarks.
 */

import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

// Core domain entities
import Character from '../../domain/entities/Character.js';
import Node from '../../domain/entities/Node.js';
import Environment from '../../domain/value-objects/Environment.js';

// Interaction system
import InteractionManager from '../../domain/services/InteractionManager.js';
import InteractionExecutor from '../../domain/services/InteractionExecutor.js';
import InteractionFactory from '../../domain/entities/interactions/InteractionFactory.js';

// System interactions
import RestInteraction from '../../domain/entities/interactions/RestInteraction.js';

// Content interactions
import ContentInteraction from '../../domain/entities/interactions/ContentInteraction.js';

// Use cases
import generateBehavior from '../../application/use-cases/npc/GenerateBehavior.js';

// Mock services for controlled testing (removed non-existent services)
// jest.mock('../../domain/services/NavigationService.js');
// jest.mock('../../domain/services/PerceptionService.js');

// Test fixtures
const createTestCharacter = (overrides = {}) => {
  const baseConfig = {
    id: 'test-char',
    name: 'Test Character',
    energy: 50,
    maxEnergy: 100,
    currentNodeId: 'test-node',
    baseAttributes: {
      strength: 12,
      dexterity: 12,
      constitution: 12,
      intelligence: 12,
      wisdom: 12,
      charisma: 12
    },
    consciousness: {
      frequency: 40,
      coherence: 0.8,
      awareness: 0.6,
      stability: 0.7
    },
    goals: [{ id: 'explore' }],
    decisionHistory: []
  };

  return new Character({ ...baseConfig, ...overrides });
};

const createTestNode = (overrides = {}) => {
  return new Node({
    id: 'test-node',
    name: 'Test Node',
    connections: [
      { targetNodeId: 'connected-node-1', type: 'path' },
      { targetNodeId: 'connected-node-2', type: 'path' }
    ],
    resources: [
      { id: 'resource-1', name: 'Ancient Artifact' },
      { id: 'resource-2', name: 'Mysterious Crystal' }
    ],
    environment: new Environment({
      terrain: 'plains',
      climate: 'temperate',
      lighting: 'daylight',
      hazards: []
    }),
    ...overrides
  });
};

const createTestWorldState = (overrides = {}) => {
  const node = createTestNode();
  const character = createTestCharacter();
  
  // Add additional characters for examine interactions
  const otherCharacters = [
    createTestCharacter({ id: 'char-2', name: 'NPC 1', currentNodeId: 'test-node' }),
    createTestCharacter({ id: 'char-3', name: 'NPC 2', currentNodeId: 'test-node' })
  ];

  // Create connected nodes for movement interactions
  const connectedNode1 = createTestNode({
    id: 'connected-node-1',
    name: 'Connected Node 1'
  });
  const connectedNode2 = createTestNode({
    id: 'connected-node-2', 
    name: 'Connected Node 2'
  });

  return {
    time: 1000,
    nodes: [node, connectedNode1, connectedNode2],
    characters: [character, ...otherCharacters],
    getCurrentEnvironment: jest.fn(() => node.environment),
    getNodeById: jest.fn((id) => {
      const allNodes = [node, connectedNode1, connectedNode2];
      return allNodes.find(n => n.id === id) || null;
    }),
    getCharacterById: jest.fn((id) => {
      const allChars = [character, ...otherCharacters];
      return allChars.find(c => c.id === id) || null;
    }),
    ...overrides
  };
};

describe('Hierarchical Interaction System - End-to-End Integration', () => {

  let interactionManager;
  let interactionExecutor;
  let interactionFactory;
  let testCharacter;
  let testNode;
  let testWorldState;

  beforeEach(() => {
    // Initialize services
    interactionManager = new InteractionManager();
    interactionExecutor = new InteractionExecutor();
    interactionFactory = InteractionFactory; // Use static class directly

    // Create test fixtures
    testCharacter = createTestCharacter();
    testNode = createTestNode();
    testWorldState = createTestWorldState();

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Complete Interaction Workflow', () => {
    test('should execute full system interaction workflow from creation to execution', async () => {
      // 1. Create system interaction
      const restInteraction = interactionFactory.createRest({
        duration: 2,
        priority: 80
      });

      expect(restInteraction).toBeInstanceOf(RestInteraction);
      expect(restInteraction.type).toBe('system');
      expect(restInteraction.priority).toBe(80);

      // 2. Verify interaction is available through manager
      const availableInteractions = interactionManager.getAvailableInteractions({
        character: testCharacter,
        world: testWorldState,
        currentNode: testNode
      });

      expect(availableInteractions.systemInteractions.length).toBeGreaterThan(0);
      const foundRest = availableInteractions.systemInteractions.find(
        interaction => interaction.constructor.name === 'RestInteraction'
      );
      expect(foundRest).toBeDefined();

      // 3. Execute interaction
      const executionResult = await interactionExecutor.execute(
        restInteraction,
        testCharacter,
        testWorldState
      );

      expect(executionResult.success).toBe(true);
      expect(executionResult.energyConsumed).toBeDefined();
      expect(testCharacter.energy).toBeGreaterThan(50); // Energy should increase after rest
    });

    test('should execute full content interaction workflow', async () => {
      // 1. Create content interaction
      const contentInteraction = interactionFactory.createContent({
        id: 'test-content-interaction',
        name: 'Test Dialogue',
        description: 'A test content interaction',
        category: 'dialogue',
        author: 'Test Author',
        branches: [
          {
            id: 'choice1',
            text: 'Hello there!',
            effects: [{ type: 'relationship', targetId: 'npc1', change: 5 }]
          }
        ]
      });

      expect(contentInteraction).toBeInstanceOf(ContentInteraction);
      expect(contentInteraction.type).toBe('content');
      expect(contentInteraction.author).toBe('Test Author');

      // 2. Add to node's available interactions
      testNode.addInteraction(contentInteraction);
      
      // Debug: Check what's in the node
      console.log('Node contentInteractions:', testNode.contentInteractions.length);
      console.log('Content interaction canExecute:', contentInteraction.canExecute ? 'has method' : 'no method');

      // 3. Verify through manager
      const availableInteractions = interactionManager.getAvailableInteractions({
        character: testCharacter,
        world: testWorldState,
        currentNode: testNode
      });

      expect(availableInteractions.contentInteractions.length).toBeGreaterThan(0);
      const foundContent = availableInteractions.contentInteractions.find(
        interaction => interaction.id === 'test-content-interaction'
      );
      expect(foundContent).toBeDefined();

      // 4. Execute interaction
      const executionResult = await interactionExecutor.execute(
        contentInteraction,
        testCharacter,
        testWorldState
      );

      expect(executionResult.success).toBe(true);
    });
  });

  describe('System and Content Interaction Coordination', () => {
    test('should coordinate system and content interactions in behavior generation', () => {
      // Add content interactions to node
      const contentInteraction = interactionFactory.createContent({
        id: 'explore-dialogue',
        name: 'Explore Dialogue',
        category: 'dialogue',
        branches: [{ id: 'choice1', text: 'Tell me about this place' }]
      });
      
      // Add to the correct node in world state
      const worldNode = testWorldState.nodes.find(node => node.id === testCharacter.currentNodeId);
      worldNode.addInteraction(contentInteraction);

      // Generate behavior
      const behaviorResult = generateBehavior(testCharacter, testWorldState);

      expect(behaviorResult).toBeDefined();
      expect(behaviorResult.interaction).toBeDefined();

      // Should be able to select either system or content interaction
      const interaction = behaviorResult.interaction;
      expect(['system', 'content']).toContain(interaction.type);
    });

    test('should prioritize system interactions for critical needs', () => {
      // Set character energy very low to trigger critical rest
      const lowEnergyCharacter = createTestCharacter({ energy: 4 }); // Below critical threshold

      const behaviorResult = generateBehavior(lowEnergyCharacter, testWorldState);

      expect(behaviorResult).toBeDefined();
      expect(behaviorResult.interaction.type).toBe('system');
      expect(behaviorResult.interaction.constructor.name).toBe('RestInteraction');
    });

    test('should balance system and content interactions based on context', () => {
      // Character with normal energy but exploration goal
      const explorationCharacter = createTestCharacter({
        energy: 70,
        goals: [{ id: 'explore' }]
      });

      // Add exploration content interaction
      const exploreInteraction = interactionFactory.createContent({
        id: 'explore-quest',
        name: 'Explore Area',
        category: 'quest',
        branches: [{ id: 'choice1', text: 'Search for clues' }]
      });
      
      // Add to the correct node in world state
      const worldNode = testWorldState.nodes.find(node => node.id === explorationCharacter.currentNodeId);
      worldNode.addInteraction(exploreInteraction);

      const behaviorResult = generateBehavior(explorationCharacter, testWorldState);

      expect(behaviorResult).toBeDefined();
      // Should potentially select content interaction for exploration goal
      expect(behaviorResult.interaction).toBeDefined();
    });
  });

  describe('Environmental Integration Across Interaction Types', () => {
    test('should integrate environment with system interactions', () => {
      // Create dangerous environment
      const dangerousEnv = new Environment({
        terrain: 'mountains',
        climate: 'arctic',
        lighting: 'night',
        hazards: ['blizzard', 'avalanche']
      });

      testNode.environment = dangerousEnv;
      testWorldState.getCurrentEnvironment = jest.fn(() => dangerousEnv);

      const availableInteractions = interactionManager.getAvailableInteractions({
        character: testCharacter,
        world: testWorldState,
        currentNode: testNode
      });

      // Should have movement interaction available due to danger
      const movementInteraction = availableInteractions.systemInteractions.find(
        interaction => interaction.constructor.name === 'MovementInteraction'
      );
      expect(movementInteraction).toBeDefined();
    });

    test('should modify interaction effectiveness based on environment', async () => {
      // Uncomfortable environment (cold, windy, poor conditions)
      const uncomfortableEnv = new Environment({
        terrain: 'tundra',
        climate: 'arctic',
        lighting: 'night',
        hazards: [],
        shelterQuality: 0.2, // Poor shelter
        airQuality: 0.4,      // Poor air quality
        waterAvailability: 0.3, // Limited water
        temperature: -25      // Very cold
      });

      // Create rest interaction in uncomfortable environment
      const restInteraction = interactionFactory.createRest({
        duration: 1,
        environment: uncomfortableEnv,
        isSafe: true // Allow resting in dangerous environment
      });

      testNode.environment = uncomfortableEnv;
      testWorldState.getCurrentEnvironment = jest.fn(() => uncomfortableEnv);

      const initialEnergy = testCharacter.energy;
      const executionResult = await interactionExecutor.execute(
        restInteraction,
        testCharacter,
        testWorldState
      );

      expect(executionResult.success).toBe(true);
      // Energy recovery should be improved due to safe location in dangerous environment
      expect(testCharacter.energy).toBeGreaterThan(initialEnergy);
      expect(executionResult.environmentalModifier).toBe(1.2); // Safe location bonus
    });

    test('should handle perception interactions with environmental factors', () => {
      // Create dark environment
      const darkEnv = new Environment({
        terrain: 'cave',
        climate: 'underground',
        lighting: 'dark',
        hazards: []
      });

      testNode.environment = darkEnv;
      testWorldState.getCurrentEnvironment = jest.fn(() => darkEnv);

      const availableInteractions = interactionManager.getAvailableInteractions({
        character: testCharacter,
        world: testWorldState,
        currentNode: testNode
      });

      // Should have perception interaction available
      const perceptionInteraction = availableInteractions.systemInteractions.find(
        interaction => interaction.constructor.name === 'PerceptionInteraction'
      );
      expect(perceptionInteraction).toBeDefined();

      // Effectiveness should be reduced in dark environment
      expect(perceptionInteraction.getPerceptionEffectiveness(testCharacter, testWorldState)).toBeLessThan(1.0);
    });
  });

  describe('Behavior Generation with Mixed Interaction Types', () => {
    test('should generate behavior with weighted selection between types', () => {
      // Add multiple content interactions
      const dialogueInteraction = interactionFactory.createContent({
        id: 'greeting',
        name: 'Greeting',
        category: 'dialogue',
        branches: [{ id: 'choice1', text: 'Hello!' }]
      });

      const tradeInteraction = interactionFactory.createContent({
        id: 'trade-offer',
        name: 'Trade Offer',
        category: 'trade',
        branches: [{ id: 'choice1', text: 'Want to trade?' }]
      });

      // Add to the correct node in world state
      const worldNode = testWorldState.nodes.find(node => node.id === testCharacter.currentNodeId);
      worldNode.addInteraction(dialogueInteraction);
      worldNode.addInteraction(tradeInteraction);

      // Generate multiple behaviors to test distribution
      const results = [];
      for (let i = 0; i < 10; i++) {
        const result = generateBehavior(testCharacter, testWorldState);
        if (result) results.push(result);
      }

      expect(results.length).toBeGreaterThan(0);

      // Should have mix of system and content interactions
      const systemCount = results.filter(r => r.interaction.type === 'system').length;
      const contentCount = results.filter(r => r.interaction.type === 'content').length;

      expect(systemCount + contentCount).toBe(results.length);
    });

    test('should respect character goals in interaction selection', () => {
      // Create character with social goal
      const socialCharacter = createTestCharacter({
        goals: [{ id: 'socialize' }]
      });

      const socialInteraction = interactionFactory.createContent({
        id: 'social-chat',
        name: 'Social Chat',
        category: 'social',
        tags: ['social'],
        branches: [{ id: 'choice1', text: 'How are you?' }]
      });

      // Add interaction to the node in testWorldState, not testNode
      const worldNode = testWorldState.nodes.find(node => node.id === socialCharacter.currentNodeId);
      worldNode.addInteraction(socialInteraction);

      // Debug: Check what's in the node
      console.log('Node contentInteractions after adding:', worldNode.contentInteractions.length);
      worldNode.contentInteractions.forEach(interaction => {
        console.log(`- ${interaction.name} (${interaction.type})`);
      });

      const behaviorResult = generateBehavior(socialCharacter, testWorldState);

      expect(behaviorResult).toBeDefined();
      // Should prefer content interaction matching character's goal
      expect(behaviorResult.interaction).toBeDefined();
      expect(behaviorResult.interaction.type).toBe('content');
      expect(behaviorResult.interaction.category).toBe('social');
    });

    test('should handle character personality in interaction selection', () => {
      // Character with high curiosity
      const curiousCharacter = createTestCharacter({
        attributes: {
          strength: 12,
          dexterity: 12,
          constitution: 12,
          intelligence: 16, // High intelligence
          wisdom: 12,
          charisma: 12
        },
        goals: [{ id: 'learn' }]
      });

      const availableInteractions = interactionManager.getAvailableInteractions({
        character: curiousCharacter,
        world: testWorldState,
        currentNode: testNode
      });

      // Should have examine interaction available
      const foundExamine = availableInteractions.systemInteractions.find(
        interaction => interaction.constructor.name === 'ExamineInteraction'
      );
      expect(foundExamine).toBeDefined();
    });
  });

  describe('Performance Benchmarks', () => {
    test('should handle large-scale simulation with many interactions', () => {
      // Create large world with many nodes and characters
      const nodeCount = 50;
      const characterCount = 20;
      const interactionsPerNode = 10;

      const nodes = [];
      const characters = [];

      // Create nodes with interactions
      for (let i = 0; i < nodeCount; i++) {
        const node = createTestNode({
          id: `node-${i}`,
          name: `Node ${i}`
        });

        // Add multiple content interactions to each node
        for (let j = 0; j < interactionsPerNode; j++) {
          const interaction = interactionFactory.createContent({
            id: `interaction-${i}-${j}`,
            name: `Interaction ${i}-${j}`,
            category: 'dialogue',
            branches: [{ id: 'choice1', text: 'Test choice' }]
          });
          node.addInteraction(interaction);
        }

        nodes.push(node);
      }

      // Create characters
      for (let i = 0; i < characterCount; i++) {
        const character = createTestCharacter({
          id: `char-${i}`,
          name: `Character ${i}`,
          currentNodeId: `node-${i % nodeCount}`
        });
        characters.push(character);
      }

      const largeWorldState = {
        ...testWorldState,
        nodes,
        characters,
        getNodeById: jest.fn((id) => nodes.find(n => n.id === id)),
        getCharacterById: jest.fn((id) => characters.find(c => c.id === id))
      };

      // Benchmark interaction availability calculation
      const startTime = Date.now();

      characters.forEach(character => {
        const node = nodes.find(n => n.id === character.currentNodeId);
        if (node) {
          interactionManager.getAvailableInteractions({
            character,
            world: largeWorldState,
            currentNode: node
          });
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds max for large simulation
      console.log(`Large-scale benchmark completed in ${duration}ms`);
    });

    test('should efficiently handle behavior generation for multiple characters', () => {
      const characterCount = 100;
      const characters = [];

      // Create many characters
      for (let i = 0; i < characterCount; i++) {
        characters.push(createTestCharacter({
          id: `char-${i}`,
          name: `Character ${i}`
        }));
      }

      const worldState = {
        ...testWorldState,
        characters
      };

      // Benchmark behavior generation
      const startTime = Date.now();

      characters.forEach(character => {
        generateBehavior(character, worldState);
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const avgTimePerCharacter = duration / characterCount;

      // Should be efficient for real-time simulation
      expect(avgTimePerCharacter).toBeLessThan(50); // 50ms per character max
      console.log(`Behavior generation: ${duration}ms total, ${avgTimePerCharacter.toFixed(2)}ms per character`);
    });

    test('should handle concurrent interaction execution efficiently', async () => {
      const executionCount = 50;
      const executions = [];

      // Create multiple rest interactions
      for (let i = 0; i < executionCount; i++) {
        const character = createTestCharacter({
          id: `exec-char-${i}`,
          energy: 30 + (i % 40) // Vary energy levels
        });

        const restInteraction = interactionFactory.createRest({
          duration: 1
        });

        executions.push(
          interactionExecutor.execute(
            restInteraction,
            character,
            testWorldState
          )
        );
      }

      // Execute all concurrently
      const startTime = Date.now();
      const results = await Promise.all(executions);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All executions should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000); // 2 seconds max for concurrent executions
      console.log(`Concurrent execution benchmark: ${duration}ms for ${executionCount} interactions`);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid interaction execution gracefully', async () => {
      const invalidInteraction = {
        type: 'invalid',
        execute: jest.fn(() => { throw new Error('Invalid interaction'); })
      };

      const result = await interactionExecutor.execute(
        invalidInteraction,
        testCharacter,
        testWorldState
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle characters with no available interactions', () => {
      // Mock empty interaction manager
      interactionManager.getAvailableInteractions = jest.fn(() => ({
        systemInteractions: [],
        contentInteractions: [],
        allInteractions: []
      }));

      const behaviorResult = generateBehavior(testCharacter, testWorldState);

      // Should return null or handle gracefully
      expect(behaviorResult).toBeDefined();
    });

    test('should handle environmental extremes', () => {
      // Create extreme environment
      const extremeEnv = new Environment({
        terrain: 'volcano',
        climate: 'extreme_heat',
        lighting: 'firelight',
        hazards: ['lava', 'ash', 'toxic_gas']
      });

      testNode.environment = extremeEnv;
      testWorldState.getCurrentEnvironment = jest.fn(() => extremeEnv);

      const availableInteractions = interactionManager.getAvailableInteractions({
        character: testCharacter,
        world: testWorldState,
        currentNode: testNode
      });

      // Should still have some interactions available (like movement to escape)
      expect(availableInteractions.systemInteractions.length).toBeGreaterThan(0);
    });
  });
});
