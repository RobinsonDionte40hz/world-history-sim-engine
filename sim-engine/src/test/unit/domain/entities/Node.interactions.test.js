// src/test/unit/domain/entities/Node.interactions.test.js

import Node from '../../../../domain/entities/Node.js';
import Interaction from '../../../../domain/entities/Interaction.js';

describe('Node Interaction Management', () => {
  let mockNode;
  let mockInteraction1;
  let mockInteraction2;
  let mockCharacter;

  beforeEach(() => {
    mockInteraction1 = new Interaction({
      id: 'test-interaction-1',
      name: 'Test Interaction 1',
      description: 'A test interaction',
      isAvailable: jest.fn(() => true),
      meetsRequirements: jest.fn(() => true)
    });

    mockInteraction2 = new Interaction({
      id: 'test-interaction-2',
      name: 'Test Interaction 2',
      description: 'Another test interaction',
      repeatable: false, // Not repeatable
      cooldown: 1000,    // Long cooldown
      lastUsed: Date.now() // Used recently, so not available
    });

    mockCharacter = {
      id: 'test-char',
      attributes: { getEnergyProxy: () => 50 }
    };

    mockNode = new Node({
      id: 'test-node',
      name: 'Test Node',
      contentInteractions: [mockInteraction1, mockInteraction2]
    });
  });

  describe('Content Interaction Storage', () => {
    test('should store content interactions separately from system interactions', () => {
      expect(mockNode.contentInteractions).toHaveLength(2);
      expect(mockNode.contentInteractions[0]).toBe(mockInteraction1);
      expect(mockNode.contentInteractions[1]).toBe(mockInteraction2);
    });

    test('should maintain backward compatibility with interactions property', () => {
      expect(mockNode.interactions).toBe(mockNode.contentInteractions);
      expect(mockNode.interactions).toHaveLength(2);
    });
  });

  describe('Interaction Queries', () => {
    test('should check if node has specific interaction', () => {
      expect(mockNode.hasInteraction('test-interaction-1')).toBe(true);
      expect(mockNode.hasInteraction('nonexistent')).toBe(false);
    });

    test('should return available content interactions for character', () => {
      const available = mockNode.getAvailableInteractions(mockCharacter);
      
      expect(available).toHaveLength(1);
      expect(available[0]).toBe(mockInteraction1);
    });

    test('should return all content interactions', () => {
      const contentInteractions = mockNode.getContentInteractions();
      
      expect(contentInteractions).toHaveLength(2);
      expect(contentInteractions).toEqual(mockNode.contentInteractions);
      expect(contentInteractions).not.toBe(mockNode.contentInteractions); // Should be a copy
    });
  });

  describe('Content Interaction Management', () => {
    test('should add new content interaction', () => {
      const newInteraction = new Interaction({
        id: 'new-interaction',
        name: 'New Interaction',
        isAvailable: jest.fn(() => true),
        meetsRequirements: jest.fn(() => true)
      });

      mockNode.addContentInteraction(newInteraction);

      expect(mockNode.contentInteractions).toHaveLength(3);
      expect(mockNode.hasInteraction('new-interaction')).toBe(true);
      expect(mockNode.interactions).toHaveLength(3); // Backward compatibility
    });

    test('should not add duplicate content interaction', () => {
      const duplicateInteraction = new Interaction({
        id: 'test-interaction-1', // Same ID as existing
        name: 'Duplicate Interaction'
      });

      mockNode.addContentInteraction(duplicateInteraction);

      expect(mockNode.contentInteractions).toHaveLength(2); // Should not increase
    });

    test('should remove content interaction', () => {
      const removed = mockNode.removeContentInteraction('test-interaction-1');

      expect(removed).toBe(true);
      expect(mockNode.contentInteractions).toHaveLength(1);
      expect(mockNode.hasInteraction('test-interaction-1')).toBe(false);
      expect(mockNode.interactions).toHaveLength(1); // Backward compatibility
    });

    test('should return false when removing non-existent interaction', () => {
      const removed = mockNode.removeContentInteraction('nonexistent');

      expect(removed).toBe(false);
      expect(mockNode.contentInteractions).toHaveLength(2);
    });
  });

  describe('Migration Support', () => {
    test('should migrate legacy interactions to contentInteractions', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const legacyNode = new Node({
        id: 'legacy-node',
        interactions: [mockInteraction1] // Old format
      });

      expect(legacyNode.contentInteractions).toHaveLength(1);
      expect(legacyNode.contentInteractions[0]).toBe(mockInteraction1);
      expect(legacyNode.interactions).toBe(legacyNode.contentInteractions);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Node legacy-node: Migrated legacy \'interactions\' to \'contentInteractions\'. Consider updating save files.'
      );
      
      consoleWarnSpy.mockRestore();
    });

    test('should not migrate if contentInteractions already provided', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const mixedNode = new Node({
        id: 'mixed-node',
        interactions: [mockInteraction1], // Old format
        contentInteractions: [mockInteraction2] // New format takes precedence
      });

      expect(mixedNode.contentInteractions).toHaveLength(1);
      expect(mixedNode.contentInteractions[0]).toBe(mockInteraction2);
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Serialization', () => {
    test('should serialize with both contentInteractions and interactions for backward compatibility', () => {
      const json = mockNode.toJSON();

      expect(json.contentInteractions).toHaveLength(2);
      expect(json.interactions).toHaveLength(2);
      expect(json.interactions).toEqual(json.contentInteractions);
    });

    test('should deserialize from new format', () => {
      const json = mockNode.toJSON();
      const deserializedNode = Node.fromJSON(json);

      expect(deserializedNode.contentInteractions).toHaveLength(2);
      expect(deserializedNode.hasInteraction('test-interaction-1')).toBe(true);
    });

    test('should deserialize and migrate from legacy format', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const legacyJson = {
        id: 'legacy-node',
        name: 'Legacy Node',
        interactions: [mockInteraction1.toJSON ? mockInteraction1.toJSON() : mockInteraction1]
      };
      
      const deserializedNode = Node.fromJSON(legacyJson);

      expect(deserializedNode.contentInteractions).toHaveLength(1);
      expect(deserializedNode.hasInteraction('test-interaction-1')).toBe(true);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Node legacy-node: Migrating legacy \'interactions\' to \'contentInteractions\' during deserialization.'
      );
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    test('should throw error when adding non-Interaction object', () => {
      expect(() => {
        mockNode.addContentInteraction({ id: 'invalid' });
      }).toThrow('Interaction must be an Interaction instance');
    });
  });
});
