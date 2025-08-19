/**
 * Pipeline Validation Tests
 * 
 * Tests to verify that attempts to bypass the preparation pipeline fail
 * with appropriate error messages, ensuring architectural integrity.
 */

import { renderHook } from '@testing-library/react';
import SimulationService from '../application/use-cases/services/SimulationService.js';
import useSimulation from '../presentation/hooks/useSimulation.js';
import WorldState from '../domain/entities/WorldState.js';
import pipelineValidationService from '../application/services/PipelineValidationService.js';

describe('Pipeline Validation - Bypass Prevention', () => {
  
  describe('WorldState Direct Conversion Prevention', () => {
    test('toSimulationConfig() should always throw error', () => {
      const worldState = new WorldState({
        name: 'Test World',
        dimensions: { width: 100, height: 100 }
      });
      
      expect(() => worldState.toSimulationConfig()).toThrow(
        'Direct world-to-simulation conversion is no longer supported'
      );
    });
  });

  describe('SimulationService Direct Initialization Prevention', () => {
    test('should reject raw config data', () => {
      const rawConfig = {
        worldName: 'Test World',
        nodes: [],
        characters: []
      };
      
      expect(() => SimulationService.initialize(rawConfig)).toThrow(
        'SimulationService.initialize() now requires prepared world data'
      );
    });

    test('should reject data without simulationMetadata', () => {
      const invalidData = {
        worldProperties: { name: 'Test' },
        nodes: new Map(),
        characters: new Map()
      };
      
      expect(() => SimulationService.initialize(invalidData)).toThrow(
        'SimulationService.initialize() now requires prepared world data'
      );
    });

    test('should reject data with wrong source', () => {
      const wrongSourceData = {
        worldProperties: { name: 'Test' },
        nodes: new Map(),
        characters: new Map(),
        interactions: new Map(),
        simulationMetadata: {
          source: 'DirectCreation',
          preparedAt: new Date().toISOString()
        }
      };
      
      expect(() => SimulationService.initialize(wrongSourceData)).toThrow(
        'Invalid world data source. World must be prepared through WorldBuilder.prepareForSimulation()'
      );
    });

    test('should reject data with invalid structure (arrays instead of Maps)', () => {
      const invalidStructureData = {
        worldProperties: { name: 'Test' },
        nodes: [], // Should be Map
        characters: [], // Should be Map
        interactions: [], // Should be Map
        simulationMetadata: {
          source: 'WorldBuilder',
          preparedAt: new Date().toISOString()
        }
      };
      
      expect(() => SimulationService.initialize(invalidStructureData)).toThrow(
        'Invalid world data structure: nodes must be a Map'
      );
    });
  });

  describe('useSimulation Hook Context Requirement', () => {
    test('should throw error when used outside SimulationContext', () => {
      // Clear context stack to simulate usage outside context
      while (pipelineValidationService.popContext()) {
        // Clear all contexts
      }
      
      expect(() => {
        renderHook(() => useSimulation(null));
      }).toThrow(
        'useSimulation hook must be used within SimulationContext'
      );
    });

    test('should throw error even with valid prepared data outside context', () => {
      const validPreparedData = {
        worldProperties: { name: 'Test' },
        nodes: new Map(),
        characters: new Map(),
        interactions: new Map(),
        simulationMetadata: {
          source: 'WorldBuilder',
          preparedAt: new Date().toISOString()
        }
      };
      
      expect(() => {
        renderHook(() => useSimulation(validPreparedData));
      }).toThrow(
        'useSimulation hook must be used within SimulationContext'
      );
    });
  });

  describe('Validation Token Security', () => {
    beforeEach(() => {
      // Clear any existing validated worlds
      pipelineValidationService.cleanupExpiredTokens();
    });

    test('should reject invalid tokens', () => {
      const worldData = {
        worldProperties: { name: 'Test' },
        nodes: new Map(),
        characters: new Map(),
        interactions: new Map()
      };
      
      const result = pipelineValidationService.validateToken(worldData, 'invalid_token');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid or expired validation token');
    });

    test('should reject modified world data', () => {
      const worldData = {
        worldProperties: { name: 'Test World', worldId: 'test123' },
        nodes: new Map([['node1', { id: 'node1', name: 'Node 1' }]]),
        characters: new Map(),
        interactions: new Map()
      };
      
      // Generate token for original data
      const token = pipelineValidationService.generateValidationToken(worldData, 'WorldBuilder');
      
      // Modify the data
      worldData.worldProperties.name = 'Modified World';
      
      const result = pipelineValidationService.validateToken(worldData, token);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('World data has been modified after preparation');
    });

    test('should only allow WorldBuilder as source for token generation', () => {
      const worldData = {
        worldProperties: { name: 'Test' }
      };
      
      expect(() => {
        pipelineValidationService.generateValidationToken(worldData, 'CustomSource');
      }).toThrow('Invalid preparation source. Only WorldBuilder can generate validation tokens');
    });
  });

  describe('Context Stack Validation', () => {
    test('requireSimulationContext should throw when not in context', () => {
      // Clear context stack
      while (pipelineValidationService.popContext()) {
        // Clear all contexts
      }
      
      expect(() => {
        pipelineValidationService.requireSimulationContext();
      }).toThrow(
        'This operation must be performed within SimulationContext'
      );
    });

    test('requireSimulationContext should pass when in context', () => {
      pipelineValidationService.pushContext('SimulationContext');
      
      expect(() => {
        pipelineValidationService.requireSimulationContext();
      }).not.toThrow();
      
      // Clean up
      pipelineValidationService.popContext();
    });
  });

  describe('Integration - Full Pipeline Validation', () => {
    test('should prevent creating simulation without going through pipeline', () => {
      // Attempt 1: Direct world state conversion
      const worldState = new WorldState({ name: 'Test' });
      expect(() => worldState.toSimulationConfig()).toThrow();
      
      // Attempt 2: Direct service initialization with raw config
      const rawConfig = { worldName: 'Test', nodes: [] };
      expect(() => SimulationService.initialize(rawConfig)).toThrow();
      
      // Attempt 3: Manually created "prepared" data with wrong source
      const fakePreparedData = {
        worldProperties: { name: 'Test' },
        nodes: new Map(),
        characters: new Map(),
        interactions: new Map(),
        simulationMetadata: {
          source: 'Manual',
          preparedAt: new Date().toISOString()
        }
      };
      expect(() => SimulationService.initialize(fakePreparedData)).toThrow(
        'Invalid world data source'
      );
      
      // Attempt 4: Use hook outside context
      expect(() => {
        renderHook(() => useSimulation(fakePreparedData));
      }).toThrow('must be used within SimulationContext');
    });
  });

  describe('Deprecation Warnings', () => {
    test('processMapplessWorldState should log deprecation warning', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      SimulationService.processMapplessWorldState({});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('processMapplessWorldState is deprecated')
      );
      
      consoleSpy.mockRestore();
    });

    test('validateMapplessWorldConfig should return false and log warning', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = SimulationService.validateMapplessWorldConfig({});
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('validateMapplessWorldConfig is deprecated')
      );
      
      consoleSpy.mockRestore();
    });
  });
});
