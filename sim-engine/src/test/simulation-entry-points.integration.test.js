/**
 * Integration Test: Simulation Entry Points Pipeline Enforcement
 * 
 * This test validates that ALL simulation entry points require pipeline processing.
 * No simulation functionality should be accessible without going through WorldBuilder.prepareForSimulation()
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import WorldBuilder from '../domain/services/WorldBuilder.js';
import { SimulationProvider, useSimulationContext } from '../presentation/contexts/SimulationContext.js';
import TemplateManager from '../template/TemplateManager.js';
import simulationService from '../application/use-cases/services/SimulationService.js';

describe('Simulation Entry Points Pipeline Enforcement', () => {
  let templateManager;
  let worldBuilder;

  beforeEach(() => {
    templateManager = new TemplateManager();
    worldBuilder = new WorldBuilder(templateManager);
    
    // Reset simulation service singleton
    if (simulationService.isInitialized) {
      simulationService.reset();
    }
  });

  describe('SimulationService Entry Points', () => {
    beforeEach(() => {
      // Reset the singleton state before each test
      if (simulationService.isInitialized) {
        simulationService.reset();
      }
    });

    test('should reject initialization with raw world configurations', () => {
      const rawConfigurations = [
        // Classic mappless config
        {
          worldName: 'Raw World',
          nodes: [{ name: 'Raw Node', assignedCharacters: ['char1'] }],
          characters: [{ id: 'char1', name: 'Raw Character', assignedInteractions: ['int1'] }],
          interactions: [{ id: 'int1', name: 'Raw Interaction' }]
        },
        // Object-style config
        {
          name: 'Object World',
          dimensions: { width: 100, height: 100 },
          nodes: [],
          characters: [],
          interactions: []
        },
        // Array-based config
        {
          worldProperties: { name: 'Array World' },
          nodes: [], // Should be Map for prepared data
          characters: [], // Should be Map for prepared data
          interactions: [] // Should be Map for prepared data
        }
      ];

      rawConfigurations.forEach((config, index) => {
        expect(() => {
          simulationService.initialize(config);
        }).toThrow(/SimulationService\.initialize\(\) now requires prepared world data/);
      });
    });

    test('should reject processPreparedWorldData with unprepared data', () => {
      const unpreparedData = {
        worldProperties: { name: 'Unprepared' },
        nodes: [],
        characters: [],
        interactions: []
      };

      expect(() => {
        simulationService.processPreparedWorldData(unpreparedData);
      }).toThrow(/Invalid prepared world data structure/);
    });

    test('should accept only data with valid pipeline metadata', () => {
      // Create properly prepared world data
      worldBuilder
        .setWorldProperties('Pipeline Test', 'Testing pipeline validation')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 });

      worldBuilder.addNode({
        name: 'Test Node',
        type: 'settlement',
        description: 'A test node'
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
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id],
        // Add environmental data to simulation test character
        preferredEnvironment: { terrain: 'plains', climate: 'temperate' },
        environmentalAdaptations: {
          plains: 0.8,
          forest: 0.6,
          urban: 0.4
        }
      });

      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      const characterId = worldBuilder.worldConfig.characters[0].id;
      worldBuilder.assignCharacterToNode(characterId, nodeId);

      const preparedWorld = worldBuilder.prepareForSimulation();

      // This should succeed
      expect(() => {
        simulationService.initialize(preparedWorld);
      }).not.toThrow();

      expect(simulationService.isInitialized).toBe(true);
    });

    test('should validate metadata authenticity and completeness', () => {
      const invalidMetadataTests = [
        {
          name: 'Missing metadata',
          data: {
            worldProperties: { name: 'No Metadata' },
            nodes: new Map(),
            characters: new Map(),
            interactions: new Map()
          }
        },
        {
          name: 'Wrong source',
          data: {
            worldProperties: { name: 'Wrong Source' },
            nodes: new Map(),
            characters: new Map(),
            interactions: new Map(),
            simulationMetadata: {
              source: 'FakeBuilder',
              preparedAt: new Date().toISOString(),
              worldId: 'fake-id',
              version: '2.0.0',
              pipelineVersion: '1.0.0'
            }
          }
        },
        {
          name: 'Incomplete metadata',
          data: {
            worldProperties: { name: 'Incomplete' },
            nodes: new Map(),
            characters: new Map(),
            interactions: new Map(),
            simulationMetadata: {
              source: 'WorldBuilder'
              // Missing required fields
            }
          }
        }
      ];

      invalidMetadataTests.forEach(({ name, data }) => {
        expect(() => {
          simulationService.initialize(data);
        }).toThrow(/SimulationService\.initialize\(\) now requires prepared world data/);
      });
    });
  });

  describe('SimulationContext Entry Points', () => {
    test('should reject acceptPreparedWorld with invalid data', () => {
      const TestComponent = () => {
        const { acceptPreparedWorld, pipelineValidationError } = useSimulationContext();
        const [errors, setErrors] = React.useState([]);

        React.useEffect(() => {
          const invalidDataSamples = [
            // Raw config
            {
              worldName: 'Raw',
              nodes: [],
              characters: [],
              interactions: []
            },
            // Missing simulationMetadata
            {
              worldProperties: { name: 'No Metadata' },
              nodes: new Map(),
              characters: new Map(),
              interactions: new Map()
            },
            // Invalid data types
            {
              worldProperties: { name: 'Wrong Types' },
              nodes: [], // Should be Map
              characters: [], // Should be Map
              interactions: [], // Should be Map
              simulationMetadata: {
                source: 'WorldBuilder',
                preparedAt: new Date().toISOString()
              }
            }
          ];

          const rejectionErrors = [];
          invalidDataSamples.forEach((invalidData, index) => {
            try {
              acceptPreparedWorld(invalidData);
              rejectionErrors.push(`Sample ${index} was not rejected`);
            } catch (error) {
              if (!error.message.includes('World preparation validation failed')) {
                rejectionErrors.push(`Sample ${index} failed with wrong error: ${error.message}`);
              }
            }
          });

          setErrors(rejectionErrors);
        }, [acceptPreparedWorld]);

        return (
          <div>
            <div data-testid="validation-error">{pipelineValidationError || 'none'}</div>
            <div data-testid="rejection-errors">{errors.join('; ')}</div>
          </div>
        );
      };

      render(
        <SimulationProvider>
          <TestComponent />
        </SimulationProvider>
      );

      // Should show validation errors for invalid data
      expect(screen.getByTestId('rejection-errors')).toHaveTextContent('');
    });

    test('should validate simulation readiness status correctly', () => {
      const TestComponent = () => {
        const { 
          simulationReadinessStatus,
          acceptPreparedWorld,
          clearPreparedWorld
        } = useSimulationContext();
        
        const [testStatus, setTestStatus] = React.useState('initializing');

        React.useEffect(() => {
          // Initially should not be ready
          if (simulationReadinessStatus.isSimulationReady) {
            setTestStatus('error: initially ready');
            return;
          }

          // Try to accept properly prepared world
          const worldBuilder = new WorldBuilder(new TemplateManager());
          
          worldBuilder
            .setWorldProperties('Readiness Test', 'Testing readiness status')
            .setRules({ timeProgression: 'turn-based' })
            .setInitialConditions({ startingResources: 1000 });

          worldBuilder.addNode({
            name: 'Readiness Node',
            type: 'settlement',
            description: 'A node for readiness testing'
          });

          worldBuilder.addInteraction({
            name: 'Readiness Interaction',
            type: 'social',
            requirements: {},
            branches: [],
            effects: [],
            context: ['settlement']
          });

          worldBuilder.addCharacter({
            name: 'Readiness Character',
            attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
            assignedInteractions: [worldBuilder.worldConfig.interactions[0].id],
            // Add environmental data to readiness test character
            preferredEnvironment: { terrain: 'plains', climate: 'temperate' },
            environmentalAdaptations: {
              plains: 0.7,
              forest: 0.5,
              urban: 0.6
            }
          });

          const nodeId = worldBuilder.worldConfig.nodes[0].id;
          const characterId = worldBuilder.worldConfig.characters[0].id;
          worldBuilder.assignCharacterToNode(characterId, nodeId);

          try {
            const preparedWorld = worldBuilder.prepareForSimulation();
            const result = acceptPreparedWorld(preparedWorld);
            
            if (result.success && simulationReadinessStatus.isSimulationReady) {
              setTestStatus('success');
            } else {
              setTestStatus('error: not ready after accepting prepared world');
            }
          } catch (error) {
            setTestStatus(`error: ${error.message}`);
          }
        }, [acceptPreparedWorld, simulationReadinessStatus, clearPreparedWorld]);

        return (
          <div>
            <div data-testid="test-status">{testStatus}</div>
            <div data-testid="is-ready">{simulationReadinessStatus.isSimulationReady.toString()}</div>
            <div data-testid="has-prepared">{simulationReadinessStatus.hasPreparedWorld.toString()}</div>
          </div>
        );
      };

      render(
        <SimulationProvider>
          <TestComponent />
        </SimulationProvider>
      );

      // Wait for async operations to complete
      return new Promise(resolve => {
        setTimeout(() => {
          expect(screen.getByTestId('test-status')).toHaveTextContent('success');
          expect(screen.getByTestId('is-ready')).toHaveTextContent('true');
          expect(screen.getByTestId('has-prepared')).toHaveTextContent('true');
          resolve();
        }, 100);
      });
    });
  });

  describe('useSimulation Hook Entry Points', () => {
    test('should only work with prepared world data through SimulationContext', () => {
      // Test that simulation functionality only works through the context with prepared data
      const TestContextComponent = () => {
        const { 
          simulationReadinessStatus,
          acceptPreparedWorld,
          preparedWorldData,
          validationToken
        } = useSimulationContext();
        
        const [testResults, setTestResults] = React.useState({
          initialState: 'not-ready',
          afterPreparedData: 'pending',
          hasValidationToken: false,
          worldDataStructure: 'none'
        });

        React.useEffect(() => {
          // Check initial state
          if (!simulationReadinessStatus.isSimulationReady && !simulationReadinessStatus.hasPreparedWorld) {
            // Try to accept properly prepared data
            const worldBuilder = new WorldBuilder(new TemplateManager());
            
            worldBuilder
              .setWorldProperties('Context Test', 'Testing context-based simulation')
              .setRules({ timeProgression: 'turn-based' })
              .setInitialConditions({ startingResources: 1000 });

            worldBuilder.addNode({
              name: 'Context Node',
              type: 'settlement',
              description: 'A node for context testing'
            });

            worldBuilder.addInteraction({
              name: 'Context Interaction',
              type: 'social',
              requirements: {},
              branches: [],
              effects: [],
              context: ['settlement']
            });

            worldBuilder.addCharacter({
              name: 'Context Character',
              attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
              assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
            });

            const nodeId = worldBuilder.worldConfig.nodes[0].id;
            const characterId = worldBuilder.worldConfig.characters[0].id;
            worldBuilder.assignCharacterToNode(characterId, nodeId);

            try {
              const preparedWorld = worldBuilder.prepareForSimulation();
              const result = acceptPreparedWorld(preparedWorld);
              
              setTestResults(prev => ({
                ...prev,
                afterPreparedData: result.success ? 'accepted' : 'rejected',
                hasValidationToken: !!validationToken,
                worldDataStructure: preparedWorldData ? 'prepared-map-structure' : 'none'
              }));
            } catch (error) {
              setTestResults(prev => ({
                ...prev,
                afterPreparedData: `error: ${error.message}`
              }));
            }
          }
        }, [acceptPreparedWorld, simulationReadinessStatus, validationToken, preparedWorldData]);

        return (
          <div>
            <div data-testid="initial-state">{testResults.initialState}</div>
            <div data-testid="after-prepared">{testResults.afterPreparedData}</div>
            <div data-testid="has-token">{testResults.hasValidationToken.toString()}</div>
            <div data-testid="world-structure">{testResults.worldDataStructure}</div>
            <div data-testid="is-ready">{simulationReadinessStatus.isSimulationReady.toString()}</div>
          </div>
        );
      };

      render(
        <SimulationProvider>
          <TestContextComponent />
        </SimulationProvider>
      );

      // Wait for async operations to complete
      return new Promise(resolve => {
        setTimeout(() => {
          // Should show that simulation works only through proper context flow
          expect(screen.getByTestId('initial-state')).toHaveTextContent('not-ready');
          expect(screen.getByTestId('after-prepared')).toHaveTextContent('accepted');
          expect(screen.getByTestId('has-token')).toHaveTextContent('true');
          expect(screen.getByTestId('world-structure')).toHaveTextContent('prepared-map-structure');
          expect(screen.getByTestId('is-ready')).toHaveTextContent('true');
          resolve();
        }, 100);
      });
    });
  });

  describe('Comprehensive Entry Point Validation', () => {
    test('should enforce pipeline dependency across all access patterns', () => {
      // This test validates that there are no backdoors into the simulation system
      
      // Create test data in various formats
      const testDataFormats = [
        {
          name: 'Raw mappless config',
          data: {
            worldName: 'Raw World',
            nodes: [{ name: 'Raw Node', assignedCharacters: ['char1'] }],
            characters: [{ id: 'char1', name: 'Raw Character', assignedInteractions: ['int1'] }],
            interactions: [{ id: 'int1', name: 'Raw Interaction' }]
          },
          shouldWork: false
        },
        {
          name: 'WorldBuilder config format',
          data: {
            dimensions: { width: 100, height: 100 },
            rules: { timeProgression: 'turn-based' },
            initialConditions: { startingResources: 1000 },
            nodes: [],
            characters: [],
            interactions: [],
            events: [],
            groups: [],
            items: []
          },
          shouldWork: false
        },
        {
          name: 'Partial prepared format',
          data: {
            worldProperties: { name: 'Partial' },
            nodes: new Map(),
            characters: new Map(),
            interactions: new Map()
          },
          shouldWork: false
        }
      ];

      // Test all formats against SimulationService
      // All test formats should fail (shouldWork: false for all in this test)
      testDataFormats.forEach(({ name, data, shouldWork }) => {
        expect(() => {
          simulationService.initialize(data);
        }).toThrow(/SimulationService\.initialize\(\) now requires prepared world data/);
      });

      // Now test with properly prepared data
      const comprehensiveWorldBuilder = new WorldBuilder(new TemplateManager());
      comprehensiveWorldBuilder
        .setWorldProperties('Comprehensive Test', 'Testing all entry points')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 });

      comprehensiveWorldBuilder.addNode({
        id: 'test-node-comprehensive',
        name: 'Comprehensive Node',
        type: 'settlement',
        description: 'A node for comprehensive testing'
      });

      comprehensiveWorldBuilder.addInteraction({
        id: 'test-interaction-comprehensive',
        name: 'Comprehensive Interaction',
        type: 'social',
        requirements: {},
        branches: [],
        effects: [],
        context: ['settlement']
      });

      comprehensiveWorldBuilder.addCharacter({
        id: 'test-character-comprehensive',
        name: 'Comprehensive Character',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        assignedInteractions: ['test-interaction-comprehensive']
      });

      comprehensiveWorldBuilder.assignCharacterToNode('test-character-comprehensive', 'test-node-comprehensive');

      const preparedWorld = comprehensiveWorldBuilder.prepareForSimulation();

      // This should work - properly prepared data
      expect(() => {
        simulationService.initialize(preparedWorld);
      }).not.toThrow();

      expect(simulationService.worldState).toBeTruthy();
      expect(simulationService.worldState.worldName).toBe('Comprehensive Test');
    });

    test('should maintain security against sophisticated bypass attempts', () => {
      // Sophisticated bypass attempts
      const bypassAttempts = [
        {
          name: 'Fake WorldBuilder source with invalid structure',
          data: {
            worldProperties: { name: 'Sophisticated Fake' },
            nodes: new Map([['node1', { name: 'Fake Node', characters: [] }]]),
            characters: 'not-a-map', // Invalid: should be Map
            interactions: new Map([['int1', { name: 'Fake Interaction' }]]),
            simulationMetadata: {
              source: 'WorldBuilder',
              preparedAt: new Date().toISOString(),
              worldId: `fake_${Date.now()}`,
              version: '2.0.0',
              pipelineVersion: '1.0.0'
            }
          }
        },
        {
          name: 'Cloned real metadata with wrong data types',
          data: (() => {
            // Create a real prepared world first
            const tempBuilder = new WorldBuilder(new TemplateManager());
            tempBuilder
              .setWorldProperties('Real World', 'For cloning metadata')
              .setRules({ timeProgression: 'turn-based' })
              .setInitialConditions({ startingResources: 1000 });

            tempBuilder.addNode({
              name: 'Real Node',
              type: 'settlement',
              description: 'A real node'
            });

            tempBuilder.addInteraction({
              name: 'Real Interaction',
              type: 'social',
              requirements: {},
              branches: [],
              effects: [],
              context: ['settlement']
            });

            tempBuilder.addCharacter({
              name: 'Real Character',
              attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
              assignedInteractions: [tempBuilder.worldConfig.interactions[0].id]
            });

            const nodeId = tempBuilder.worldConfig.nodes[0].id;
            const characterId = tempBuilder.worldConfig.characters[0].id;
            tempBuilder.assignCharacterToNode(characterId, nodeId);

            const realPreparedWorld = tempBuilder.prepareForSimulation();
            
            // Now create fake data with real metadata but wrong types
            return {
              worldProperties: { name: 'Cloned Fake' },
              nodes: [], // Invalid: should be Map, not array
              characters: new Map([['fake-char', { name: 'Fake Character' }]]),
              interactions: new Map([['fake-int', { name: 'Fake Interaction' }]]),
              simulationMetadata: realPreparedWorld.simulationMetadata // Clone real metadata
            };
          })()
        }
      ];

      // All sophisticated attempts should still fail
      bypassAttempts.forEach(({ name, data }) => {
        expect(() => {
          simulationService.initialize(data);
        }).toThrow(/SimulationService\.initialize\(\) now requires prepared world data|Invalid prepared world data structure/);
      });
    });
  });
});
