// src/domain/services/__tests__/InteractionExecutor.test.js

import InteractionExecutor from '../InteractionExecutor.js';
import WaitInteraction from '../../entities/interactions/WaitInteraction.js';
import RestInteraction from '../../entities/interactions/RestInteraction.js';
import Environment from '../../value-objects/Environment.js';

describe('InteractionExecutor', () => {
  let executor;
  let mockCharacter;
  let mockWorldState;
  let mockEnvironment;
  let mockInteraction;

  beforeEach(() => {
    // Create executor with default config
    executor = new InteractionExecutor({
      enableLogging: false, // Disable logging for tests
      enableDebugging: false
    });

    // Create mock character
    mockCharacter = {
      id: 'char1',
      name: 'Test Character',
      energy: 50,
      maxEnergy: 100,
      health: 100,
      currentNodeId: 'node1'
    };

    // Create mock environment
    mockEnvironment = Environment.createDefault();

    // Create mock world state
    mockWorldState = {
      id: 'world1',
      currentTime: 1000,
      getCurrentEnvironment: jest.fn(() => mockEnvironment),
      nodes: [{
        id: 'node1',
        name: 'Test Node',
        environment: mockEnvironment
      }]
    };

    // Create mock interaction
    mockInteraction = {
      id: 'interaction1',
      name: 'Test Interaction',
      type: 'test',
      canExecute: jest.fn(() => true),
      execute: jest.fn((character) => {
        character.energy = Math.max(0, character.energy - 5);
        return {
          success: true,
          energyConsumed: 5,
          logs: ['Test interaction executed']
        };
      }),
      getEnergyCost: jest.fn(() => 5)
    };
  });

  describe('constructor', () => {
    test('should create executor with default configuration', () => {
      const defaultExecutor = new InteractionExecutor();

      expect(defaultExecutor.enableLogging).toBe(true);
      expect(defaultExecutor.enableDebugging).toBe(false);
      expect(defaultExecutor.enableEnvironmentalEffects).toBe(true);
      expect(defaultExecutor.enableResourceTracking).toBe(true);
    });

    test('should create executor with custom configuration', () => {
      const customExecutor = new InteractionExecutor({
        enableLogging: false,
        enableDebugging: true,
        enableEnvironmentalEffects: false,
        enableResourceTracking: false
      });

      expect(customExecutor.enableLogging).toBe(false);
      expect(customExecutor.enableDebugging).toBe(true);
      expect(customExecutor.enableEnvironmentalEffects).toBe(false);
      expect(customExecutor.enableResourceTracking).toBe(false);
    });
  });

  describe('execute', () => {
    test('should execute interaction successfully', async () => {
      const result = await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.executionId).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
      expect(mockInteraction.canExecute).toHaveBeenCalledWith(mockCharacter, mockWorldState);
      expect(mockInteraction.execute).toHaveBeenCalledWith(mockCharacter, mockWorldState);
    });

    test('should handle interaction execution failure', async () => {
      mockInteraction.execute.mockImplementation(() => {
        throw new Error('Execution failed');
      });

      const result = await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Interaction execution failed: Execution failed');
      expect(result.executionId).toBeDefined();
    });

    test('should validate execution context', async () => {
      const result = await executor.execute(null, mockCharacter, mockWorldState);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Interaction is required');
    });

    test('should skip validation when requested', async () => {
      mockInteraction.canExecute.mockReturnValue(false);

      const result = await executor.execute(mockInteraction, mockCharacter, mockWorldState, {
        skipValidation: true
      });

      expect(result.success).toBe(true);
      expect(mockInteraction.canExecute).not.toHaveBeenCalled();
    });

    test('should perform dry run without applying changes', async () => {
      const originalEnergy = mockCharacter.energy;

      const result = await executor.execute(mockInteraction, mockCharacter, mockWorldState, {
        dryRun: true
      });

      expect(result.success).toBe(true);
      expect(result.simulated).toBe(true);
      expect(mockCharacter.energy).toBe(originalEnergy); // Should not change
    });

    test('should apply environmental effects when enabled', async () => {
      // Create hostile environment
      const hostileEnvironment = Environment.createHostile();
      mockWorldState.getCurrentEnvironment.mockReturnValue(hostileEnvironment);

      const result = await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      expect(result.environmentalEffects).toBeDefined();
      expect(result.environmentalEffects.applied).toBe(true);
    });

    test('should track resource consumption when enabled', async () => {
      const result = await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      expect(result.resourceConsumption).toBeDefined();
      expect(result.resourceConsumption.energy).toBeDefined();
      expect(result.resourceConsumption.health).toBeDefined();
      expect(result.resourceConsumption.time).toBeDefined();
    });

    test('should handle missing environment gracefully', async () => {
      mockWorldState.getCurrentEnvironment.mockReturnValue(null);

      const result = await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.environmentalEffects.applied).toBe(false);
    });
  });

  describe('environmental effects', () => {
    test('should apply comfort penalty in uncomfortable environment', async () => {
      const uncomfortableEnv = new Environment({
        shelterQuality: 0.2,
        airQuality: 0.3,
        waterAvailability: 0.2
      });
      mockWorldState.getCurrentEnvironment.mockReturnValue(uncomfortableEnv);

      const originalEnergy = mockCharacter.energy;
      await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      expect(mockCharacter.energy).toBeLessThan(originalEnergy);
    });

    test('should apply hazard damage in dangerous environment', async () => {
      const dangerousEnv = Environment.createHostile();
      mockWorldState.getCurrentEnvironment.mockReturnValue(dangerousEnv);

      const originalHealth = mockCharacter.health;
      await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      // Health might be reduced due to hazards
      expect(mockCharacter.health).toBeLessThanOrEqual(originalHealth);
    });
  });

  describe('resource tracking', () => {
    test('should track energy consumption', async () => {
      const originalEnergy = mockCharacter.energy;

      await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      expect(mockCharacter.energy).toBe(originalEnergy - 5);
    });

    test('should track health changes', async () => {
      const originalHealth = mockCharacter.health;

      await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      expect(mockCharacter.health).toBe(originalHealth);
    });
  });

  describe('error handling', () => {
    test('should track execution errors', async () => {
      mockInteraction.execute.mockImplementation(() => {
        throw new Error('Test error');
      });

      await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      const errorHistory = executor.getErrorHistory();
      expect(errorHistory.length).toBe(1);
      expect(errorHistory[0].error).toBe('Interaction execution failed: Test error');
    });

    test('should maintain error history limit', async () => {
      executor.maxErrorHistorySize = 2;

      // Generate 3 errors
      for (let i = 0; i < 3; i++) {
        mockInteraction.execute.mockImplementation(() => {
          throw new Error(`Error ${i}`);
        });
        await executor.execute(mockInteraction, mockCharacter, mockWorldState);
      }

      const errorHistory = executor.getErrorHistory();
      expect(errorHistory.length).toBe(2);
    });
  });

  describe('statistics', () => {
    test('should track execution statistics', async () => {
      await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      const stats = executor.getExecutionStats();
      expect(stats.totalExecutions).toBe(1);
      expect(stats.successfulExecutions).toBe(1);
      expect(stats.failedExecutions).toBe(0);
      expect(stats.averageExecutionTime).toBeGreaterThanOrEqual(0);
    });

    test('should track failed executions', async () => {
      mockInteraction.execute.mockImplementation(() => {
        throw new Error('Test error');
      });

      await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      const stats = executor.getExecutionStats();
      expect(stats.totalExecutions).toBe(1);
      expect(stats.successfulExecutions).toBe(0);
      expect(stats.failedExecutions).toBe(1);
    });

    test('should clear statistics', () => {
      executor.clearStats();
      const stats = executor.getExecutionStats();

      expect(stats.totalExecutions).toBe(0);
      expect(stats.successfulExecutions).toBe(0);
      expect(stats.failedExecutions).toBe(0);
    });
  });

  describe('integration with real interactions', () => {
    test('should execute WaitInteraction successfully', async () => {
      const waitInteraction = new WaitInteraction({ duration: 2 });

      const result = await executor.execute(waitInteraction, mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.energyRecovered).toBeDefined();
      expect(result.timeAdvanced).toBe(2);
    });

    test('should execute RestInteraction successfully', async () => {
      const restInteraction = new RestInteraction({});

      const result = await executor.execute(restInteraction, mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.energyConsumed).toBeDefined();
    });

    test('should handle interaction with environmental modifiers', async () => {
      const waitInteraction = new WaitInteraction();
      const comfortableEnv = Environment.createSafe();
      mockWorldState.getCurrentEnvironment.mockReturnValue(comfortableEnv);

      const result = await executor.execute(waitInteraction, mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.environmentalFactors).toBeDefined();
    });
  });

  describe('logging', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should log execution when enabled', async () => {
      const loggingExecutor = new InteractionExecutor({ enableLogging: true });

      await loggingExecutor.execute(mockInteraction, mockCharacter, mockWorldState);

      expect(consoleSpy).toHaveBeenCalled();
    });

    test('should not log when disabled', async () => {
      await executor.execute(mockInteraction, mockCharacter, mockWorldState);

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});
