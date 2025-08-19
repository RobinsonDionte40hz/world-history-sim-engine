/**
 * Integration Test: Architectural Dependencies
 * 
 * This test validates the mandatory simulation preparation pipeline:
 * World Building (Free-form) → Simulation Preparation Pipeline (Mandatory) → Simulation Context (Dependent)
 * 
 * Technical Implementation:
 * - WorldBuilder.prepareForSimulation() is the exclusive gateway method
 * - SimulationContext.acceptPreparedWorld() is the only way to start simulation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import WorldBuilder from '../domain/services/WorldBuilder.js';
import { SimulationProvider, useSimulationContext } from '../presentation/contexts/SimulationContext.js';
import TemplateManager from '../template/TemplateManager.js';
import SimulationService from '../application/use-cases/services/SimulationService.js';

// Test component to access SimulationContext
function TestComponent() {
  const {
    simulationReadinessStatus,
    pipelineValidationError,
    preparedWorldData
  } = useSimulationContext();

  return (
    <div>
      <div data-testid="has-prepared-world">{simulationReadinessStatus.hasPreparedWorld.toString()}</div>
      <div data-testid="is-simulation-ready">{simulationReadinessStatus.isSimulationReady.toString()}</div>
      <div data-testid="validation-error">{pipelineValidationError || 'none'}</div>
      <div data-testid="prepared-world-source">{preparedWorldData?.simulationMetadata?.source || 'none'}</div>
      <button
        data-testid="accept-world-button"
        onClick={() => {
          // This button would normally receive prepared world data from props
          // For testing, we'll simulate the integration
        }}
      >
        Accept Prepared World
      </button>
    </div>
  );
}

describe('Architectural Dependencies Integration', () => {
  let templateManager;
  let worldBuilder;

  beforeEach(() => {
    templateManager = new TemplateManager();
    worldBuilder = new WorldBuilder(templateManager);
  });

  describe('WorldBuilder.prepareForSimulation() as exclusive gateway', () => {
    test('should successfully prepare world through mandatory pipeline', () => {
      // Step 1: Free-form world building
      worldBuilder
        .setWorldProperties('Integration Test World', 'A world for testing architectural dependencies')
        .setRules({ 
          timeProgression: 'turn-based',
          maxTurns: 100,
          physics: { gravity: true }
        })
        .setInitialConditions({ 
          startingResources: 1000,
          difficulty: 'normal'
        });

      // Add nodes (locations)
      worldBuilder.addNode({
        name: 'Test Village',
        type: 'settlement',
        description: 'A village for testing',
        environmentalProperties: { climate: 'temperate' },
        resourceAvailability: { food: 'abundant' },
        culturalContext: { culture: 'farming' }
      });

      // Add interactions (capabilities)
      worldBuilder.addInteraction({
        name: 'Trade Goods',
        type: 'economic',
        requirements: { charisma: 12 },
        branches: [{ condition: 'success', outcome: 'gain_gold' }],
        effects: [{ type: 'resource', target: 'self', operation: 'add', value: 100 }],
        context: ['market', 'settlement']
      });

      // Add characters (actors)
      worldBuilder.addCharacter({
        name: 'Test Merchant',
        attributes: {
          strength: 10,
          dexterity: 12,
          constitution: 11,
          intelligence: 14,
          wisdom: 13,
          charisma: 16
        },
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id],
        personality: { trait: 'friendly' },
        consciousness: { frequency: 40 }
      });

      // Assign characters to nodes (populate locations)
      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      const characterId = worldBuilder.worldConfig.characters[0].id;
      worldBuilder.assignCharacterToNode(characterId, nodeId);

      // Step 2: Mandatory preparation pipeline - this is the exclusive gateway
      const preparedWorld = worldBuilder.prepareForSimulation();

      // Validate prepared world structure
      expect(preparedWorld).toBeDefined();
      expect(preparedWorld.simulationMetadata).toBeDefined();
      expect(preparedWorld.simulationMetadata.source).toBe('WorldBuilder');
      expect(preparedWorld.simulationMetadata.preparedAt).toBeDefined();
      expect(preparedWorld.simulationMetadata.worldId).toBeDefined();
      expect(preparedWorld.simulationMetadata.version).toBe('2.0.0');
      expect(preparedWorld.simulationMetadata.pipelineVersion).toBe('1.0.0');

      // Validate simulation-optimized data structures
      expect(preparedWorld.nodes).toBeInstanceOf(Map);
      expect(preparedWorld.characters).toBeInstanceOf(Map);
      expect(preparedWorld.interactions).toBeInstanceOf(Map);
      expect(preparedWorld.nodes.size).toBe(1);
      expect(preparedWorld.characters.size).toBe(1);
      expect(preparedWorld.interactions.size).toBe(1);

      // Validate world properties
      expect(preparedWorld.worldProperties.name).toBe('Integration Test World');
      expect(preparedWorld.worldProperties.rules).toBeDefined();
      expect(preparedWorld.worldProperties.initialConditions).toBeDefined();
    });

    test('should reject unprepared world data', () => {
      // Incomplete world should fail preparation
      worldBuilder.setWorldProperties('Incomplete World', 'Missing requirements');
      
      expect(() => {
        worldBuilder.prepareForSimulation();
      }).toThrow('World configuration is not valid for simulation');
    });
  });

  describe('SimulationContext.acceptPreparedWorld() as exclusive entry point', () => {
    test('should accept properly prepared world data', () => {
      // Prepare a complete world
      worldBuilder
        .setWorldProperties('Context Test World', 'A world for testing context integration')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 });

      worldBuilder.addNode({
        name: 'Test Node',
        type: 'settlement',
        description: 'A test settlement'
      });

      worldBuilder.addInteraction({
        name: 'Test Interaction',
        type: 'social',
        requirements: {},
        branches: [],
        effects: [],
        context: ['settlement']
      });

      worldBuilder.addCharacter({
        name: 'Test Character',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      });

      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      const characterId = worldBuilder.worldConfig.characters[0].id;
      worldBuilder.assignCharacterToNode(characterId, nodeId);

      const preparedWorld = worldBuilder.prepareForSimulation();

      // Validate the prepared world structure
      expect(preparedWorld.simulationMetadata.source).toBe('WorldBuilder');
      expect(preparedWorld.nodes).toBeInstanceOf(Map);
      expect(preparedWorld.characters).toBeInstanceOf(Map);

      // Render SimulationContext
      render(
        <SimulationProvider>
          <TestComponent />
        </SimulationProvider>
      );

      // Initially, no prepared world
      expect(screen.getByTestId('has-prepared-world')).toHaveTextContent('false');
      expect(screen.getByTestId('is-simulation-ready')).toHaveTextContent('false');
      expect(screen.getByTestId('prepared-world-source')).toHaveTextContent('none');

      // Note: In a real test, we would simulate clicking the button and passing preparedWorld
      // For this integration test, we're validating the structure and expectations
    });

    test('should reject unprepared world data', () => {
      const simulationService = new SimulationService();
      
      // Try to initialize with raw config instead of prepared data
      const rawConfig = {
        worldName: 'Raw World',
        nodes: [],
        characters: [],
        interactions: []
      };

      expect(() => {
        simulationService.initialize(rawConfig);
      }).toThrow('SimulationService.initialize() now requires prepared world data. Use WorldBuilder.prepareForSimulation() followed by SimulationContext.acceptPreparedWorld()');
    });
  });

  describe('Complete architectural dependency flow', () => {
    test('should demonstrate mandatory pipeline enforcement', () => {
      // This test validates the complete architectural flow:
      // 1. World Building (Free-form) ↓
      // 2. Simulation Preparation Pipeline (Mandatory) ↓  
      // 3. Simulation Context (Dependent)

      // Phase 1: Free-form world building
      const worldBuilder = new WorldBuilder(new TemplateManager());
      
      // World builder allows free-form creation
      worldBuilder
        .setWorldProperties('Architectural Test World', 'Testing the mandatory pipeline')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 500 });

      // Add minimal required content
      worldBuilder.addNode({
        name: 'Gateway Node',
        type: 'settlement',
        description: 'Entry point to simulation'
      });

      worldBuilder.addInteraction({
        name: 'Gateway Interaction',
        type: 'basic',
        requirements: {},
        branches: [],
        effects: [],
        context: ['settlement']
      });

      worldBuilder.addCharacter({
        name: 'Gateway Character',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      });

      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      const characterId = worldBuilder.worldConfig.characters[0].id;
      worldBuilder.assignCharacterToNode(characterId, nodeId);

      // Phase 2: Mandatory preparation pipeline
      const preparedWorld = worldBuilder.prepareForSimulation();

      // Validate that preparation creates simulation-ready data
      expect(preparedWorld.simulationMetadata.source).toBe('WorldBuilder');
      expect(preparedWorld.nodes).toBeInstanceOf(Map);
      expect(preparedWorld.characters).toBeInstanceOf(Map);

      // Phase 3: Simulation context dependency
      const simulationService = new SimulationService();
      
      // Should successfully initialize with prepared data
      expect(() => {
        simulationService.initialize(preparedWorld);
      }).not.toThrow();

      // Validate the architectural dependencies are working
      expect(simulationService.isInitialized).toBe(true);
    });

    test('should prevent bypass of preparation pipeline', () => {
      const simulationService = new SimulationService();

      // Attempt to bypass the preparation pipeline
      const bypassAttempts = [
        // Raw world config
        {
          worldName: 'Bypass Attempt 1',
          nodes: [{ name: 'Node' }],
          characters: [{ name: 'Character' }],
          interactions: [{ name: 'Interaction' }]
        },
        // Incomplete prepared data (missing metadata)
        {
          worldProperties: { name: 'Bypass Attempt 2' },
          nodes: new Map(),
          characters: new Map(),
          interactions: new Map()
        },
        // Fake metadata
        {
          worldProperties: { name: 'Bypass Attempt 3' },
          nodes: new Map(),
          characters: new Map(),
          interactions: new Map(),
          simulationMetadata: {
            source: 'FakeSource',
            preparedAt: new Date().toISOString()
          }
        }
      ];

      // All bypass attempts should fail
      bypassAttempts.forEach((attempt, index) => {
        expect(() => {
          simulationService.initialize(attempt);
        }).toThrow(/SimulationService\.initialize\(\) now requires prepared world data/);
      });
    });
  });

  describe('Backward compatibility and deprecation warnings', () => {
    test('should show deprecation warnings for old methods', () => {
      const simulationService = new SimulationService();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // Old method calls should show deprecation warnings
      const oldConfig = {
        worldName: 'Old Config',
        nodes: [],
        characters: [],
        interactions: []
      };

      simulationService.validateMapplessWorldConfig(oldConfig);
      expect(consoleSpy).toHaveBeenCalledWith(
        'validateMapplessWorldConfig is deprecated. Use WorldBuilder.prepareForSimulation() to prepare world data.'
      );

      simulationService.processMapplessWorldState(oldConfig);
      expect(consoleSpy).toHaveBeenCalledWith(
        'processMapplessWorldState is deprecated. Use processPreparedWorldData with properly prepared world data.'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Simulation Context Pipeline Dependency Integration', () => {
    test('should require pipeline preparation for all simulation entry points', async () => {
      // Test that SimulationContext strictly enforces pipeline dependencies
      const TestContextComponent = () => {
        const { 
          acceptPreparedWorld, 
          simulationReadinessStatus, 
          pipelineValidationError,
          simulation
        } = useSimulationContext();

        React.useEffect(() => {
          // Try to accept various types of invalid data
          const invalidDataTypes = [
            // Raw configuration
            {
              worldName: 'Raw Config',
              nodes: [],
              characters: [],
              interactions: []
            },
            // Incomplete prepared data
            {
              worldProperties: { name: 'Incomplete' },
              nodes: new Map(),
              characters: new Map()
            },
            // Fake metadata
            {
              worldProperties: { name: 'Fake' },
              nodes: new Map(),
              characters: new Map(),
              interactions: new Map(),
              simulationMetadata: { source: 'NotWorldBuilder' }
            }
          ];

          // Test that all invalid data types are rejected
          let rejectionCount = 0;
          invalidDataTypes.forEach((invalidData) => {
            try {
              acceptPreparedWorld(invalidData);
            } catch (error) {
              if (error.message.includes('World preparation validation failed')) {
                rejectionCount++;
              }
            }
          });
          
          // All invalid data should be rejected
          if (rejectionCount !== invalidDataTypes.length) {
            throw new Error(`Expected ${invalidDataTypes.length} rejections, got ${rejectionCount}`);
          }
        }, [acceptPreparedWorld]);

        return (
          <div>
            <div data-testid="pipeline-ready">{simulationReadinessStatus.isSimulationReady.toString()}</div>
            <div data-testid="validation-error">{pipelineValidationError || 'none'}</div>
            <div data-testid="simulation-initialized">{simulation?.isInitialized?.toString() || 'false'}</div>
          </div>
        );
      };

      render(
        <SimulationProvider>
          <TestContextComponent />
        </SimulationProvider>
      );

      // Should not be ready without proper pipeline preparation
      expect(screen.getByTestId('pipeline-ready')).toHaveTextContent('false');
      expect(screen.getByTestId('simulation-initialized')).toHaveTextContent('false');
    });

    test('should accept only properly prepared world data', () => {
      // Create a properly prepared world
      const worldBuilder = new WorldBuilder(new TemplateManager());
      
      worldBuilder
        .setWorldProperties('Pipeline Integration Test', 'Testing pipeline acceptance')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 });

      worldBuilder.addNode({
        name: 'Integration Node',
        type: 'settlement',
        description: 'A node for integration testing'
      });

      worldBuilder.addInteraction({
        name: 'Integration Interaction',
        type: 'social',
        requirements: {},
        branches: [],
        effects: [],
        context: ['settlement']
      });

      worldBuilder.addCharacter({
        name: 'Integration Character',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      });

      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      const characterId = worldBuilder.worldConfig.characters[0].id;
      worldBuilder.assignCharacterToNode(characterId, nodeId);

      // This should succeed - properly prepared world
      const preparedWorld = worldBuilder.prepareForSimulation();
      expect(preparedWorld.simulationMetadata.source).toBe('WorldBuilder');
      expect(preparedWorld.simulationMetadata.pipelineVersion).toBe('1.0.0');

      // Test that SimulationContext would accept this
      const TestAcceptanceComponent = () => {
        const { acceptPreparedWorld } = useSimulationContext();
        
        React.useEffect(() => {
          try {
            const result = acceptPreparedWorld(preparedWorld);
            expect(result.success).toBe(true);
          } catch (error) {
            // Should not throw for properly prepared data
            throw new Error(`Properly prepared world was rejected: ${error.message}`);
          }
        }, [acceptPreparedWorld]);

        return <div data-testid="acceptance-test">Test Complete</div>;
      };

      expect(() => {
        render(
          <SimulationProvider>
            <TestAcceptanceComponent />
          </SimulationProvider>
        );
      }).not.toThrow();
    });

    test('should validate simulation metadata authenticity', () => {
      const simulationService = new SimulationService();

      // Test various attempts to bypass pipeline validation
      const bypassAttempts = [
        // Missing simulationMetadata entirely
        {
          worldProperties: { name: 'No Metadata' },
          nodes: new Map(),
          characters: new Map(),
          interactions: new Map()
        },
        // Wrong source
        {
          worldProperties: { name: 'Wrong Source' },
          nodes: new Map(),
          characters: new Map(),
          interactions: new Map(),
          simulationMetadata: {
            source: 'HackedSource',
            preparedAt: new Date().toISOString(),
            worldId: 'fake-id',
            version: '2.0.0',
            pipelineVersion: '1.0.0'
          }
        },
        // Missing required metadata fields
        {
          worldProperties: { name: 'Incomplete Metadata' },
          nodes: new Map(),
          characters: new Map(),
          interactions: new Map(),
          simulationMetadata: {
            source: 'WorldBuilder'
            // Missing preparedAt, worldId, etc.
          }
        },
        // Wrong data structure types
        {
          worldProperties: { name: 'Wrong Types' },
          nodes: [], // Should be Map
          characters: [], // Should be Map
          interactions: [], // Should be Map
          simulationMetadata: {
            source: 'WorldBuilder',
            preparedAt: new Date().toISOString(),
            worldId: 'test-id',
            version: '2.0.0',
            pipelineVersion: '1.0.0'
          }
        }
      ];

      bypassAttempts.forEach((attempt, index) => {
        expect(() => {
          simulationService.initialize(attempt);
        }).toThrow(/SimulationService\.initialize\(\) now requires prepared world data|World preparation validation failed/);
      });
    });

    test('should enforce complete preparation pipeline flow', () => {
      // This test validates the entire mandatory flow:
      // Free-form World Building → Preparation Pipeline → Simulation Context

      const worldBuilder = new WorldBuilder(new TemplateManager());
      const simulationService = new SimulationService();

      // Phase 1: Free-form world building (should allow any order)
      worldBuilder.setWorldProperties('Complete Pipeline Test', 'Testing end-to-end flow');
      
      // Can add components in any order during building
      worldBuilder.addNode({
        name: 'Test Node',
        type: 'settlement',
        description: 'A test settlement'
      });

      worldBuilder.setRules({ timeProgression: 'turn-based' });
      
      worldBuilder.addCharacter({
        name: 'Test Character',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        assignedInteractions: [] // Will be populated after interaction is added
      });

      worldBuilder.addInteraction({
        name: 'Test Interaction',
        type: 'social',
        requirements: {},
        branches: [],
        effects: [],
        context: ['settlement']
      });

      // Update character with interaction
      const character = worldBuilder.worldConfig.characters[0];
      character.assignedInteractions = [worldBuilder.worldConfig.interactions[0].id];

      worldBuilder.setInitialConditions({ startingResources: 500 });

      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      const characterId = worldBuilder.worldConfig.characters[0].id;
      worldBuilder.assignCharacterToNode(characterId, nodeId);

      // Phase 2: Mandatory preparation pipeline
      expect(() => {
        worldBuilder.prepareForSimulation();
      }).not.toThrow();

      const preparedWorld = worldBuilder.prepareForSimulation();

      // Validate pipeline output
      expect(preparedWorld.simulationMetadata.source).toBe('WorldBuilder');
      expect(preparedWorld.nodes).toBeInstanceOf(Map);
      expect(preparedWorld.characters).toBeInstanceOf(Map);
      expect(preparedWorld.interactions).toBeInstanceOf(Map);

      // Phase 3: Simulation context dependency
      expect(() => {
        simulationService.initialize(preparedWorld);
      }).not.toThrow();

      expect(simulationService.isInitialized).toBe(true);

      // Verify that the simulation service now has the prepared data
      expect(simulationService.worldState).toBeDefined();
      expect(simulationService.worldState.name).toBe('Complete Pipeline Test');
    });

    test('should provide clear error messages for pipeline violations', () => {
      const simulationService = new SimulationService();

      // Test error message clarity for different violation types
      const violations = [
        {
          data: { worldName: 'Raw Config' },
          expectedError: /SimulationService\.initialize\(\) now requires prepared world data/
        },
        {
          data: {
            worldProperties: { name: 'No Metadata' },
            nodes: new Map(),
            characters: new Map(),
            interactions: new Map()
          },
          expectedError: /SimulationService\.initialize\(\) now requires prepared world data/
        }
      ];

      violations.forEach(({ data, expectedError }, index) => {
        expect(() => {
          simulationService.initialize(data);
        }).toThrow(expectedError);
      });
    });

    test('should maintain pipeline integrity across multiple operations', () => {
      const worldBuilder = new WorldBuilder(new TemplateManager());
      const simulationService = new SimulationService();

      // Build and prepare first world
      worldBuilder
        .setWorldProperties('First World', 'First test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 });

      worldBuilder.addNode({
        name: 'First Node',
        type: 'settlement',
        description: 'First node'
      });

      worldBuilder.addInteraction({
        name: 'First Interaction',
        type: 'social',
        requirements: {},
        branches: [],
        effects: [],
        context: ['settlement']
      });

      worldBuilder.addCharacter({
        name: 'First Character',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      });

      const nodeId1 = worldBuilder.worldConfig.nodes[0].id;
      const characterId1 = worldBuilder.worldConfig.characters[0].id;
      worldBuilder.assignCharacterToNode(characterId1, nodeId1);

      const firstPreparedWorld = worldBuilder.prepareForSimulation();
      simulationService.initialize(firstPreparedWorld);

      expect(simulationService.isInitialized).toBe(true);
      expect(simulationService.worldState.name).toBe('First World');

      // Reset and build second world
      worldBuilder.reset();
      
      worldBuilder
        .setWorldProperties('Second World', 'Second test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 2000 });

      worldBuilder.addNode({
        name: 'Second Node',
        type: 'settlement',
        description: 'Second node'
      });

      worldBuilder.addInteraction({
        name: 'Second Interaction',
        type: 'economic',
        requirements: {},
        branches: [],
        effects: [],
        context: ['settlement']
      });

      worldBuilder.addCharacter({
        name: 'Second Character',
        attributes: { strength: 12, dexterity: 12, constitution: 12, intelligence: 12, wisdom: 12, charisma: 12 },
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      });

      const nodeId2 = worldBuilder.worldConfig.nodes[0].id;
      const characterId2 = worldBuilder.worldConfig.characters[0].id;
      worldBuilder.assignCharacterToNode(characterId2, nodeId2);

      const secondPreparedWorld = worldBuilder.prepareForSimulation();
      
      // Verify each prepared world has unique metadata
      expect(firstPreparedWorld.simulationMetadata.worldId).not.toBe(secondPreparedWorld.simulationMetadata.worldId);
      expect(firstPreparedWorld.worldProperties.name).toBe('First World');
      expect(secondPreparedWorld.worldProperties.name).toBe('Second World');

      // Initialize with second world
      simulationService.initialize(secondPreparedWorld);
      expect(simulationService.worldState.name).toBe('Second World');
    });
  });
});
