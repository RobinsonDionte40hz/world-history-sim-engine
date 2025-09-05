/**
 * Unit Tests for RestInteraction Class
 *
 * Tests the core functionality of t    test('should return re    test('should return improved modifier for safe location in dangerous environment', () => {
      const safeInteraction = new RestInteraction({
        duration: 8,
       expect(estimation.energyRestored).toBe(50); // Min(50, 20*8*1.0) = Min(50, 160) = 50
      expect(estimation.healthRestored).toBe(20);  // Min(20, 5*8*1.0) = Min(20, 40) = 20
      expect(estimation.environmentalModifier).toBe(1.0);
      expect(estimation.restDuration).toBe(8);
      expect(estimation.isSafe).toBe(false);  isSafe: true,
        environment: mockEnvironment
      });

      mockEnvironment.isDangerous.mockReturnValue(true);
      mockEnvironment.getComfortLevel.mockReturnValue(0.3);

      const modifier = safeInteraction.getEnvironmentalModifier();
      expect(modifier).toBe(0.48); // 1.2 * (0.5 + 0.3) = 0.48
    });r for dangerous environment without safe location', () => {
      const dangerousInteraction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: mockEnvironment
      });

      mockEnvironment.isDangerous.mockReturnValue(true);
      mockEnvironment.getComfortLevel.mockReturnValue(0.3);

      const modifier = dangerousInteraction.getEnvironmentalModifier();
      expect(modifier).toBe(0.24); // 0.3 * (0.5 + 0.3) = 0.24
    });ction class,
 * including environmental safety checks, restoration mechanics,
 * comfort level integration, and execution with various scenarios.
 */

import RestInteraction from '../../domain/entities/interactions/RestInteraction.js';
import SystemInteraction from '../../domain/entities/interactions/SystemInteraction.js';
import Environment from '../../domain/value-objects/Environment.js';

describe('RestInteraction', () => {
  describe('Constructor', () => {
    test('should create instance with default values', () => {
      const interaction = new RestInteraction({});

      expect(interaction.isSystemInteraction).toBe(true);
      expect(interaction.name).toBe('Rest');
      expect(interaction.description).toBe('Take time to rest and recover energy and health');
      expect(interaction.baseEnergyCost).toBe(0);
      expect(interaction.duration).toBe(8);
      expect(interaction.isSafe).toBe(false);
      expect(interaction.restDuration).toBe(8);
    });

    test('should create instance with provided config', () => {
      const config = {
        name: 'Custom Rest',
        description: 'Custom rest interaction',
        duration: 4,
        isSafe: true,
        environment: Environment.createDefault()
      };

      const interaction = new RestInteraction(config);

      expect(interaction.name).toBe('Custom Rest');
      expect(interaction.description).toBe('Custom rest interaction');
      expect(interaction.duration).toBe(4);
      expect(interaction.isSafe).toBe(true);
      expect(interaction.restDuration).toBe(4);
      expect(interaction.environment).toBe(config.environment);
    });

    test('should be immutable after creation', () => {
      const interaction = new RestInteraction({});

      expect(() => {
        interaction.name = 'Modified Name';
      }).toThrow();

      expect(() => {
        interaction.duration = 12;
      }).toThrow();

      expect(() => {
        interaction.isSafe = true;
      }).toThrow();
    });
  });

  describe('Environmental Integration', () => {
    let interaction;
    let mockEnvironment;

    beforeEach(() => {
      interaction = new RestInteraction({
        duration: 8,
        isSafe: false
      });

      mockEnvironment = {
        isDangerous: jest.fn(() => false),
        getComfortLevel: jest.fn(() => 1.0)
      };
    });

    test('should return normal modifier for safe, comfortable environment', () => {
      mockEnvironment.isDangerous.mockReturnValue(false);
      mockEnvironment.getComfortLevel.mockReturnValue(1.0);

      const modifier = interaction.getEnvironmentalModifier();
      expect(modifier).toBe(1.0);
    });

    test('should return reduced modifier for dangerous environment without safe location', () => {
      const dangerousInteraction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: mockEnvironment
      });

      mockEnvironment.isDangerous.mockReturnValue(true);
      mockEnvironment.getComfortLevel.mockReturnValue(1.0);

      const modifier = dangerousInteraction.getEnvironmentalModifier();
      expect(modifier).toBe(0.3);
    });

    test('should return improved modifier for safe location in dangerous environment', () => {
      const safeInteraction = new RestInteraction({
        duration: 8,
        isSafe: true,
        environment: mockEnvironment
      });

      mockEnvironment.isDangerous.mockReturnValue(true);
      mockEnvironment.getComfortLevel.mockReturnValue(1.0);

      const modifier = safeInteraction.getEnvironmentalModifier();
      expect(modifier).toBe(1.2);
    });

    test('should apply comfort level modifiers', () => {
      const comfortableInteraction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: mockEnvironment
      });

      mockEnvironment.isDangerous.mockReturnValue(false);
      mockEnvironment.getComfortLevel.mockReturnValue(0.8);

      const modifier = comfortableInteraction.getEnvironmentalModifier();
      expect(modifier).toBe(1.3); // 1.0 * (0.5 + 0.8) = 1.3
    });

    test('should combine safety and comfort modifiers', () => {
      const safeComfortableInteraction = new RestInteraction({
        duration: 8,
        isSafe: true,
        environment: mockEnvironment
      });

      mockEnvironment.isDangerous.mockReturnValue(false);
      mockEnvironment.getComfortLevel.mockReturnValue(0.6);

      const modifier = safeComfortableInteraction.getEnvironmentalModifier();
      expect(modifier).toBe(1.32); // 1.2 * (0.5 + 0.6) = 1.32
    });

    test('should handle missing environment', () => {
      const noEnvInteraction = new RestInteraction({
        duration: 8,
        isSafe: false
      });

      const modifier = noEnvInteraction.getEnvironmentalModifier();
      expect(modifier).toBe(1.0);
    });

    test('should clamp modifier within bounds', () => {
      const extremeInteraction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: mockEnvironment
      });

      mockEnvironment.isDangerous.mockReturnValue(false);
      mockEnvironment.getComfortLevel.mockReturnValue(2.0); // Very comfortable

      const modifier = extremeInteraction.getEnvironmentalModifier();
      expect(modifier).toBe(2.0); // Clamped to max 2.0
    });
  });

  describe('Execution Availability', () => {
    let interaction;
    let mockCharacter;
    let mockWorld;

    beforeEach(() => {
      interaction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: Environment.createDefault()
      });

      mockCharacter = {
        energy: 50,
        health: 80
      };

      mockWorld = {
        currentTime: 1000,
        getCurrentEnvironment: jest.fn(() => Environment.createDefault())
      };
    });

    test('should be available when character needs rest', () => {
      const available = interaction.canExecute({ character: mockCharacter, world: mockWorld });
      expect(available).toBe(true);
    });

    test('should not be available when character is at full energy and health', () => {
      mockCharacter.energy = 100;
      mockCharacter.health = 100;

      const available = interaction.canExecute({ character: mockCharacter, world: mockWorld });
      expect(available).toBe(false);
    });

    test('should not be available in dangerous environment without safe location', () => {
      const dangerousEnv = Environment.createHostile();
      const dangerousInteraction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: dangerousEnv
      });

      const available = dangerousInteraction.canExecute({ character: mockCharacter, world: mockWorld });
      expect(available).toBe(false);
    });

    test('should be available in dangerous environment with safe location', () => {
      const dangerousEnv = Environment.createHostile();
      const safeInteraction = new RestInteraction({
        duration: 8,
        isSafe: true,
        environment: dangerousEnv
      });

      const available = safeInteraction.canExecute({ character: mockCharacter, world: mockWorld });
      expect(available).toBe(true);
    });

    test('should be available in safe environment regardless of safety flag', () => {
      const safeEnv = Environment.createSafe();
      const interaction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: safeEnv
      });

      const available = interaction.canExecute({ character: mockCharacter, world: mockWorld });
      expect(available).toBe(true);
    });
  });

  describe('Restoration Calculations', () => {
    let interaction;
    let mockCharacter;

    beforeEach(() => {
      interaction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: {
          isDangerous: () => false,
          getComfortLevel: () => 0.4  // Below 0.5 threshold, no comfort bonus
        }
      });

      mockCharacter = {
        energy: 50,
        health: 80
      };
    });

    test('should calculate correct restoration amounts for normal conditions', () => {
      const estimation = interaction.getEstimatedRestoration(mockCharacter);

      expect(estimation.energyRestored).toBe(50); // Min(100-50, 20*8*1.0) = Min(50, 160) = 50
      expect(estimation.healthRestored).toBe(20);  // Min(100-80, 5*8*1.0) = Min(20, 40) = 20
      expect(estimation.environmentalModifier).toBe(1.0);
      expect(estimation.restDuration).toBe(8);
      expect(estimation.isSafe).toBe(false);
    });

    test('should apply environmental modifiers to restoration', () => {
      const comfortableEnv = Environment.createSafe();
      const comfortableInteraction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: comfortableEnv
      });

      const estimation = comfortableInteraction.getEstimatedRestoration(mockCharacter);

      expect(estimation.energyRestored).toBe(50); // Min(50, 20*8*1.4) = Min(50, 224) = 50
      expect(estimation.healthRestored).toBe(20);  // Min(20, 5*8*1.4) = Min(20, 56) = 20
      expect(estimation.environmentalModifier).toBeGreaterThan(1.0);
    });

    test('should cap restoration at character maximums', () => {
      mockCharacter.energy = 95;
      mockCharacter.health = 98;

      const estimation = interaction.getEstimatedRestoration(mockCharacter);

      expect(estimation.energyRestored).toBe(5);  // Max 100 - 95 = 5
      expect(estimation.healthRestored).toBe(2);  // Max 100 - 98 = 2
    });

    test('should handle zero duration', () => {
      const zeroDurationInteraction = new RestInteraction({
        duration: 0,
        isSafe: false,
        environment: Environment.createDefault()
      });

      const estimation = zeroDurationInteraction.getEstimatedRestoration(mockCharacter);

      expect(estimation.energyRestored).toBe(0);
      expect(estimation.healthRestored).toBe(0);
      expect(estimation.restDuration).toBe(0);
    });
  });

  describe('Execution Logic', () => {
    let interaction;
    let mockCharacter;
    let mockWorld;

    beforeEach(() => {
      interaction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: {
          isDangerous: () => false,
          getComfortLevel: () => 0.4  // Below 0.5 threshold, no comfort bonus
        }
      });

      mockCharacter = {
        energy: 50,
        health: 80,
        lastRestTime: 900
      };

      mockWorld = {
        currentTime: 1000
      };
    });

    test('should execute successfully and restore energy and health', () => {
      const result = interaction.execute({ character: mockCharacter, world: mockWorld });

      expect(result.success).toBe(true);
      expect(result.character.energy).toBe(100); // 50 + 50 (capped at 100)
      expect(result.character.health).toBe(100); // 80 + 20 (capped at 100)
      expect(result.character.lastRestTime).toBe(1000);
      expect(result.details.energyRestored).toBe(50);
      expect(result.details.healthRestored).toBe(20);
      expect(result.details.environmentalModifier).toBe(1.0);
      expect(result.details.restDuration).toBe(8);
      expect(result.details.isSafe).toBe(false);
    });

    test('should handle partial restoration when near maximums', () => {
      mockCharacter.energy = 95;
      mockCharacter.health = 98;

      const result = interaction.execute({ character: mockCharacter, world: mockWorld });

      expect(result.character.energy).toBe(100);
      expect(result.character.health).toBe(100);
      expect(result.details.energyRestored).toBe(5);
      expect(result.details.healthRestored).toBe(2);
    });

    test('should apply environmental modifiers during execution', () => {
      const comfortableEnv = Environment.createSafe();
      const comfortableInteraction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: comfortableEnv
      });

      const result = comfortableInteraction.execute({ character: mockCharacter, world: mockWorld });

      expect(result.details.energyRestored).toBe(50); // Character starts at 50, can only gain 50
      expect(result.details.healthRestored).toBe(20); // Character starts at 80, can only gain 20
      expect(result.details.environmentalModifier).toBeGreaterThan(1.0);
    });

    test('should handle dangerous environment with safe location', () => {
      const dangerousEnv = Environment.createHostile();
      const safeInteraction = new RestInteraction({
        duration: 8,
        isSafe: true,
        environment: dangerousEnv
      });

      const result = safeInteraction.execute({ character: mockCharacter, world: mockWorld });

      expect(result.success).toBe(true);
      expect(result.details.energyRestored).toBe(50); // Character starts at 50, can only gain 50
      expect(result.details.environmentalModifier).toBeGreaterThan(1.0);
    });

    test('should fail execution in dangerous environment without safe location', () => {
      const dangerousEnv = Environment.createHostile();
      const dangerousInteraction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: dangerousEnv
      });

      const result = dangerousInteraction.execute({ character: mockCharacter, world: mockWorld });

      expect(result.success).toBe(false);
    });

    test('should handle missing environment gracefully', () => {
      const noEnvInteraction = new RestInteraction({
        duration: 8,
        isSafe: false
      });

      const result = noEnvInteraction.execute({ character: mockCharacter, world: mockWorld });

      expect(result.success).toBe(true);
      expect(result.details.environmentalModifier).toBe(1.0);
    });
  });

  describe('Duration Configuration', () => {
    test('should support different duration values', () => {
      const durations = [1, 4, 8, 12, 24];

      durations.forEach(duration => {
        const interaction = new RestInteraction({ duration });
        expect(interaction.duration).toBe(duration);
        expect(interaction.restDuration).toBe(duration);
      });
    });

    test('should default to 8 hour duration', () => {
      const interaction = new RestInteraction({});
      expect(interaction.duration).toBe(8);
      expect(interaction.restDuration).toBe(8);
    });

    test('should scale restoration with duration', () => {
      const shortRest = new RestInteraction({
        duration: 4,
        environment: Environment.createDefault()
      });

      const longRest = new RestInteraction({
        duration: 12,
        environment: Environment.createDefault()
      });

      const mockCharacter = { energy: 50, health: 80 };

      const shortEstimation = shortRest.getEstimatedRestoration(mockCharacter);
      const longEstimation = longRest.getEstimatedRestoration(mockCharacter);

      expect(shortEstimation.energyRestored).toBe(50);  // Min(50, 20*4*1.0) = Min(50, 80) = 50
      expect(longEstimation.energyRestored).toBe(50); // Min(50, 20*12*1.0) = Min(50, 240) = 50
      expect(shortEstimation.healthRestored).toBe(20);  // Min(20, 5*4*1.0) = Min(20, 20) = 20
      expect(longEstimation.healthRestored).toBe(20);  // Min(20, 5*12*1.0) = Min(20, 60) = 20
    });
  });

  describe('Safety Configuration', () => {
    test('should support safe and unsafe rest locations', () => {
      const safeRest = new RestInteraction({
        duration: 8,
        isSafe: true,
        environment: Environment.createDefault()
      });

      const unsafeRest = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: Environment.createDefault()
      });

      expect(safeRest.isSafe).toBe(true);
      expect(unsafeRest.isSafe).toBe(false);
    });

    test('should default to unsafe location', () => {
      const interaction = new RestInteraction({});
      expect(interaction.isSafe).toBe(false);
    });

    test('should allow rest in dangerous environments when safe location specified', () => {
      const dangerousEnv = Environment.createHostile();
      const safeRest = new RestInteraction({
        duration: 8,
        isSafe: true,
        environment: dangerousEnv
      });

      const mockCharacter = { energy: 50, health: 80 };
      const mockWorld = { currentTime: 1000, getCurrentEnvironment: jest.fn(() => dangerousEnv) };

      const available = safeRest.canExecute({ character: mockCharacter, world: mockWorld });
      expect(available).toBe(true);

      const result = safeRest.execute({ character: mockCharacter, world: mockWorld });
      expect(result.success).toBe(true);
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON correctly', () => {
      const interaction = new RestInteraction({
        id: 'rest-123',
        name: 'Test Rest',
        description: 'A test rest interaction',
        duration: 6,
        isSafe: true,
        environment: Environment.createDefault()
      });

      const json = interaction.toJSON();

      expect(json).toEqual({
        id: 'rest-123',
        name: 'Test Rest',
        description: 'A test rest interaction',
        type: 'RestInteraction',
        isSystemInteraction: true,
        priority: 'normal',
        baseEnergyCost: 0,
        duration: 6,
        environment: Environment.createDefault().toJSON(),
        isSafe: true,
        restDuration: 6
      });
    });

    test('should deserialize from JSON correctly', () => {
      const data = {
        id: 'rest-123',
        name: 'Test Rest',
        description: 'A test rest interaction',
        duration: 6,
        isSafe: true,
        environment: Environment.createDefault().toJSON()
      };

      const interaction = RestInteraction.fromJSON(data);

      expect(interaction.id).toBe('rest-123');
      expect(interaction.name).toBe('Test Rest');
      expect(interaction.description).toBe('A test rest interaction');
      expect(interaction.duration).toBe(6);
      expect(interaction.isSafe).toBe(true);
      expect(interaction.restDuration).toBe(6);
    });
  });

  describe('Inheritance', () => {
    test('should inherit from SystemInteraction', () => {
      const interaction = new RestInteraction({});
      expect(interaction).toBeInstanceOf(RestInteraction);
      expect(interaction).toBeInstanceOf(SystemInteraction);
      expect(interaction).toBeInstanceOf(Object);
    });

    test('should allow further subclassing', () => {
      class SpecializedRestInteraction extends RestInteraction {
        getEnvironmentalModifier() {
          return 1.5; // Always more effective
        }
      }

      const interaction = new SpecializedRestInteraction({
        duration: 8,
        environment: Environment.createDefault()
      });

      const mockCharacter = { energy: 50, health: 80 };
      const estimation = interaction.getEstimatedRestoration(mockCharacter);

      expect(estimation.energyRestored).toBe(50); // Min(50, 20*8*1.5) = Min(50, 240) = 50
      expect(estimation.healthRestored).toBe(20);  // Min(20, 5*8*1.5) = Min(20, 60) = 20
    });
  });

  describe('Edge Cases', () => {
    test('should handle fractional restoration amounts correctly', () => {
      const fractionalInteraction = new RestInteraction({
        duration: 1,
        environment: {
          isDangerous: () => false,
          getComfortLevel: () => 0.4  // Below 0.5 threshold, no comfort bonus
        }
      });

      const mockCharacter = { energy: 50, health: 80 };
      const estimation = fractionalInteraction.getEstimatedRestoration(mockCharacter);

      expect(estimation.energyRestored).toBe(20); // Min(50, 20*1*1.0) = Min(50, 20) = 20
      expect(estimation.healthRestored).toBe(5);  // Min(20, 5*1*1.0) = Min(20, 5) = 5
    });

    test('should handle very long rest duration', () => {
      const longRest = new RestInteraction({
        duration: 100,
        environment: Environment.createDefault()
      });

      const mockCharacter = { energy: 50, health: 80 };
      const estimation = longRest.getEstimatedRestoration(mockCharacter);

      expect(estimation.energyRestored).toBe(50); // Min(50, 20*100*1.0) = Min(50, 2000) = 50
      expect(estimation.healthRestored).toBe(20);  // Min(20, 5*100*1.0) = Min(20, 500) = 20
    });

    test('should handle zero comfort level environment', () => {
      const hostileEnv = Environment.createHostile();
      const hostileInteraction = new RestInteraction({
        duration: 8,
        isSafe: false,
        environment: hostileEnv
      });

      const mockCharacter = { energy: 50, health: 80 };
      const estimation = hostileInteraction.getEstimatedRestoration(mockCharacter);

      expect(estimation.energyRestored).toBeLessThan(160); // Should be reduced
      expect(estimation.healthRestored).toBeLessThan(40);
      expect(estimation.environmentalModifier).toBeLessThan(1.0);
    });

    test('should handle character at zero energy/health', () => {
      const testInteraction = new RestInteraction({
        duration: 8,
        environment: {
          isDangerous: () => false,
          getComfortLevel: () => 0.4  // Below 0.5 threshold, no comfort bonus
        }
      });
      const mockCharacter = { energy: 0, health: 0 };
      const estimation = testInteraction.getEstimatedRestoration(mockCharacter);

      expect(estimation.energyRestored).toBe(100); // Min(100, 20*8*1.0) = Min(100, 160) = 100
      expect(estimation.healthRestored).toBe(40); // Min(100, 5*8*1.0) = Min(100, 40) = 40
    });

    test('should handle character already at maximum', () => {
      const testInteraction = new RestInteraction({
        duration: 8,
        environment: Environment.createDefault()
      });
      const mockCharacter = { energy: 100, health: 100 };
      const estimation = testInteraction.getEstimatedRestoration(mockCharacter);

      expect(estimation.energyRestored).toBe(0);
      expect(estimation.healthRestored).toBe(0);
    });
  });
});
