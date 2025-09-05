/**
 * Unit Tests for SystemInteraction Class
 *
 * Tests the core functionality of the SystemInteraction class,
 * including immutability, environmental integration, energy costs, and execution.
 */

import SystemInteraction from '../../domain/entities/interactions/SystemInteraction.js';

describe('SystemInteraction', () => {
  // Mock concrete implementation for testing
  class MockSystemInteraction extends SystemInteraction {
    constructor(config = {}) {
      super(config);
    }

    _initializeSubclassProperties(config) {
      // Handle null or undefined config
      config = config || {};
      this.mockProperty = config.mockProperty || 'test';
    }

    getEnvironmentalModifier(environment) {
      // Mock implementation that returns different values based on environment
      if (environment.temperature > 25) {
        return 1.5; // Hot environment increases cost
      } else if (environment.temperature < 10) {
        return 0.8; // Cold environment decreases cost
      }
      return 1.0; // Normal environment
    }
  }

  describe('Constructor', () => {
    test('should create instance with default values', () => {
      const interaction = new MockSystemInteraction();

      expect(interaction.isSystemInteraction).toBe(true);
      expect(interaction.priority).toBe('normal');
      expect(interaction.baseEnergyCost).toBe(0);
      expect(interaction.mockProperty).toBe('test');
    });

    test('should create instance with provided config', () => {
      const config = {
        name: 'Test System Interaction',
        type: 'test',
        priority: 'high',
        baseEnergyCost: 15,
        mockProperty: 'custom'
      };

      const interaction = new MockSystemInteraction(config);

      expect(interaction.name).toBe('Test System Interaction');
      expect(interaction.type).toBe('test');
      expect(interaction.priority).toBe('high');
      expect(interaction.baseEnergyCost).toBe(15);
      expect(interaction.mockProperty).toBe('custom');
    });

    test('should be immutable after creation', () => {
      const interaction = new MockSystemInteraction({
        name: 'Test Interaction'
      });

      expect(() => {
        interaction.name = 'Modified Name';
      }).toThrow();

      expect(() => {
        interaction.priority = 'low';
      }).toThrow();

      expect(() => {
        interaction.baseEnergyCost = 20;
      }).toThrow();
    });
  });

  describe('Environmental Integration', () => {
    let interaction;
    let mockEnvironment;

    beforeEach(() => {
      interaction = new MockSystemInteraction({
        baseEnergyCost: 10
      });

      mockEnvironment = {
        temperature: 20,
        visibility: 1.0,
        terrain: 'normal'
      };
    });

    test('should return base modifier for normal environment', () => {
      const modifier = interaction.getEnvironmentalModifier(mockEnvironment);
      expect(modifier).toBe(1.0);
    });

    test('should return increased modifier for hot environment', () => {
      mockEnvironment.temperature = 30;
      const modifier = interaction.getEnvironmentalModifier(mockEnvironment);
      expect(modifier).toBe(1.5);
    });

    test('should return decreased modifier for cold environment', () => {
      mockEnvironment.temperature = 5;
      const modifier = interaction.getEnvironmentalModifier(mockEnvironment);
      expect(modifier).toBe(0.8);
    });
  });

  describe('Energy Cost Calculation', () => {
    let interaction;
    let mockCharacter;
    let mockEnvironment;

    beforeEach(() => {
      interaction = new MockSystemInteraction({
        baseEnergyCost: 10
      });

      mockCharacter = {
        energy: 100
      };

      mockEnvironment = {
        temperature: 20
      };
    });

    test('should calculate correct energy cost for normal environment', () => {
      const cost = interaction.getEnergyCost(mockCharacter, mockEnvironment);
      expect(cost).toBe(10);
    });

    test('should calculate increased energy cost for hot environment', () => {
      mockEnvironment.temperature = 30;
      const cost = interaction.getEnergyCost(mockCharacter, mockEnvironment);
      expect(cost).toBe(15); // 10 * 1.5
    });

    test('should calculate decreased energy cost for cold environment', () => {
      mockEnvironment.temperature = 5;
      const cost = interaction.getEnergyCost(mockCharacter, mockEnvironment);
      expect(cost).toBe(8); // Math.round(10 * 0.8)
    });

    test('should not return negative energy cost', () => {
      interaction = new MockSystemInteraction({
        baseEnergyCost: 5
      });
      mockEnvironment.temperature = 5; // 0.8 modifier
      const cost = interaction.getEnergyCost(mockCharacter, mockEnvironment);
      expect(cost).toBe(4); // Math.round(5 * 0.8) = 4, not negative
    });

    test('should handle zero base energy cost', () => {
      interaction = new MockSystemInteraction({
        baseEnergyCost: 0
      });
      const cost = interaction.getEnergyCost(mockCharacter, mockEnvironment);
      expect(cost).toBe(0);
    });
  });

  describe('Execution Logic', () => {
    let interaction;
    let mockCharacter;
    let mockWorldState;
    let mockEnvironment;

    beforeEach(() => {
      interaction = new MockSystemInteraction({
        name: 'Test System Interaction',
        baseEnergyCost: 10
      });

      mockCharacter = {
        energy: 50
      };

      mockEnvironment = {
        temperature: 20
      };

      mockWorldState = {
        getCurrentEnvironment: jest.fn(() => mockEnvironment)
      };
    });

    test('should execute successfully with sufficient energy', () => {
      const result = interaction.execute(mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.interaction).toBe(interaction);
      expect(result.energyConsumed).toBe(10);
      expect(result.environmentalFactors.modifier).toBe(1.0);
      expect(result.logs).toContain('Test System Interaction executed successfully, consumed 10 energy');
      expect(mockCharacter.energy).toBe(40); // 50 - 10
    });

    test('should execute with environmental modifier', () => {
      mockEnvironment.temperature = 30; // 1.5 modifier
      const result = interaction.execute(mockCharacter, mockWorldState);

      expect(result.energyConsumed).toBe(15);
      expect(result.environmentalFactors.modifier).toBe(1.5);
      expect(mockCharacter.energy).toBe(35); // 50 - 15
    });

    test('should handle missing environment gracefully', () => {
      mockWorldState.getCurrentEnvironment = jest.fn(() => null);
      const result = interaction.execute(mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.energyConsumed).toBe(10);
      expect(result.environmentalFactors.modifier).toBe(1.0);
      expect(mockCharacter.energy).toBe(40);
    });

    test('should handle missing getCurrentEnvironment method', () => {
      delete mockWorldState.getCurrentEnvironment;
      const result = interaction.execute(mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.energyConsumed).toBe(10);
      expect(result.environmentalFactors.modifier).toBe(1.0);
      expect(mockCharacter.energy).toBe(40);
    });
  });

  describe('Availability Checks', () => {
    let interaction;
    let mockCharacter;
    let mockWorldState;
    let mockEnvironment;

    beforeEach(() => {
      interaction = new MockSystemInteraction({
        baseEnergyCost: 10
      });

      mockCharacter = {
        energy: 50
      };

      mockEnvironment = {
        temperature: 20
      };

      mockWorldState = {
        getCurrentEnvironment: jest.fn(() => mockEnvironment)
      };
    });

    test('should be available with sufficient energy', () => {
      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(true);
    });

    test('should not be available with insufficient energy', () => {
      mockCharacter.energy = 5; // Less than required 10
      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(false);
    });

    test('should be available with exact energy match', () => {
      mockCharacter.energy = 10;
      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(true);
    });

    test('should handle environmental modifiers in availability check', () => {
      mockEnvironment.temperature = 30; // 1.5 modifier, cost becomes 15
      mockCharacter.energy = 12; // Less than 15 but more than 10
      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(false);
    });

    test('should handle zero energy cost', () => {
      interaction = new MockSystemInteraction({
        baseEnergyCost: 0
      });
      mockCharacter.energy = 0;
      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(true);
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON correctly', () => {
      const interaction = new MockSystemInteraction({
        id: 'test-id',
        name: 'Test System Interaction',
        description: 'Test description',
        type: 'test',
        priority: 'high',
        baseEnergyCost: 15,
        mockProperty: 'custom'
      });

      const json = interaction.toJSON();

      expect(json).toEqual({
        id: 'test-id',
        name: 'Test System Interaction',
        description: 'Test description',
        type: 'test',
        isSystemInteraction: true,
        priority: 'high',
        baseEnergyCost: 15
      });
    });

    test('should deserialize from JSON correctly', () => {
      const data = {
        id: 'test-id',
        name: 'Test System Interaction',
        type: 'test',
        priority: 'high',
        baseEnergyCost: 15,
        mockProperty: 'custom'
      };

      const interaction = MockSystemInteraction.fromJSON(data);

      expect(interaction.id).toBe('test-id');
      expect(interaction.name).toBe('Test System Interaction');
      expect(interaction.type).toBe('test');
      expect(interaction.priority).toBe('high');
      expect(interaction.baseEnergyCost).toBe(15);
      expect(interaction.mockProperty).toBe('custom');
    });
  });

  describe('Priority Levels', () => {
    test('should support all priority levels', () => {
      const priorities = ['critical', 'high', 'normal', 'low'];

      priorities.forEach(priority => {
        const interaction = new MockSystemInteraction({
          priority
        });
        expect(interaction.priority).toBe(priority);
      });
    });

    test('should default to normal priority', () => {
      const interaction = new MockSystemInteraction();
      expect(interaction.priority).toBe('normal');
    });
  });

  describe('Inheritance', () => {
    test('should inherit from InteractionBase', () => {
      const interaction = new MockSystemInteraction();
      expect(interaction).toBeInstanceOf(SystemInteraction);
      expect(interaction).toBeInstanceOf(Object); // Should inherit from base class
    });

    test('should allow further subclassing', () => {
      class SpecializedSystemInteraction extends MockSystemInteraction {
        getEnvironmentalModifier(environment) {
          return 2.0; // Always double cost
        }
      }

      const interaction = new SpecializedSystemInteraction({
        baseEnergyCost: 10
      });

      const cost = interaction.getEnergyCost({}, { temperature: 20 });
      expect(cost).toBe(20); // 10 * 2.0
    });
  });
});
