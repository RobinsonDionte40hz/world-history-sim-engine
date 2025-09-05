/**
 * Unit Tests for InteractionBase Abstract Class
 *
 * Tests the core functionality of the InteractionBase abstract class,
 * including constructor, abstract methods, serialization, and error handling.
 */

import InteractionBase from '../../domain/entities/interactions/InteractionBase.js';

describe('InteractionBase', () => {
  // Mock concrete implementation for testing
  class MockInteraction extends InteractionBase {
    constructor(config = {}) {
      super(config);
      // Handle null or undefined config
      config = config || {};
      this.mockProperty = config.mockProperty || 'test';
    }

    canExecute(character, worldState) {
      return true;
    }

    execute(character, worldState) {
      return { success: true, energyConsumed: 10 };
    }

    getEnergyCost(character, environment) {
      return 10;
    }
  }

  describe('Constructor', () => {
    test('should create instance with default values', () => {
      const interaction = new MockInteraction();

      expect(interaction.id).toBeDefined();
      expect(interaction.name).toBe('Unnamed Interaction');
      expect(interaction.description).toBe('');
      expect(interaction.type).toBe('unknown');
    });

    test('should create instance with provided config', () => {
      const config = {
        id: 'test-id',
        name: 'Test Interaction',
        description: 'A test interaction',
        type: 'test'
      };

      const interaction = new MockInteraction(config);

      expect(interaction.id).toBe('test-id');
      expect(interaction.name).toBe('Test Interaction');
      expect(interaction.description).toBe('A test interaction');
      expect(interaction.type).toBe('test');
    });

    test('should generate unique IDs', () => {
      const interaction1 = new MockInteraction();
      const interaction2 = new MockInteraction();

      expect(interaction1.id).not.toBe(interaction2.id);
      expect(typeof interaction1.id).toBe('string');
      expect(interaction1.id.length).toBeGreaterThan(0);
    });

    test('should throw error when instantiated directly', () => {
      expect(() => {
        new InteractionBase();
      }).toThrow('InteractionBase is an abstract class and cannot be instantiated directly');
    });
  });

  describe('Abstract Methods', () => {
    test('should throw error for unimplemented canExecute', () => {
      class IncompleteInteraction extends InteractionBase {
        execute() {}
        getEnergyCost() {}
      }

      const interaction = new IncompleteInteraction();

      expect(() => {
        interaction.canExecute({}, {});
      }).toThrow('canExecute method must be implemented by subclass');
    });

    test('should throw error for unimplemented execute', () => {
      class IncompleteInteraction extends InteractionBase {
        canExecute() {}
        getEnergyCost() {}
      }

      const interaction = new IncompleteInteraction();

      expect(() => {
        interaction.execute({}, {});
      }).toThrow('execute method must be implemented by subclass');
    });

    test('should throw error for unimplemented getEnergyCost', () => {
      class IncompleteInteraction extends InteractionBase {
        canExecute() {}
        execute() {}
      }

      const interaction = new IncompleteInteraction();

      expect(() => {
        interaction.getEnergyCost({}, {});
      }).toThrow('getEnergyCost method must be implemented by subclass');
    });
  });

  describe('Mock Implementation', () => {
    let interaction;
    let mockCharacter;
    let mockWorldState;
    let mockEnvironment;

    beforeEach(() => {
      interaction = new MockInteraction({
        name: 'Mock Interaction',
        type: 'mock'
      });

      mockCharacter = {
        id: 'char1',
        name: 'Test Character',
        energy: 100
      };

      mockWorldState = {
        getCurrentNode: jest.fn(),
        getCurrentEnvironment: jest.fn()
      };

      mockEnvironment = {
        temperature: 20,
        visibility: 1.0
      };
    });

    test('should implement canExecute correctly', () => {
      const result = interaction.canExecute(mockCharacter, mockWorldState);
      expect(result).toBe(true);
    });

    test('should implement execute correctly', () => {
      const result = interaction.execute(mockCharacter, mockWorldState);
      expect(result).toEqual({
        success: true,
        energyConsumed: 10
      });
    });

    test('should implement getEnergyCost correctly', () => {
      const result = interaction.getEnergyCost(mockCharacter, mockEnvironment);
      expect(result).toBe(10);
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON correctly', () => {
      const interaction = new MockInteraction({
        id: 'test-id',
        name: 'Test Interaction',
        description: 'Test description',
        type: 'test'
      });

      const json = interaction.toJSON();

      expect(json).toEqual({
        id: 'test-id',
        name: 'Test Interaction',
        description: 'Test description',
        type: 'test'
      });
    });

    test('should deserialize from JSON correctly', () => {
      const data = {
        id: 'test-id',
        name: 'Test Interaction',
        description: 'Test description',
        type: 'test'
      };

      const interaction = MockInteraction.fromJSON(data);

      expect(interaction.id).toBe('test-id');
      expect(interaction.name).toBe('Test Interaction');
      expect(interaction.description).toBe('Test description');
      expect(interaction.type).toBe('test');
    });

    test('should preserve additional properties during deserialization', () => {
      const data = {
        id: 'test-id',
        name: 'Test Interaction',
        mockProperty: 'custom-value'
      };

      const interaction = MockInteraction.fromJSON(data);

      expect(interaction.mockProperty).toBe('custom-value');
    });
  });

  describe('ID Generation', () => {
    test('should generate valid UUID format', () => {
      const interaction = new MockInteraction();

      // Basic UUID v4 format check
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(interaction.id)).toBe(true);
    });

    test('should use crypto.randomUUID when available', () => {
      const originalCrypto = global.crypto;
      const mockRandomUUID = jest.fn(() => 'mocked-uuid');

      global.crypto = { randomUUID: mockRandomUUID };

      const interaction = new MockInteraction();

      expect(mockRandomUUID).toHaveBeenCalled();
      expect(interaction.id).toBe('mocked-uuid');

      global.crypto = originalCrypto;
    });

    test('should fallback to manual UUID generation', () => {
      const originalCrypto = global.crypto;

      delete global.crypto;

      const interaction = new MockInteraction();

      expect(typeof interaction.id).toBe('string');
      expect(interaction.id.length).toBe(36); // UUID length

      global.crypto = originalCrypto;
    });
  });

  describe('Error Handling', () => {
    test('should handle missing config gracefully', () => {
      const interaction = new MockInteraction(null);

      expect(interaction.name).toBe('Unnamed Interaction');
      expect(interaction.description).toBe('');
      expect(interaction.type).toBe('unknown');
    });

    test('should handle undefined config properties', () => {
      const config = {
        name: undefined,
        description: undefined,
        type: undefined
      };

      const interaction = new MockInteraction(config);

      expect(interaction.name).toBe('Unnamed Interaction');
      expect(interaction.description).toBe('');
      expect(interaction.type).toBe('unknown');
    });
  });

  describe('Inheritance', () => {
    test('should allow subclassing and method overriding', () => {
      class CustomInteraction extends InteractionBase {
        canExecute(character, worldState) {
          return character.energy > 50;
        }

        execute(character, worldState) {
          return { success: true, customResult: 'executed' };
        }

        getEnergyCost(character, environment) {
          return environment.temperature > 25 ? 15 : 10;
        }
      }

      const interaction = new CustomInteraction({
        name: 'Custom Interaction'
      });

      const character = { energy: 60 };
      const worldState = {};
      const environment = { temperature: 30 };

      expect(interaction.canExecute(character, worldState)).toBe(true);
      expect(interaction.execute(character, worldState)).toEqual({
        success: true,
        customResult: 'executed'
      });
      expect(interaction.getEnergyCost(character, environment)).toBe(15);
    });
  });
});
