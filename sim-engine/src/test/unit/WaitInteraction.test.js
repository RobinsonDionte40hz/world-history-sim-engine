/**
 * Unit Tests for WaitInteraction Class
 *
 * Tests the core functionality of the WaitInteraction class,
 * including duration configuration, energy recovery, environmental effects,
 * and execution with various scenarios.
 */

import WaitInteraction from '../../domain/entities/interactions/WaitInteraction.js';
import SystemInteraction from '../../domain/entities/interactions/SystemInteraction.js';

describe('WaitInteraction', () => {
  describe('Constructor', () => {
    test('should create instance with default values', () => {
      const interaction = new WaitInteraction();

      expect(interaction.isSystemInteraction).toBe(true);
      expect(interaction.priority).toBe('normal');
      expect(interaction.baseEnergyCost).toBe(0);
      expect(interaction.duration).toBe(1);
      expect(interaction.energyRecoveryRate).toBe(0.5);
    });

    test('should create instance with provided config', () => {
      const config = {
        name: 'Test Wait',
        type: 'wait',
        priority: 'low',
        baseEnergyCost: 2,
        duration: 3,
        energyRecoveryRate: 1.0
      };

      const interaction = new WaitInteraction(config);

      expect(interaction.name).toBe('Test Wait');
      expect(interaction.type).toBe('wait');
      expect(interaction.priority).toBe('low');
      expect(interaction.baseEnergyCost).toBe(2);
      expect(interaction.duration).toBe(3);
      expect(interaction.energyRecoveryRate).toBe(1.0);
    });

    test('should be immutable after creation', () => {
      const interaction = new WaitInteraction({
        name: 'Test Wait'
      });

      expect(() => {
        interaction.name = 'Modified Name';
      }).toThrow();

      expect(() => {
        interaction.duration = 5;
      }).toThrow();

      expect(() => {
        interaction.energyRecoveryRate = 2.0;
      }).toThrow();
    });
  });

  describe('Environmental Integration', () => {
    let interaction;
    let mockEnvironment;

    beforeEach(() => {
      interaction = new WaitInteraction({
        baseEnergyCost: 2
      });

      mockEnvironment = {
        getComfortLevel: jest.fn(() => 1.0)
      };
    });

    test('should return base modifier for normal comfort', () => {
      mockEnvironment.getComfortLevel.mockReturnValue(1.0);
      const modifier = interaction.getEnvironmentalModifier(mockEnvironment);
      expect(modifier).toBe(1.0);
    });

    test('should return reduced modifier for very comfortable environment', () => {
      mockEnvironment.getComfortLevel.mockReturnValue(1.3);
      const modifier = interaction.getEnvironmentalModifier(mockEnvironment);
      expect(modifier).toBe(0.9);
    });

    test('should return increased modifier for uncomfortable environment', () => {
      mockEnvironment.getComfortLevel.mockReturnValue(0.7);
      const modifier = interaction.getEnvironmentalModifier(mockEnvironment);
      expect(modifier).toBe(1.1);
    });

    test('should handle missing environment', () => {
      const modifier = interaction.getEnvironmentalModifier(null);
      expect(modifier).toBe(1.0);
    });

    test('should handle environment without getComfortLevel method', () => {
      const plainEnvironment = { temperature: 20 };
      const modifier = interaction.getEnvironmentalModifier(plainEnvironment);
      expect(modifier).toBe(1.0);
    });
  });

  describe('Energy Cost Calculation', () => {
    let interaction;
    let mockCharacter;
    let mockEnvironment;

    beforeEach(() => {
      interaction = new WaitInteraction({
        baseEnergyCost: 2
      });

      mockCharacter = {
        energy: 100
      };

      mockEnvironment = {
        getComfortLevel: jest.fn(() => 1.0)
      };
    });

    test('should calculate correct energy cost for normal environment', () => {
      const cost = interaction.getEnergyCost(mockCharacter, mockEnvironment);
      expect(cost).toBe(2);
    });

    test('should calculate reduced energy cost for comfortable environment', () => {
      mockEnvironment.getComfortLevel.mockReturnValue(1.3);
      const cost = interaction.getEnergyCost(mockCharacter, mockEnvironment);
      expect(cost).toBe(2); // 2 * 0.9 = 1.8, rounded to 2
    });

    test('should calculate increased energy cost for uncomfortable environment', () => {
      mockEnvironment.getComfortLevel.mockReturnValue(0.7);
      const cost = interaction.getEnergyCost(mockCharacter, mockEnvironment);
      expect(cost).toBe(2); // 2 * 1.1 = 2.2, rounded to 2
    });
  });

  describe('Availability Checks', () => {
    let interaction;
    let mockCharacter;
    let mockWorldState;

    beforeEach(() => {
      interaction = new WaitInteraction({
        baseEnergyCost: 2
      });

      mockCharacter = {
        energy: 50
      };

      mockWorldState = {};
    });

    test('should be available with sufficient energy', () => {
      mockCharacter.energy = 5;
      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(true);
    });

    test('should not be available with insufficient energy', () => {
      mockCharacter.energy = 0;
      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(false);
    });

    test('should be available with exact minimum energy', () => {
      mockCharacter.energy = 1;
      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(true);
    });
  });

  describe('Execution Logic', () => {
    let interaction;
    let mockCharacter;
    let mockWorldState;
    let mockEnvironment;

    beforeEach(() => {
      interaction = new WaitInteraction({
        name: 'Test Wait',
        baseEnergyCost: 2,
        duration: 2,
        energyRecoveryRate: 1.0
      });

      mockCharacter = {
        energy: 50,
        maxEnergy: 100
      };

      mockEnvironment = {
        getComfortLevel: jest.fn(() => 1.0)
      };

      mockWorldState = {
        getCurrentEnvironment: jest.fn(() => mockEnvironment),
        advanceTime: jest.fn()
      };
    });

    test('should execute successfully with energy consumption and recovery', () => {
      const result = interaction.execute(mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.interaction).toBe(interaction);
      expect(result.energyConsumed).toBe(2);
      expect(result.energyRecovered).toBe(2); // 1.0 * 2
      expect(result.timeAdvanced).toBe(2);
      expect(result.environmentalFactors.modifier).toBe(1.0);
      expect(result.environmentalFactors.comfortLevel).toBe(1.0);
      expect(result.logs).toEqual([
        'Test Wait executed successfully',
        'Consumed 2 energy, recovered 2 energy',
        'Time advanced by 2 units'
      ]);
      expect(mockCharacter.energy).toBe(50); // 50 - 2 + 2 = 50
      expect(mockWorldState.advanceTime).toHaveBeenCalledWith(2);
    });

    test('should handle energy recovery without exceeding max', () => {
      mockCharacter.energy = 99;
      interaction.execute(mockCharacter, mockWorldState);

      expect(mockCharacter.energy).toBe(99); // 99 - 2 + 2 = 99 (capped at 100)
    });

    test('should handle missing maxEnergy', () => {
      delete mockCharacter.maxEnergy;
      mockCharacter.energy = 98;
      interaction.execute(mockCharacter, mockWorldState);

      expect(mockCharacter.energy).toBe(98); // 98 - 2 + 2 = 98 (capped at 100 default)
    });

    test('should handle environmental modifiers during execution', () => {
      mockEnvironment.getComfortLevel.mockReturnValue(1.3);
      const result = interaction.execute(mockCharacter, mockWorldState);

      expect(result.energyConsumed).toBe(2); // 2 * 0.9 = 1.8, rounded to 2
      expect(result.environmentalFactors.modifier).toBe(0.9);
      expect(result.environmentalFactors.comfortLevel).toBe(1.3);
    });

    test('should handle missing environment gracefully', () => {
      mockWorldState.getCurrentEnvironment = jest.fn(() => null);
      const result = interaction.execute(mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.energyConsumed).toBe(2);
      expect(result.environmentalFactors.modifier).toBe(1.0);
      expect(result.environmentalFactors.comfortLevel).toBe(1.0);
    });

    test('should handle missing getCurrentEnvironment method', () => {
      delete mockWorldState.getCurrentEnvironment;
      const result = interaction.execute(mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.energyConsumed).toBe(2);
      expect(result.environmentalFactors.modifier).toBe(1.0);
      expect(result.environmentalFactors.comfortLevel).toBe(1.0);
    });

    test('should handle missing advanceTime method', () => {
      delete mockWorldState.advanceTime;
      const result = interaction.execute(mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.timeAdvanced).toBe(2);
      // Should not throw error if advanceTime is missing
    });
  });

  describe('Duration Configuration', () => {
    test('should support different duration values', () => {
      const durations = [1, 2, 5, 10];

      durations.forEach(duration => {
        const interaction = new WaitInteraction({ duration });
        expect(interaction.duration).toBe(duration);
      });
    });

    test('should default to duration of 1', () => {
      const interaction = new WaitInteraction();
      expect(interaction.duration).toBe(1);
    });

    test('should calculate energy recovery based on duration', () => {
      const interaction = new WaitInteraction({
        duration: 3,
        energyRecoveryRate: 0.5
      });

      const mockCharacter = { energy: 50, maxEnergy: 100 };
      const mockWorldState = {
        getCurrentEnvironment: jest.fn(() => ({ getComfortLevel: () => 1.0 }))
      };

      const result = interaction.execute(mockCharacter, mockWorldState);
      expect(result.energyRecovered).toBe(2); // 0.5 * 3, rounded
    });
  });

  describe('Energy Recovery Rate', () => {
    test('should support different recovery rates', () => {
      const rates = [0.0, 0.5, 1.0, 2.0];

      rates.forEach(rate => {
        const interaction = new WaitInteraction({ energyRecoveryRate: rate });
        expect(interaction.energyRecoveryRate).toBe(rate);
      });
    });

    test('should default to recovery rate of 0.5', () => {
      const interaction = new WaitInteraction();
      expect(interaction.energyRecoveryRate).toBe(0.5);
    });

    test('should handle zero recovery rate', () => {
      const interaction = new WaitInteraction({
        energyRecoveryRate: 0,
        duration: 2
      });

      const mockCharacter = { energy: 50, maxEnergy: 100 };
      const mockWorldState = {
        getCurrentEnvironment: jest.fn(() => ({ getComfortLevel: () => 1.0 }))
      };

      interaction.execute(mockCharacter, mockWorldState);
      expect(mockCharacter.energy).toBe(50); // 50 - 0 + 0
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON correctly', () => {
      const interaction = new WaitInteraction({
        id: 'wait-123',
        name: 'Test Wait',
        description: 'A test wait interaction',
        type: 'wait',
        priority: 'low',
        baseEnergyCost: 2,
        duration: 3,
        energyRecoveryRate: 1.5
      });

      const json = interaction.toJSON();

      expect(json).toEqual({
        id: 'wait-123',
        name: 'Test Wait',
        description: 'A test wait interaction',
        type: 'wait',
        isSystemInteraction: true,
        priority: 'low',
        baseEnergyCost: 2,
        duration: 3,
        energyRecoveryRate: 1.5
      });
    });

    test('should deserialize from JSON correctly', () => {
      const data = {
        id: 'wait-123',
        name: 'Test Wait',
        type: 'wait',
        priority: 'low',
        baseEnergyCost: 2,
        duration: 3,
        energyRecoveryRate: 1.5
      };

      const interaction = WaitInteraction.fromJSON(data);

      expect(interaction.id).toBe('wait-123');
      expect(interaction.name).toBe('Test Wait');
      expect(interaction.type).toBe('wait');
      expect(interaction.priority).toBe('low');
      expect(interaction.baseEnergyCost).toBe(2);
      expect(interaction.duration).toBe(3);
      expect(interaction.energyRecoveryRate).toBe(1.5);
    });
  });

  describe('Inheritance', () => {
    test('should inherit from SystemInteraction', () => {
      const interaction = new WaitInteraction();
      expect(interaction).toBeInstanceOf(WaitInteraction);
      expect(interaction).toBeInstanceOf(SystemInteraction);
      expect(interaction).toBeInstanceOf(Object);
    });

    test('should allow further subclassing', () => {
      class SpecializedWaitInteraction extends WaitInteraction {
        getEnvironmentalModifier(environment) {
          return 0.8; // Always more efficient
        }
      }

      const interaction = new SpecializedWaitInteraction({
        baseEnergyCost: 2
      });

      const cost = interaction.getEnergyCost({}, { getComfortLevel: () => 1.0 });
      expect(cost).toBe(2); // 2 * 0.8 = 1.6, rounded to 2
    });
  });

  describe('Edge Cases', () => {
    test('should handle fractional energy recovery correctly', () => {
      const interaction = new WaitInteraction({
        duration: 3,
        energyRecoveryRate: 0.33
      });

      const mockCharacter = { energy: 50, maxEnergy: 100 };
      const mockWorldState = {
        getCurrentEnvironment: jest.fn(() => ({ getComfortLevel: () => 1.0 }))
      };

      const result = interaction.execute(mockCharacter, mockWorldState);
      expect(result.energyRecovered).toBe(1); // Math.round(0.33 * 3) = 1
    });

    test('should handle very long duration', () => {
      const interaction = new WaitInteraction({
        duration: 100,
        energyRecoveryRate: 0.1
      });

      const mockCharacter = { energy: 50, maxEnergy: 100 };
      const mockWorldState = {
        getCurrentEnvironment: jest.fn(() => ({ getComfortLevel: () => 1.0 }))
      };

      const result = interaction.execute(mockCharacter, mockWorldState);
      expect(result.energyRecovered).toBe(10); // Math.round(0.1 * 100) = 10
      expect(mockCharacter.energy).toBe(60); // 50 + 10 = 60 (baseEnergyCost is 0)
    });

    test('should handle negative energy recovery rate', () => {
      const interaction = new WaitInteraction({
        energyRecoveryRate: -0.5,
        duration: 2
      });

      const mockCharacter = { energy: 50, maxEnergy: 100 };
      const mockWorldState = {
        getCurrentEnvironment: jest.fn(() => ({ getComfortLevel: () => 1.0 }))
      };

      interaction.execute(mockCharacter, mockWorldState);
      expect(mockCharacter.energy).toBe(49); // 50 - 0 - 1
    });
  });
});
