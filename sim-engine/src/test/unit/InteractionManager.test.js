/**
 * Unit Tests for InteractionManager Service
 *
 * Tests the core functionality of the InteractionManager class,
 * including system interaction generation, content interaction coordination,
 * priority-based sorting, and filtering logic.
 */

import InteractionManager from '../../domain/services/InteractionManager.js';
import InteractionFactory from '../../domain/entities/interactions/InteractionFactory.js';

describe('InteractionManager', () => {
  let interactionManager;
  let mockCharacter;
  let mockWorld;
  let mockCurrentNode;

  beforeEach(() => {
    interactionManager = new InteractionManager();

    mockCharacter = {
      id: 'char-1',
      name: 'Test Character',
      currentNodeId: 'node-1',
      energy: 50,
      attributes: {
        intelligence: 12,
        wisdom: 10,
        perception: 8
      }
    };

    mockWorld = {
      nodes: [
        {
          id: 'node-1',
          name: 'Test Node',
          resources: [
            { id: 'resource-1', name: 'Test Resource' },
            { id: 'resource-2', name: 'Another Resource' }
          ],
          connections: [
            { targetNodeId: 'node-2' },
            { targetNodeId: 'node-3' }
          ]
        },
        {
          id: 'node-2',
          name: 'Connected Node'
        }
      ],
      characters: [
        mockCharacter,
        {
          id: 'char-2',
          name: 'Other Character',
          currentNodeId: 'node-1'
        }
      ]
    };

    mockCurrentNode = mockWorld.nodes[0];
    mockCurrentNode.getAvailableInteractions = jest.fn().mockReturnValue([
      {
        id: 'content-1',
        name: 'Content Interaction 1',
        priority: 'normal'
      }
    ]);
  });

  describe('Constructor', () => {
    test('should create instance with default settings', () => {
      const manager = new InteractionManager();
      expect(manager.enableSystemInteractions).toBe(true);
      expect(manager.enableContentInteractions).toBe(true);
    });

    test('should create instance with custom settings', () => {
      const manager = new InteractionManager({
        enableSystemInteractions: false,
        enableContentInteractions: false
      });
      expect(manager.enableSystemInteractions).toBe(false);
      expect(manager.enableContentInteractions).toBe(false);
    });
  });

  describe('getAvailableInteractions()', () => {
    test('should return system and content interactions', () => {
      const result = interactionManager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      expect(result).toHaveProperty('systemInteractions');
      expect(result).toHaveProperty('contentInteractions');
      expect(result).toHaveProperty('allInteractions');
      expect(Array.isArray(result.systemInteractions)).toBe(true);
      expect(Array.isArray(result.contentInteractions)).toBe(true);
      expect(Array.isArray(result.allInteractions)).toBe(true);
    });

    test('should generate system interactions when enabled', () => {
      const result = interactionManager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      expect(result.systemInteractions.length).toBeGreaterThan(0);
      // Should include rest, examine, movement, perception interactions
      const restInteractions = result.systemInteractions.filter(i => i.name.includes('Rest'));
      expect(restInteractions.length).toBeGreaterThan(0);
    });

    test('should not generate system interactions when disabled', () => {
      const manager = new InteractionManager({ enableSystemInteractions: false });
      const result = manager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      expect(result.systemInteractions.length).toBe(0);
    });

    test('should include content interactions when enabled', () => {
      const result = interactionManager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      expect(result.contentInteractions.length).toBeGreaterThan(0);
      expect(mockCurrentNode.getAvailableInteractions).toHaveBeenCalledWith(mockCharacter);
    });

    test('should not include content interactions when disabled', () => {
      const manager = new InteractionManager({ enableContentInteractions: false });
      const result = manager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      expect(result.contentInteractions.length).toBe(0);
      expect(mockCurrentNode.getAvailableInteractions).not.toHaveBeenCalled();
    });

    test('should combine all interactions', () => {
      const result = interactionManager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      const totalInteractions = result.systemInteractions.length + result.contentInteractions.length;
      expect(result.allInteractions.length).toBe(totalInteractions);
    });
  });

  describe('System Interaction Generation', () => {
    test('should generate rest interactions based on energy level', () => {
      // Test normal energy
      const result = interactionManager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      const restInteractions = result.systemInteractions.filter(i => i.name.includes('Rest'));
      expect(restInteractions.length).toBeGreaterThan(0);
      expect(restInteractions[0].priority).toBe('normal'); // Energy 50 = normal priority
    });

    test('should generate critical rest for low energy', () => {
      const lowEnergyCharacter = { ...mockCharacter, energy: 15 };
      const result = interactionManager.getAvailableInteractions({
        character: lowEnergyCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      const restInteractions = result.systemInteractions.filter(i => i.name.includes('Rest'));
      const emergencyRest = restInteractions.find(i => i.name.includes('Emergency'));
      expect(emergencyRest).toBeDefined();
      expect(emergencyRest.priority).toBe('critical');
    });

    test('should generate examine interactions for available targets', () => {
      const result = interactionManager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      const examineInteractions = result.systemInteractions.filter(i => i.name.includes('Examine'));
      expect(examineInteractions.length).toBeGreaterThan(0);
      // Should examine resources and other characters
    });

    test('should generate movement interactions to connected nodes', () => {
      const result = interactionManager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      const movementInteractions = result.systemInteractions.filter(i => i.name.includes('Move to'));
      expect(movementInteractions.length).toBeGreaterThan(0);
    });

    test('should generate perception interactions', () => {
      const result = interactionManager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      const perceptionInteractions = result.systemInteractions.filter(i =>
        i.name.includes('Look') || i.name.includes('Listen')
      );
      expect(perceptionInteractions.length).toBeGreaterThan(0);
    });
  });

  describe('Priority-based Sorting', () => {
    test('should sort interactions by priority', () => {
      const result = interactionManager.getAvailableInteractions({
        character: { ...mockCharacter, energy: 10 }, // Low energy = critical priority
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      // First interaction should be critical (emergency rest)
      expect(result.allInteractions[0].priority).toBe('critical');
    });

    test('should maintain priority order within categories', () => {
      const result = interactionManager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      // Check that system interactions are sorted by priority
      const systemPriorities = result.systemInteractions.map(i => i.priority);
      const isSorted = systemPriorities.every((priority, index) => {
        if (index === 0) return true;
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[priority] >= priorityOrder[systemPriorities[index - 1]];
      });
      expect(isSorted).toBe(true);
    });
  });

  describe('filterInteractions()', () => {
    let testInteractions;

    beforeEach(() => {
      testInteractions = [
        InteractionFactory.createRest({ name: 'Rest 1', priority: 'normal', baseEnergyCost: 5 }),
        InteractionFactory.createWait({ name: 'Wait 1', priority: 'low', baseEnergyCost: 2 }),
        InteractionFactory.createExamine('item', 'test-item', { name: 'Examine Item', priority: 'high', baseEnergyCost: 8 })
      ];
    });

    test('should filter by type', () => {
      const filtered = interactionManager.filterInteractions(testInteractions, { type: 'RestInteraction' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Rest 1');
    });

    test('should filter by priority', () => {
      const filtered = interactionManager.filterInteractions(testInteractions, { priority: 'high' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].priority).toBe('high');
    });

    test('should filter by maximum energy cost', () => {
      const filtered = interactionManager.filterInteractions(testInteractions, { maxEnergyCost: 5 });
      expect(filtered.length).toBe(2); // Rest (5) and Wait (2)
      expect(filtered.every(i => i.baseEnergyCost <= 5)).toBe(true);
    });

    test('should filter by name pattern', () => {
      const filtered = interactionManager.filterInteractions(testInteractions, { namePattern: 'Rest' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Rest 1');
    });

    test('should combine multiple filters', () => {
      const filtered = interactionManager.filterInteractions(testInteractions, {
        priority: 'normal',
        maxEnergyCost: 10
      });
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Rest 1');
    });
  });

  describe('getInteractionsByCategory()', () => {
    test('should categorize interactions correctly', () => {
      const result = interactionManager.getInteractionsByCategory({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('content');
      expect(result.system).toHaveProperty('rest');
      expect(result.system).toHaveProperty('movement');
      expect(result.system).toHaveProperty('perception');
      expect(result.system).toHaveProperty('examination');
      expect(result.system).toHaveProperty('other');
    });

    test('should include rest interactions in rest category', () => {
      const result = interactionManager.getInteractionsByCategory({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      expect(result.system.rest.length).toBeGreaterThan(0);
      expect(result.system.rest[0].name).toMatch(/rest/i);
    });
  });

  describe('canExecuteInteraction()', () => {
    test('should validate interaction execution', () => {
      const restInteraction = InteractionFactory.createRest();
      const canExecute = interactionManager.canExecuteInteraction(restInteraction, {
        character: mockCharacter,
        world: mockWorld
      });

      expect(typeof canExecute).toBe('boolean');
    });

    test('should handle invalid interactions gracefully', () => {
      const invalidInteraction = { name: 'Invalid' };
      const canExecute = interactionManager.canExecuteInteraction(invalidInteraction, {
        character: mockCharacter,
        world: mockWorld
      });

      expect(canExecute).toBe(false);
    });
  });

  describe('getRecommendedInteraction()', () => {
    test('should return critical priority interaction when available', () => {
      const lowEnergyCharacter = { ...mockCharacter, energy: 10 };
      const recommended = interactionManager.getRecommendedInteraction({
        character: lowEnergyCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      expect(recommended.priority).toBe('critical');
    });

    test('should return first available interaction when no critical', () => {
      const recommended = interactionManager.getRecommendedInteraction({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      expect(recommended).toBeDefined();
      expect(typeof recommended.name).toBe('string');
    });

    test('should return null when no interactions available', () => {
      const manager = new InteractionManager({
        enableSystemInteractions: false,
        enableContentInteractions: false
      });

      const recommended = manager.getRecommendedInteraction({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      expect(recommended).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing current node gracefully', () => {
      const result = interactionManager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: null
      });

      expect(result.systemInteractions.length).toBeGreaterThan(0); // System interactions still work
      expect(result.contentInteractions.length).toBe(0); // No content interactions
    });

    test('should handle missing world gracefully', () => {
      const result = interactionManager.getAvailableInteractions({
        character: mockCharacter,
        world: null,
        currentNode: mockCurrentNode
      });

      expect(result.systemInteractions.length).toBeGreaterThan(0);
      // Some system interactions may fail but others should work
    });

    test('should handle system interaction generation errors', () => {
      // Mock a generator to throw an error
      const originalGenerator = interactionManager.systemInteractionGenerators.get('rest');
      interactionManager.systemInteractionGenerators.set('rest', () => {
        throw new Error('Test error');
      });

      const result = interactionManager.getAvailableInteractions({
        character: mockCharacter,
        world: mockWorld,
        currentNode: mockCurrentNode
      });

      // Should continue with other generators despite the error
      expect(result.systemInteractions.length).toBeGreaterThan(0);

      // Restore original generator
      interactionManager.systemInteractionGenerators.set('rest', originalGenerator);
    });
  });
});
